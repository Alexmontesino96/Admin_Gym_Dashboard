'use client';

import { NotificationFormData } from '@/hooks/useNotifications';
import { AlertCircle } from 'lucide-react';

interface NotificationFormProps {
  formData: NotificationFormData;
  onChange: (field: keyof NotificationFormData, value: string) => void;
  showDataField?: boolean;
}

export default function NotificationForm({
  formData,
  onChange,
  showDataField = false
}: NotificationFormProps) {
  const titleLength = formData.title.length;
  const messageLength = formData.message.length;

  return (
    <div className="space-y-4">
      {/* Título */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
          Título de la notificación
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Ej: Nuevo Horario de Clases"
          maxLength={65}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            titleLength > 65 ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            Máximo 65 caracteres para visualización óptima
          </p>
          <p className={`text-xs font-medium ${
            titleLength > 65 ? 'text-red-600' :
            titleLength > 55 ? 'text-orange-600' :
            'text-gray-500'
          }`}>
            {titleLength} / 65
          </p>
        </div>
      </div>

      {/* Mensaje */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
          Mensaje
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={(e) => onChange('message', e.target.value)}
          placeholder="Ej: Revisa los nuevos horarios para la próxima semana en la app"
          rows={4}
          maxLength={180}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
            messageLength > 180 ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            Máximo 180 caracteres recomendados
          </p>
          <p className={`text-xs font-medium ${
            messageLength > 180 ? 'text-red-600' :
            messageLength > 160 ? 'text-orange-600' :
            'text-gray-500'
          }`}>
            {messageLength} / 180
          </p>
        </div>
      </div>

      {/* Data adicional (opcional) */}
      {showDataField && (
        <div>
          <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1.5">
            Datos adicionales (JSON)
            <span className="text-gray-400 ml-1 font-normal">Opcional</span>
          </label>
          <textarea
            id="data"
            name="data"
            value={formData.data || ''}
            onChange={(e) => onChange('data', e.target.value)}
            placeholder='{"type": "announcement", "priority": "normal"}'
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
          />
          <div className="flex items-start gap-2 mt-1.5">
            <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500">
              JSON válido para datos personalizados que la app móvil puede procesar (ej: abrir pantalla específica, URLs, etc.)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
