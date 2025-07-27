'use client';

import dynamic from 'next/dynamic';

// Skeleton UI detallado para eventos
const EventsSkeleton = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="mb-8">
      <div className="h-9 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
    </div>

    {/* Controls skeleton */}
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
        <div className="sm:w-48">
          <div className="h-4 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
      </div>
    </div>

    {/* Stats skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="ml-4 flex-1">
              <div className="h-4 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Events list skeleton */}
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      <div className="divide-y divide-gray-200">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Dynamic import con ssr: false en Client Component
const EventsClientLazy = dynamic(() => import('./events-client'), {
  loading: () => <EventsSkeleton />,
  ssr: false
});

export default function EventsWrapper() {
  return <EventsClientLazy />;
}