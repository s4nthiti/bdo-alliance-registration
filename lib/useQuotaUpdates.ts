import { useEffect, useRef, useState } from 'react';
import { Registration } from './db';

interface QuotaUpdateMessage {
  type: 'initial_data' | 'quota_update' | 'ping' | 'error';
  data?: (Registration & { guild_name: string })[];
  bossDate?: string;
  message?: string;
  timestamp: number;
}

export function useQuotaUpdates(bossDate: string) {
  const [registrations, setRegistrations] = useState<(Registration & { guild_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/registrations/events?bossDate=${encodeURIComponent(bossDate)}`);
    eventSourceRef.current = eventSource;

    // Fallback: if no initial data is received within 5 seconds, fetch manually
    const fallbackTimeout = setTimeout(() => {
      if (registrations.length === 0 && !error) {
        console.log('SSE fallback: fetching data manually');
        fetch(`/api/registrations?bossDate=${encodeURIComponent(bossDate)}`)
          .then(response => response.json())
          .then(data => {
            setRegistrations(data);
            setLoading(false);
          })
          .catch(err => {
            console.error('Fallback fetch failed:', err);
            setError('Failed to load data');
            setLoading(false);
          });
      }
    }, 5000);

    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
      clearTimeout(fallbackTimeout);
    };

    eventSource.onmessage = (event) => {
      try {
        const message: QuotaUpdateMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'initial_data':
            if (message.data) {
              setRegistrations(message.data);
              setLoading(false);
              clearTimeout(fallbackTimeout);
            }
            break;
          case 'quota_update':
            // Reload registrations when quota is updated
            fetch(`/api/registrations?bossDate=${encodeURIComponent(bossDate)}`)
              .then(response => response.json())
              .then(data => setRegistrations(data))
              .catch(err => console.error('Failed to reload registrations:', err));
            break;
          case 'ping':
            // Keep-alive ping, no action needed
            break;
          case 'error':
            setError(message.message || 'Unknown error');
            setLoading(false);
            break;
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    };

    eventSource.onerror = (event) => {
      console.error('SSE connection error:', event);
      setIsConnected(false);
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, delay);
      } else {
        setError('Connection lost. Please refresh the page.');
        setLoading(false);
      }
    };
  };

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [bossDate]);

  const reconnect = () => {
    reconnectAttempts.current = 0;
    setError(null);
    setLoading(true);
    connect();
  };

  return {
    registrations,
    loading,
    error,
    isConnected,
    reconnect
  };
}
