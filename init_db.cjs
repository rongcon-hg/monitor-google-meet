const { Client } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_ASa5r1sjmMTI@ep-mute-forest-azzpwvht-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const client = new Client({
  connectionString: DATABASE_URL,
});

async function initDB() {
  try {
    await client.connect();
    console.log('Connected to Neon Database successfully!');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS meetings_history (
        meeting_code VARCHAR(255) PRIMARY KEY,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        participant_count INT,
        event_count INT,
        participants JSONB,
        events JSONB,
        last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createTableQuery);
    console.log('Table meetings_history initialized successfully!');
  } catch (err) {
    console.error('Error initializing database', err);
  } finally {
    await client.end();
  }
}

initDB();
