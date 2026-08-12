import { useState, useEffect, useCallback } from 'react';

const MOCK_NAMES = [
  'Bảo An', 'Nhật Minh', 'Hải Đăng', 'Thảo Nguyên', 'Phương Linh',
  'Tuấn Kiệt', 'Minh Châu', 'Quang Huy', 'Thanh Tùng', 'Ngọc Trâm',
  'Anh Thư', 'Gia Bảo', 'Lan Hương', 'Đức Huy', 'Yến Nhi',
  'Hoàng Nam', 'Bích Ngọc', 'Trung Kiên', 'Thu Hà', 'Đình Phong'
];

const MOCK_MESSAGES = [
  'Chào mọi người!', 'Nghe rõ không ạ?', 'Mình xin phép chia sẻ màn hình',
  'Tuyệt vời quá', 'Đồng ý', 'Mình có ý kiến chút', 'Cảm ơn bạn',
  'Dự án này bao giờ deadline nhỉ?', 'Cho mình xin link tài liệu với',
  'Mọi người bật cam lên nhé', 'Mình xin phép off sớm 5p', '👍', '👏👏👏'
];

const SCENARIOS = {
  STANDUP: { joinRate: 0.8, talkRate: 0.3, maxParticipants: 10, volatility: 0.1, chatRate: 0.05 },
  WEBINAR: { joinRate: 0.9, talkRate: 0.05, maxParticipants: 50, volatility: 0.05, chatRate: 0.2 },
  TRAINING: { joinRate: 0.7, talkRate: 0.15, maxParticipants: 20, volatility: 0.2, chatRate: 0.1 },
};

export function useSimulation(scenarioName = 'STANDUP') {
  const [participants, setParticipants] = useState([]);
  const [logs, setLogs] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [timelineData, setTimelineData] = useState([]); // for charts
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [peakParticipants, setPeakParticipants] = useState(0);

  const scenario = SCENARIOS[scenarioName] || SCENARIOS.STANDUP;

  const addLog = useCallback((message, type = 'info') => {
    setLogs(prev => [{ id: Date.now() + Math.random(), time: new Date(), message, type }, ...prev].slice(0, 100));
  }, []);

  const addChatMessage = useCallback((sender, text) => {
    setChatMessages(prev => [{ id: Date.now() + Math.random(), time: new Date(), sender, text }, ...prev].slice(0, 100));
  }, []);

  const startSimulation = useCallback(() => {
    setParticipants([]);
    setLogs([]);
    setChatMessages([]);
    setTimelineData([]);
    setElapsedTime(0);
    setPeakParticipants(0);
    setIsRunning(true);
    addLog(`Đã bắt đầu kịch bản ${scenarioName}`, 'system');
  }, [scenarioName, addLog]);

  const stopSimulation = useCallback(() => {
    setIsRunning(false);
    addLog(`Đã dừng kịch bản ${scenarioName}`, 'system');
  }, [scenarioName, addLog]);

  // Main Simulation Loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);

      setParticipants(prev => {
        let next = [...prev];
        
        // Random joins
        if (next.length < scenario.maxParticipants && Math.random() < scenario.joinRate * 0.1) {
          const availableNames = MOCK_NAMES.filter(n => !next.find(p => p.name === n));
          if (availableNames.length > 0) {
            const name = availableNames[Math.floor(Math.random() * availableNames.length)];
            next.push({
              id: Date.now().toString() + Math.random().toString(),
              name,
              joinTime: Date.now(),
              talkTime: 0,
              micOn: false,
              camOn: Math.random() > 0.5,
              handRaised: false,
              screenSharing: false,
              engagement: 100,
            });
            addLog(`${name} đã tham gia cuộc họp`, 'join');
          }
        }

        // Random leaves
        if (next.length > 0 && Math.random() < scenario.volatility * 0.05) {
          const index = Math.floor(Math.random() * next.length);
          const p = next[index];
          addLog(`${p.name} đã rời khỏi cuộc họp`, 'leave');
          next.splice(index, 1);
        }

        // Update states for current participants
        next = next.map(p => {
          let updated = { ...p };
          
          // Talk logic
          if (updated.micOn) {
            updated.talkTime += 1;
            if (Math.random() < 0.2) {
              updated.micOn = false;
              addLog(`${updated.name} đã tắt mic`, 'mute');
            }
          } else {
            if (Math.random() < scenario.talkRate * 0.1) {
              updated.micOn = true;
              addLog(`${updated.name} đang phát biểu`, 'speak');
            }
          }

          // Hand raise
          if (!updated.handRaised && Math.random() < 0.01) {
            updated.handRaised = true;
            addLog(`${updated.name} đã giơ tay`, 'hand');
          } else if (updated.handRaised && Math.random() < 0.1) {
            updated.handRaised = false;
          }

          // Engagement
          if (updated.micOn || updated.camOn) {
            updated.engagement = Math.min(100, updated.engagement + 2);
          } else {
            updated.engagement = Math.max(0, updated.engagement - 0.5);
          }

          return updated;
        });

        // Screen share logic
        const isAnyoneSharing = next.some(p => p.screenSharing);
        if (!isAnyoneSharing && Math.random() < 0.02 && next.length > 0) {
          const index = Math.floor(Math.random() * next.length);
          next[index].screenSharing = true;
          addLog(`${next[index].name} đã bắt đầu chia sẻ màn hình`, 'share');
        } else if (isAnyoneSharing && Math.random() < 0.05) {
          const p = next.find(p => p.screenSharing);
          if (p) {
            p.screenSharing = false;
            addLog(`${p.name} đã ngừng chia sẻ màn hình`, 'share');
          }
        }

        // Random Chat Message
        if (next.length > 0 && Math.random() < scenario.chatRate * 0.2) {
          const sender = next[Math.floor(Math.random() * next.length)].name;
          const text = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
          addChatMessage(sender, text);
        }

        setPeakParticipants(peak => Math.max(peak, next.length));
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, scenario, addLog, addChatMessage]);

  // Record timeline data every 5 seconds for charts
  useEffect(() => {
    if (!isRunning) return;
    if (elapsedTime % 5 === 0) {
      setTimelineData(prev => [...prev, {
        time: elapsedTime,
        participants: participants.length,
        activeSpeakers: participants.filter(p => p.micOn).length
      }].slice(-20));
    }
  }, [isRunning, elapsedTime, participants]);

  return {
    participants,
    logs,
    chatMessages,
    timelineData,
    isRunning,
    elapsedTime,
    peakParticipants,
    startSimulation,
    stopSimulation,
  };
}
