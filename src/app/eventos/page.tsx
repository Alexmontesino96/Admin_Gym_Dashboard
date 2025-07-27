import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import dynamic from 'next/dynamic'
import { Calendar, Users, Clock, MapPin, Plus, Activity, TrendingUp, CheckCircle } from 'lucide-react'
import Link from 'next/link'

// Skeleton para el contenido lazy
const EventsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Stats skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
    
    {/* Content skeleton */}
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
)

// Lazy loaded component con dynamic import
const EventsClientLazy = dynamic(() => import('./events-client'), {
  loading: () => <EventsSkeleton />,
  ssr: false
})

export default async function EventosPage() {
  const session = await auth0.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <MainLayout user={session.user}>
      <div className="space-y-8">
        {/* Header - carga inmediata */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center">
                <span className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3">
                  📅
                </span>
                Gestión de Eventos
              </h1>
              <p className="text-lg text-slate-600">Sistema completo de eventos y actividades</p>
            </div>
            <div className="flex space-x-4">
              <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105">
                <Plus size={20} />
                <span className="font-semibold">Crear Evento</span>
              </button>
              <Link
                href="/eventos/calendario"
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <Calendar size={20} />
                <span className="font-semibold">Calendario</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas - datos estáticos para carga inmediata */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">+8%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">24</h3>
            <p className="text-sm text-slate-600">Eventos Programados</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">+15%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">342</h3>
            <p className="text-sm text-slate-600">Participantes Totales</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">18</h3>
            <p className="text-sm text-slate-600">Eventos Completados</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">+25%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">92%</h3>
            <p className="text-sm text-slate-600">Tasa de Asistencia</p>
          </div>
        </div>

        {/* Eventos próximos - datos estáticos */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Clock size={20} className="text-slate-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Próximos Eventos</h2>
                  <p className="text-slate-600">Eventos programados para esta semana</p>
                </div>
              </div>
              <button className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center space-x-1 transition-colors">
                <span>Ver todos</span>
                <Calendar size={16} />
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-slate-100">
            {[
              { 
                id: 1, 
                title: "Clase de Yoga Matutina", 
                date: "2024-01-15", 
                time: "08:00",
                location: "Sala 1",
                participants: 15,
                max_participants: 20,
                status: "SCHEDULED"
              },
              { 
                id: 2, 
                title: "Entrenamiento HIIT", 
                date: "2024-01-15", 
                time: "18:00",
                location: "Sala Principal",
                participants: 8,
                max_participants: 12,
                status: "SCHEDULED"
              },
              { 
                id: 3, 
                title: "Aqua Fitness", 
                date: "2024-01-16", 
                time: "10:00",
                location: "Piscina",
                participants: 12,
                max_participants: 15,
                status: "SCHEDULED"
              }
            ].map((event) => (
              <div key={event.id} className="p-6 hover:bg-slate-50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Calendar size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                        <span className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>{event.date}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{event.time}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MapPin size={12} />
                          <span>{event.location}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users size={12} />
                          <span>{event.participants}/{event.max_participants}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Programado
                    </span>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                      <Activity size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contenido con lazy loading */}
        <EventsClientLazy />
      </div>
    </MainLayout>
  )
} 