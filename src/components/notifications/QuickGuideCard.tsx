'use client';

import { Info, AlertCircle } from 'lucide-react';

export default function QuickGuideCard() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start gap-3 mb-4">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">Guía Rápida</h3>
          <p className="text-sm text-blue-700">
            Envía notificaciones push a tus miembros usando OneSignal
          </p>
        </div>
      </div>

      {/* Límites de caracteres */}
      <div className="bg-white rounded-md p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-2 text-sm">Límites de caracteres</h4>
        <ul className="space-y-1.5 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            <span><strong>Título:</strong> Máximo 65 caracteres (recomendado)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            <span><strong>Mensaje:</strong> Máximo 180 caracteres (recomendado)</span>
          </li>
        </ul>
      </div>

      {/* Casos de uso comunes */}
      <div className="bg-white rounded-md p-4">
        <h4 className="font-medium text-gray-900 mb-2 text-sm">Casos de uso comunes</h4>
        <ul className="space-y-1.5 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span>Anuncios generales del gimnasio</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span>Eventos especiales y clases nuevas</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span>Recordatorios de pago</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            <span>Cierre temporal por mantenimiento</span>
          </li>
        </ul>
      </div>

      {/* Advertencia */}
      <div className="mt-4 flex items-start gap-2 text-xs text-blue-700">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Las notificaciones se procesan en segundo plano. Puede tomar unos segundos en entregarse.
        </p>
      </div>
    </div>
  );
}
