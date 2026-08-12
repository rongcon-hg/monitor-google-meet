import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { RefreshCw, Users, Server, Activity, AlertTriangle, Download, Clock, Video } from 'lucide-react';
import { useWorkspaceMeetings } from './engine/api';
import { exportMeetingsToExcel } from './utils/export';
import { ParticipantList } from './components/ParticipantList';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { AuditLog } from './components/AuditLog';
import { QuickNotes } from './components/QuickNotes';
import { format, differenceInMinutes, differenceInSeconds } from 'date-fns';
import './App.css';
import './index.css';

function App() {
  const { meetings, isLoading, error, lastUpdated, fetchMeetings } = useWorkspaceMeetings();
  const [selectedMeetId, setSelectedMeetId] = useState('');

  // Auto-select first meeting if none selected and data loaded
  useEffect(() => {
    if (meetings.length > 0 && !selectedMeetId) {
      setSelectedMeetId(meetings[0].id);
    } else if (meetings.length === 0 && selectedMeetId) {
      setSelectedMeetId('');
    }
  }, [meetings, selectedMeetId]);

  const activeMeeting = meetings.find(m => m.id === selectedMeetId);

  const handleExport = () => {
    exportMeetingsToExcel(meetings);
  };

  const getDurationString = (startStr, endStr) => {
    if (!startStr) return '00:00';
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : new Date();
    const diffSecs = differenceInSeconds(end, start);
    if (diffSecs < 0) return '00:00';
    const m = Math.floor(diffSecs / 60).toString().padStart(2, '0');
    const s = (diffSecs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">
          <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video color="white" />
          </div>
          <h1>Meet Tracker Pro</h1>
          <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></div>
            Đang diễn ra
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ width: '320px' }}>
            <Select 
              value={meetings.length > 0 ? { value: selectedMeetId, label: meetings.find(m => m.id === selectedMeetId)?.code || selectedMeetId } : null}
              onChange={(selected) => setSelectedMeetId(selected.value)}
              options={meetings.map(m => ({
                value: m.id,
                label: `${m.code.match(/.{1,3}/g)?.join('-') || m.code} (${m.participants.length} người)`
              }))}
              placeholder="Tìm kiếm hoặc chọn mã phòng..."
              noOptionsMessage={() => "Không tìm thấy phòng"}
              styles={{
                control: (base) => ({
                  ...base,
                  background: 'rgba(0,0,0,0.2)',
                  borderColor: 'var(--card-border)',
                  color: 'white',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: 'var(--accent-primary)'
                  }
                }),
                singleValue: (base) => ({ ...base, color: 'white' }),
                input: (base) => ({ ...base, color: 'white' }),
                menu: (base) => ({
                  ...base,
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)'
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                })
              }}
            />
          </div>

          <button className="btn" onClick={fetchMeetings} disabled={isLoading}>
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> 
            Đồng bộ Workspace Live
          </button>
          <button className="btn btn-secondary" onClick={handleExport} disabled={meetings.length === 0}>
            <Download size={16} /> Xuất Báo Cáo
          </button>
        </div>
      </header>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '16px', borderRadius: '8px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <AlertTriangle size={20} />
          <span><strong>Lỗi kết nối API:</strong> {error}</span>
        </div>
      )}

      {activeMeeting ? (
        <>
          <div className="top-cards-grid animate-fade-in">
            <div className="glass-card">
              <div className="card-title">
                <span>Thời Gian Cuộc Gọi</span>
                <Clock size={16} color="var(--accent-primary)" />
              </div>
              <div className="card-value" style={{ margin: '16px 0' }}>
                {getDurationString(activeMeeting.startTime, activeMeeting.endTime)}
                <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 'normal', marginLeft: 'auto' }}>
                  ▶ Đang tính
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>Bắt đầu: <strong style={{ color: 'var(--text-primary)' }}>{activeMeeting.startTime ? format(new Date(activeMeeting.startTime), 'HH:mm') : '--:--'}</strong></span>
                <span>Cập nhật: <strong style={{ color: 'var(--text-primary)' }}>{activeMeeting.endTime ? format(new Date(activeMeeting.endTime), 'HH:mm') : '--:--'}</strong></span>
              </div>
            </div>

            <div className="glass-card">
              <div className="card-title">
                <span>Người Tham Dự Hiệu Lực</span>
                <Users size={16} color="var(--success)" />
              </div>
              <div className="card-value" style={{ margin: '16px 0' }}>
                {activeMeeting.participants.length} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>người</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>Đã tham gia: <strong style={{ color: 'var(--text-primary)' }}>{activeMeeting.participants.length}</strong></span>
              </div>
            </div>

            <div className="glass-card">
              <div className="card-title">
                <span>Tổng Số Sự Kiện</span>
                <Activity size={16} color="var(--accent-secondary)" />
              </div>
              <div className="card-value" style={{ margin: '16px 0' }}>
                {activeMeeting.eventCount} <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>logs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>Trung bình <strong style={{ color: 'var(--text-primary)' }}>{(activeMeeting.eventCount / Math.max(1, activeMeeting.participants.length)).toFixed(1)}</strong> sự kiện/người</span>
              </div>
            </div>
          </div>

          <div className="main-layout animate-fade-in">
            <div className="left-panel">
              <ParticipantList 
                participants={activeMeeting.participants} 
                organizerEmail={activeMeeting.organizerEmail}
              />
            </div>
            
            <div className="right-panel">
              <AnalyticsCharts events={activeMeeting.events} />
              
              <div className="bottom-split">
                <AuditLog events={activeMeeting.events} />
                <QuickNotes meetCode={activeMeeting.code} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '400px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Server size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
          Chưa có cuộc gọi nào đang diễn ra trong tổ chức của bạn.
          <br/><br/>
          <span style={{ fontSize: '12px', fontStyle: 'italic', opacity: 0.7 }}>
            Hãy đảm bảo bạn đã cấu hình Biến môi trường đúng trên Vercel.
          </span>
        </div>
      )}
    </div>
  );
}

export default App;
