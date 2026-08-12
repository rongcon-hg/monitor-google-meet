import { google } from 'googleapis';

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
        if (!meetings[meetCode]) {
          meetings[meetCode] = { 
            id: meetCode,
            code: meetCode, 
            participants: [], 
            eventCount: 0, 
            lastActive: event.id.time 
          };
        }
        meetings[meetCode].eventCount += 1;
        
        const actorEmail = event.actor ? event.actor.email : 'Unknown User';
        if (!meetings[meetCode].participants.find(p => p.email === actorEmail)) {
          // Check to prevent crash if email is somehow missing/undefined
          const namePart = actorEmail && typeof actorEmail === 'string' ? actorEmail.split('@')[0] : 'Unknown';
          meetings[meetCode].participants.push({
            id: actorEmail,
            email: actorEmail,
            name: namePart,
            joinTime: event.id.time
          });
        }
      }
    });

    const activeMeetings = Object.values(meetings);

    res.status(200).json({ success: true, data: activeMeetings, totalEvents: events.length });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
