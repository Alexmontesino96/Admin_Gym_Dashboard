import { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, getSelectedGymId } from '@/lib/api';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://gymapi-eh6m.onrender.com';

interface WebSocketMessage {
  type: 'connection' | 'activity';
  message?: string;
  gym_id?: number;
  data?: Activity;
}

interface UseActivityFeedWebSocketOptions {
  onActivity?: (activity: Activity) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
}

interface UseActivityFeedWebSocketReturn {
  isConnected: boolean;
  lastActivity: Activity | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  reconnectAttempts: number;
  connect: () => void;
  disconnect: () => void;
}

export function useActivityFeedWebSocket(
  options: UseActivityFeedWebSocketOptions = {}
): UseActivityFeedWebSocketReturn {
  const {
    onActivity,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
    maxReconnectAttempts = 5
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastActivity, setLastActivity] = useState<Activity | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    const gymId = getSelectedGymId();

    if (!gymId) {
      console.warn('No gym ID selected, cannot connect to Activity Feed WebSocket');
      setConnectionStatus('error');
      return;
    }

    // Si ya hay una conexion abierta, no reconectar
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    // Limpiar conexion anterior si existe
    if (wsRef.current) {
      wsRef.current.close();
    }

    setConnectionStatus('connecting');

    const wsUrl = `${WS_BASE_URL}/api/v1/activity_feed/ws?gym_id=${gymId}`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket Activity Feed conectado');
        setIsConnected(true);
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          if (data.type === 'connection') {
            console.log('Mensaje de bienvenida:', data.message);
          }

          if (data.type === 'activity' && data.data) {
            setLastActivity(data.data);
            onActivity?.(data.data);
          }
        } catch (err) {
          console.error('Error parseando mensaje WebSocket:', err);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Error en WebSocket Activity Feed:', error);
        setConnectionStatus('error');
        onError?.(error);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket Activity Feed desconectado');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        onDisconnect?.();

        // Auto-reconexion con backoff exponencial
        if (autoReconnect && reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(`Reintentando conexion en ${delay}ms (intento ${reconnectAttempts + 1}/${maxReconnectAttempts})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, delay);
        }
      };
    } catch (err) {
      console.error('Error creando WebSocket:', err);
      setConnectionStatus('error');
    }
  }, [onActivity, onConnect, onDisconnect, onError, autoReconnect, maxReconnectAttempts, reconnectAttempts]);

  const disconnect = useCallback(() => {
    // Limpiar timeout de reconexion
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Cerrar conexion
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    setReconnectAttempts(0);
  }, []);

  // Conectar automaticamente al montar
  useEffect(() => {
    connect();

    // Limpiar al desmontar
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Reconectar si cambia el gym ID
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedGymId') {
        disconnect();
        setTimeout(connect, 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [connect, disconnect]);

  return {
    isConnected,
    lastActivity,
    connectionStatus,
    reconnectAttempts,
    connect,
    disconnect
  };
}

export default useActivityFeedWebSocket;
