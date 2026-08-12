import React, { useState } from 'react';
import { RefreshCw, Users, Server, Activity, AlertTriangle, Download } from 'lucide-react';
import { useWorkspaceMeetings } from './engine/api';
import { exportMeetingsToExcel } from './utils/export';
import { format } from 'date-fns';
import './App.css';
import './index.css';

function App() {
  const { meetings, isLoading, error, lastUpdated, fetchMeetings } = useWorkspaceMeetings();
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const totalParticipants = meetings.reduce((acc, m) => acc + m.participants.length, 0);

  const handleExport = () => {
    exportMeetingsToExcel(meetings);
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">
          <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Server color="white" />
          </div>
          <h1>Google Workspace - Meet Admin Monitor</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Cập nhật lần cuối: {lastUpdated ? format(lastUpdated, 'HH:mm:ss') : 'Chưa có'}
          </span>
          <button className="btn" onClick={fetchMeetings} disabled={isLoading}>
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> 
            {isLoading ? 'Đang tải...' : 'Làm mới'}
          </button>
          <button className="btn btn-secondary" onClick={handleExport} disabled={meetings.length === 0} title="Xuất báo cáo Excel">
            <Download size={16} /> Xuất Excel
          </button>
        </div>
      </header>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '16px', borderRadius: '8px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <AlertTriangle size={20} />
          <span><strong>Lỗi kết nối API:</strong> {error}. Hãy đảm bảo bạn đã điền Biến môi trường trên Vercel.</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '12px', color: 'var(--accent-primary)' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Tổng số cuộc gọi (Domain)</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{meetings.length}</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px', color: 'var(--success)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Tổng người tham gia</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{totalParticipants}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="main-content">
          <div className="glass-card animate-fade-in" style={{ overflowX: 'auto', minHeight: '400px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Danh sách Cuộc gọi toàn hệ thống</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Mã phòng</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Số người</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Bắt đầu</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Kết thúc (Gần nhất)</th>
                  <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', background: selectedMeeting?.id === m.id ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                      {m.code.match(/.{1,3}/g)?.join('-') || m.code}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} color="var(--text-secondary)" /> {m.participants.length}
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                      {m.startTime ? format(new Date(m.startTime), 'HH:mm - dd/MM') : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>
                      {m.endTime ? format(new Date(m.endTime), 'HH:mm - dd/MM') : 'N/A'}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setSelectedMeeting(m)}>
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
                {meetings.length === 0 && !isLoading && !error && (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Không tìm thấy cuộc gọi nào trong hệ thống.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sidebar">
          {selectedMeeting ? (
            <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '16px', color: 'var(--accent-primary)' }}>
                Chi tiết phòng: {selectedMeeting.code}
              </h3>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '12px' }}>
                Tổng số sự kiện (Events): {selectedMeeting.eventCount}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
                <strong style={{ fontSize: '14px' }}>Danh sách người tham dự:</strong>
                {selectedMeeting.participants.map(p => (
                  <div key={p.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px' }}>
                    <div style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 'bold', fontSize: '12px'
                    }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{p.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '400px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Users size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              Chọn một phòng họp để xem chi tiết danh sách người tham gia.
              <br/><br/>
              <span style={{ fontSize: '12px', fontStyle: 'italic', opacity: 0.7 }}>
                Lưu ý: API toàn cục không cung cấp dữ liệu Chat hoặc trạng thái Mic/Cam thời gian thực.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
