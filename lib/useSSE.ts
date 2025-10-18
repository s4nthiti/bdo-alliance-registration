import { useEffect, useRef, useState, useCallback } from 'react';

export function useSSE(bossDate: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/events?bossDate=${encodeURIComponent(bossDate)}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log('SSE connection opened');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('SSE message received:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'connected':
            console.log('SSE connected:', data.message);
            break;
          case 'quota_updated':
            // Trigger a refresh of quota data
            window.dispatchEvent(new CustomEvent('quotaUpdate', { detail: data.data }));
            break;
          case 'mercenary_added':
            // Trigger a refresh of mercenary data
            window.dispatchEvent(new CustomEvent('mercenaryUpdate', { detail: data.data }));
            break;
          case 'mercenary_removed':
            // Trigger a refresh of mercenary data
            window.dispatchEvent(new CustomEvent('mercenaryUpdate', { detail: data.data }));
            break;
          default:
            console.log('Unknown SSE message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      setIsConnected(false);
      setError('Connection lost. Attempting to reconnect...');
      
      // Auto-reconnect after 3 seconds
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          connect();
        }
      }, 3000);
    };
  }, [bossDate]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    error,
    reconnect: connect,
    disconnect
  };
}
