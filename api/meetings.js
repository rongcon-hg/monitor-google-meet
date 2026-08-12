import { google } from 'googleapis';
import pg from 'pg';

export default async function handler(req, res) {
  // Cấu hình CORS cho phép Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const SCOPES = ['https://www.googleapis.com/auth/admin.reports.audit.readonly'];
    const ADMIN_EMAIL = 'rongcon@rongcon.net';
    
    // Kiểm tra biến môi trường
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: "Thiếu thông tin xác thực Google (GOOGLE_CLIENT_EMAIL hoặc GOOGLE_PRIVATE_KEY) trong Environment Variables của Vercel." 
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // Replace escaped newlines if they exist
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: SCOPES,
      clientOptions: {
        subject: ADMIN_EMAIL
      }
    });

    const admin = google.admin({ version: 'reports_v1', auth });

    const response = await admin.activities.list({
      userKey: 'all',
      applicationName: 'meet',
      maxResults: 100, 
    });

    const events = response.data.items || [];
    
    const meetings = {};
    events.forEach(event => {
      const eventDetails = event.events[0] || {};
      const params = eventDetails.parameters || [];
      
      const meetCodeParam = params.find(p => p.name === 'meeting_code');
      const meetCode = meetCodeParam ? meetCodeParam.value : null;
      
      if (meetCode) {
        const eventTime = new Date(event.id.time).getTime();
        
        if (!meetings[meetCode]) {
          meetings[meetCode] = { 
            id: meetCode,
            code: meetCode, 
            participants: [], 
            eventCount: 0, 
            lastActive: event.id.time,
            startTime: event.id.time,
            endTime: event.id.time,
            events: [],
            _minTime: eventTime,
            _maxTime: eventTime
          };
        }
        
        meetings[meetCode].eventCount += 1;
        
        // Cập nhật startTime và endTime
        if (eventTime < meetings[meetCode]._minTime) {
          meetings[meetCode]._minTime = eventTime;
          meetings[meetCode].startTime = event.id.time;
        }
        if (eventTime > meetings[meetCode]._maxTime) {
          meetings[meetCode]._maxTime = eventTime;
          meetings[meetCode].endTime = event.id.time;
          meetings[meetCode].lastActive = event.id.time;
        }
        
        const params = event.events[0]?.parameters || [];
        const paramMap = {};
        params.forEach(p => paramMap[p.name] = p.value || p.intValue || p.boolValue);

        if (paramMap['organizer_email'] && !meetings[meetCode].organizerEmail) {
          meetings[meetCode].organizerEmail = paramMap['organizer_email'];
        }

        const actorEmail = event.actor?.email || paramMap['identifier'] || 'Khách (Ẩn danh)';
        const namePart = paramMap['display_name'] || (actorEmail.includes('@') ? actorEmail.split('@')[0] : actorEmail);
        
        let participant = meetings[meetCode].participants.find(p => p.email === actorEmail);
        if (!participant) {
          participant = {
            id: actorEmail,
            email: actorEmail,
            name: namePart,
            joinTime: event.id.time,
            leaveTime: null,
            status: 'active'
          };
          meetings[meetCode].participants.push(participant);
          // We will calculate precise join/leave times later after collecting all events
        }

        // Đưa sự kiện vào danh sách nhật ký
        meetings[meetCode].events.push({
          id: `${event.id.time}-${actorEmail}-${Math.random().toString(36).substr(2, 9)}`,
          time: event.id.time,
          actorName: namePart,
          actorEmail: actorEmail,
          eventName: event.events[0]?.name || 'unknown_event',
          params: paramMap
        });
      }
    });

    const activeMeetings = Object.values(meetings).map(m => {
      delete m._minTime;
      delete m._maxTime;
      m.participants.forEach(p => {
        // Sort participant events by time
        const pEvents = m.events.filter(e => e.actorEmail === p.email).sort((a, b) => new Date(a.time) - new Date(b.time));
        if (pEvents.length > 0) {
          p.joinTime = pEvents[0].time;
          const lastEvent = pEvents[pEvents.length - 1];
          if (lastEvent.eventName === 'call_ended') {
            p.leaveTime = lastEvent.time;
            p.status = 'left';
          } else {
            p.leaveTime = null;
            p.status = 'active';
          }
        }
        delete p._minTime;
        delete p._maxTime;
      });
      // Sort events by time ascending
      m.events.sort((a, b) => new Date(a.time) - new Date(b.time));
      return m;
    });

    // -------- UPSERT INTO NEON POSTGRES --------
    if (process.env.DATABASE_URL && activeMeetings.length > 0) {
      const client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
      });
      
      try {
        await client.connect();
        for (const m of activeMeetings) {
          const query = `
            INSERT INTO meetings_history (meeting_code, start_time, end_time, participant_count, event_count, participants, events, last_synced)
            VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
            ON CONFLICT (meeting_code) DO UPDATE SET 
              end_time = EXCLUDED.end_time,
              participant_count = EXCLUDED.participant_count,
              event_count = EXCLUDED.event_count,
              participants = EXCLUDED.participants,
              events = EXCLUDED.events,
              last_synced = CURRENT_TIMESTAMP;
          `;
          await client.query(query, [
            m.code, 
            m.startTime, 
            m.endTime, 
            m.participants.length, 
            m.eventCount, 
            JSON.stringify(m.participants), 
            JSON.stringify(m.events)
          ]);
        }
      } catch (dbErr) {
        console.error("Lỗi khi lưu vào PostgreSQL:", dbErr);
      } finally {
        await client.end();
      }
    }
    // ------------------------------------------

    res.status(200).json({
      success: true,
      lastUpdated: new Date().toISOString(),
      meetings: activeMeetings,
      totalEventsFound: activeMeetings.reduce((sum, m) => sum + m.eventCount, 0)
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
