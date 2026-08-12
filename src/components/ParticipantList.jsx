import React, { useState } from 'react';
import { format } from 'date-fns';

export function ParticipantList({ participants, organizerEmail }) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Xếp hạng ưu tiên: 1 (Organizer), 2 (Internal), 3 (External)
  const orgDomain = organizerEmail ? organizerEmail.split('@')[1] : 'rongcon.net';

  const getPriority = (email) => {
    if (!email) return 3;
    if (organizerEmail && email === organizerEmail) return 1;
    if (email.endsWith(`@${orgDomain}`)) return 2;
    return 3;
  };

  const sortedParticipants = [...participants].sort((a, b) => {
    const pA = getPriority(a.email);
    const pB = getPriority(b.email);
    if (pA !== pB) return pA - pB;
    // Cùng hạng thì sắp xếp theo tên
    return a.name.localeCompare(b.name);
  });

  const filtered = sortedParticipants.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

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
        {paginated.map(p => {
          const priority = getPriority(p.email);
          return (
          <div key={p.id} className="participant-item">
            <div className="participant-info">
              <div className="avatar">
                {p.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {p.name}
                  {priority === 1 && (
                    <span style={{ fontSize: '10px', background: 'var(--accent-secondary)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                      Host
                    </span>
                  )}
                  {priority === 3 && p.email !== 'Khách (Ẩn danh)' && (
                    <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                      Khách ngoài
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.email}</div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'right' }}>
              <div style={{ color: 'var(--success)' }}>Vào: {format(new Date(p.joinTime), 'HH:mm:ss')}</div>
              <div style={{ color: 'var(--danger)', opacity: 0.8 }}>Ra: {format(new Date(p.leaveTime), 'HH:mm:ss')}</div>
            </div>
          </div>
        )})}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
            Không tìm thấy ai.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--card-border)' }}>
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
