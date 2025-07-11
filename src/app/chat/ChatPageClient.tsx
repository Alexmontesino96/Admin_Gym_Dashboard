'use client';

import dynamic from 'next/dynamic';

// Dynamic import para ChatClient - solo se carga cuando se accede a esta página
const ChatClient = dynamic(() => import('./ChatClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Cargando Chat...</h3>
        <p className="text-gray-600">Inicializando sistema de mensajería</p>
      </div>
    </div>
  )
});

export default function ChatPageClient() {
  return <ChatClient />;
} 