'use client';

import dynamic from 'next/dynamic';

// Dynamic import para EventsClient - reduce el bundle inicial
const EventsClient = dynamic(() => import('./events-client'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Cargando Eventos...</h3>
        <p className="text-gray-600">Preparando sistema de gestión de eventos</p>
      </div>
    </div>
  )
});

export default function EventosPageClient() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>
        <p className="text-gray-600 mt-2">Gestiona los eventos de tu gimnasio</p>
      </div>
      <EventsClient />
    </div>
  );
} 