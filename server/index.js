const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');

const app = express();
app.use(cors());

// Configure Google Auth
const SCOPES = ['https://www.googleapis.com/auth/admin.reports.audit.readonly'];
const ADMIN_EMAIL = 'rongcon@rongcon.net';

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, 'service-account.json'),
  scopes: SCOPES,
  clientOptions: {
    subject: ADMIN_EMAIL
  }
});

const admin = google.admin({ version: 'reports_v1', auth });

app.get('/api/meetings', async (req, res) => {
  try {
    // Lấy báo cáo sự kiện của ứng dụng Meet
    const response = await admin.activities.list({
      userKey: 'all',
      applicationName: 'meet',
      maxResults: 100, 
    });

    const events = response.data.items || [];
    
    // Nhóm các sự kiện theo meeting_code để tạo danh sách phòng họp
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
        // Thêm người tham gia nếu chưa có trong mảng
        if (!meetings[meetCode].participants.find(p => p.email === actorEmail)) {
          meetings[meetCode].participants.push({
            id: actorEmail,
            email: actorEmail,
            name: actorEmail.split('@')[0], // Lấy tên từ email
            joinTime: event.id.time
          });
        }
      }
    });

    // Chuyển object thành mảng
    const activeMeetings = Object.values(meetings);

    res.json({ success: true, data: activeMeetings, totalEvents: events.length });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend Server listening on port ${PORT}`);
});
