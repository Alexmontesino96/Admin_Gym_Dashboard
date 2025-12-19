'use client';

import { useState } from 'react';
import { notificationsAPI, NotificationSendRequest, NotificationToGymRequest, NotificationResponse, isAPIError } from '@/lib/api';

export interface NotificationFormData {
  title: string;
  message: string;
  data?: string; // JSON string
}

export interface UseNotificationsReturn {
  sendToUsers: (userIds: string[], formData: NotificationFormData) => Promise<NotificationResponse>;
  sendToAllMembers: (formData: NotificationFormData) => Promise<NotificationResponse>;
  sending: boolean;
  error: string | null;
  resetState: () => void;
}

export function useNotifications(): UseNotificationsReturn {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseDataField = (dataString?: string): Record<string, any> | undefined => {
    if (!dataString || !dataString.trim()) return undefined;

    try {
      return JSON.parse(dataString);
    } catch (e) {
      throw new Error('Los datos adicionales deben ser JSON válido');
    }
  };

  const validateForm = (formData: NotificationFormData): void => {
    if (!formData.title.trim()) {
      throw new Error('El título es requerido');
    }

    if (formData.title.length > 65) {
      throw new Error('El título no puede exceder 65 caracteres');
    }

    if (!formData.message.trim()) {
      throw new Error('El mensaje es requerido');
    }

    if (formData.message.length > 180) {
      throw new Error('El mensaje no puede exceder 180 caracteres');
    }
  };

  const sendToUsers = async (
    userIds: string[],
    formData: NotificationFormData
  ): Promise<NotificationResponse> => {
    setSending(true);
    setError(null);

    try {
      // Validar formulario
      validateForm(formData);

      // Validar que haya usuarios seleccionados
      if (!userIds || userIds.length === 0) {
        throw new Error('Debes seleccionar al menos un usuario');
      }

      // Parsear data field si existe
      const data = parseDataField(formData.data);

      // Preparar payload
      const payload: NotificationSendRequest = {
        user_ids: userIds,
        title: formData.title.trim(),
        message: formData.message.trim(),
        data,
      };

      // Enviar
      const response = await notificationsAPI.sendToUsers(payload);
      return response;

    } catch (err) {
      let errorMessage = 'Error al enviar la notificación';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (isAPIError(err)) {
        errorMessage = err.message || 'Error del servidor';

        // Errores específicos según status
        if (err.status === 403) {
          errorMessage = 'No tienes permisos para enviar notificaciones';
        } else if (err.status === 401) {
          errorMessage = 'Tu sesión ha expirado. Por favor vuelve a iniciar sesión';
        } else if (err.status === 422) {
          errorMessage = 'Los datos enviados no son válidos. Verifica el formulario';
        }
      }

      setError(errorMessage);
      throw new Error(errorMessage);

    } finally {
      setSending(false);
    }
  };

  const sendToAllMembers = async (
    formData: NotificationFormData
  ): Promise<NotificationResponse> => {
    setSending(true);
    setError(null);

    try {
      // Validar formulario
      validateForm(formData);

      // Parsear data field si existe
      const data = parseDataField(formData.data);

      // Preparar payload
      const payload: NotificationToGymRequest = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        data,
      };

      // Enviar
      const response = await notificationsAPI.sendToAllMembers(payload);
      return response;

    } catch (err) {
      let errorMessage = 'Error al enviar la notificación';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (isAPIError(err)) {
        errorMessage = err.message || 'Error del servidor';

        // Errores específicos según status
        if (err.status === 403) {
          errorMessage = 'No tienes permisos para enviar notificaciones';
        } else if (err.status === 401) {
          errorMessage = 'Tu sesión ha expirado. Por favor vuelve a iniciar sesión';
        } else if (err.status === 422) {
          errorMessage = 'Los datos enviados no son válidos. Verifica el formulario';
        }
      }

      setError(errorMessage);
      throw new Error(errorMessage);

    } finally {
      setSending(false);
    }
  };

  const resetState = () => {
    setError(null);
    setSending(false);
  };

  return {
    sendToUsers,
    sendToAllMembers,
    sending,
    error,
    resetState,
  };
}
