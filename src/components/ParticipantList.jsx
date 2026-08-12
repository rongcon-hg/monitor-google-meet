import React from 'react';
import { Mic, MicOff, Video, VideoOff, Hand, MonitorUp, Activity } from 'lucide-react';

export function ParticipantList({ participants }) {
  return (
    <div className="glass-card animate-fade-in" style={{ overflowX: 'auto' }}>
      <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Danh sách người tham dự ({participants.length})</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
            <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Họ và tên</th>
            <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Trạng thái</th>
            <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Thời lượng phát biểu</th>
            <th style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>Chỉ số tích cực</th>
          </tr>
        </thead>
        <tbody>
          {participants.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
              <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', fontSize: '14px'
                }}>
                  {p.name.charAt(0)}
                </div>
                {p.name}
                {p.handRaised && <Hand size={16} color="var(--warning)" className="animate-pulse" />}
                {p.screenSharing && <MonitorUp size={16} color="var(--success)" className="animate-pulse" />}
              </td>
              <td style={{ padding: '12px 8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {p.micOn ? <Mic size={18} color="var(--success)" /> : <MicOff size={18} color="var(--danger)" />}
                  {p.camOn ? <Video size={18} color="var(--accent-primary)" /> : <VideoOff size={18} color="var(--text-secondary)" />}
                </div>
              </td>
              <td style={{ padding: '12px 8px' }}>
                {p.talkTime}s
              </td>
              <td style={{ padding: '12px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${p.engagement}%`, 
                      height: '100%', 
                      background: p.engagement > 50 ? 'var(--success)' : 'var(--warning)',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{Math.round(p.engagement)}%</span>
                </div>
              </td>
            </tr>
          ))}
          {participants.length === 0 && (
            <tr>
              <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Chưa có ai tham gia. Hãy bắt đầu mô phỏng.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
