import React, { useState } from 'react';
import { format } from 'date-fns';

export function ParticipantList({ participants }) {
  const [search, setSearch] = useState('');

  const filtered = participants.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="card-title" style={{ marginBottom: '16px' }}>
        <span>Danh Sách Thành Viên</span>
        <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px' }}>{participants.length}</span>
      </div>
      
      <input 
        type="text" 
        className="search-bar" 
        placeholder="Tìm kiếm tên, email..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.map(p => (
          <div key={p.id} className="participant-item">
            <div className="participant-info">
              <div className="avatar">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: '500' }}>{p.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.email}</div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {format(new Date(p.joinTime), 'HH:mm')}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
            Không tìm thấy ai.
          </div>
        )}
      </div>
    </div>
  );
}
