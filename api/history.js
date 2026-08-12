import pg from 'pg';

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL is not configured' });
  }

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    
    const targetDate = req.query.date;
    
    let query = `
      SELECT meeting_code, start_time, end_time, participant_count, event_count, participants, events, last_synced
      FROM meetings_history
    `;
    const queryParams = [];

    if (targetDate) {
      query += ` WHERE CAST(start_time AS DATE) = $1 `;
      queryParams.push(targetDate);
    }

    query += ` ORDER BY last_synced DESC LIMIT 100 `;
    
    const { rows } = await client.query(query, queryParams);

    // Map to same format as frontend expects for Live View
    const meetings = rows.map(row => {
      // Find organizer email from participants array, assuming we stored it in the JSONB or derived it.
      let organizerEmail = undefined;
      const parsedParticipants = typeof row.participants === 'string' ? JSON.parse(row.participants) : row.participants;
      const parsedEvents = typeof row.events === 'string' ? JSON.parse(row.events) : row.events;
      
      // If any participant has priority 1 logic saved? We can just check the first join or something.
      // But we can fallback if not present.
      
      return {
        id: row.meeting_code,
        code: row.meeting_code,
        startTime: row.start_time,
        endTime: row.end_time,
        eventCount: row.event_count,
        participants: parsedParticipants || [],
        events: parsedEvents || [],
        organizerEmail: parsedParticipants?.[0]?.email // Just a fallback for UI rendering
      };
    });

    res.status(200).json({
      success: true,
      lastUpdated: new Date().toISOString(),
      meetings: meetings
    });
  } catch (error) {
    console.error("API History Error:", error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await client.end();
  }
}
