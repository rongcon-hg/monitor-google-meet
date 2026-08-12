import React, { useState } from 'react';
import { format } from 'date-fns';

export function AuditLog({ events = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Sort descending for log view
  const reversedEvents = [...events].sort((a, b) => new Date(b.time) - new Date(a.time));

  const totalPages = Math.ceil(reversedEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = reversedEvents.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 if events change significantly
  React.useEffect(() => {
    setCurrentPage(1);
  }, [events.length]);

  return (
    <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-title">
        <span style={{ color: 'var(--accent-primary)' }}>Nhật Ký Sự Kiện Cuộc Gọi (Live Audit Log)</span>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '8px' }}>
        {paginated.map((evt) => (
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

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--card-border)' }}>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '4px 12px', fontSize: '12px' }}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Trang trước
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Trang {currentPage} / {totalPages}</span>
          <button 
            className="btn btn-secondary" 
            style={{ padding: '4px 12px', fontSize: '12px' }}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}
