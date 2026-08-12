import React from 'react';
import { format } from 'date-fns';

export function AuditLog({ events = [] }) {
  // Sort descending for log view
  const reversedEvents = [...events].sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-title">
        <span style={{ color: 'var(--accent-primary)' }}>Nhật Ký Sự Kiện Cuộc Gọi (Live Audit Log)</span>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '8px' }}>
        {reversedEvents.map((evt) => (
          <div key={evt.id} style={{ 
            fontSize: '13px', 
            background: 'rgba(255,255,255,0.02)', 
            padding: '10px 12px', 
            borderRadius: '6px',
            borderLeft: '2px solid var(--accent-primary)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', minWidth: '60px' }}>
              {format(new Date(evt.time), 'HH:mm:ss')}
            </span>
            <span style={{ color: 'var(--text-primary)' }}>
              <strong>{evt.actorName}</strong> đã phát sinh sự kiện <em style={{opacity: 0.7}}>({evt.eventName})</em>.
            </span>
          </div>
        ))}
        {events.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
            Chưa có sự kiện nào.
          </div>
        )}
      </div>
    </div>
  );
}
