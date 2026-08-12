import { useState, useEffect, useCallback } from 'react';

export function useWorkspaceMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Gọi API từ Backend Node.js
      const response = await fetch('http://localhost:3001/api/meetings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      if (result.success) {
        setMeetings(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || "Lỗi không xác định từ Backend");
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu cuộc gọi:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Tự động tải dữ liệu mỗi 10 giây
  useEffect(() => {
    fetchMeetings();
    const interval = setInterval(fetchMeetings, 10000);
    return () => clearInterval(interval);
  }, [fetchMeetings]);

  return {
    meetings,
    isLoading,
    error,
    lastUpdated,
    fetchMeetings
  };
}
