import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import EventsWrapper from './EventsWrapper'
import { Calendar, Users, Clock, MapPin, Plus, Activity, TrendingUp, CheckCircle } from 'lucide-react'
import Link from 'next/link'

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
              <Link
                href="/eventos?create=1"
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <Plus size={20} />
                <span className="font-semibold">Crear Evento</span>
              </Link>
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

        {/* Sin contenido estático ni placeholders; la lista real se renderiza abajo */}

        {/* Contenido */}
        <EventsWrapper />
      </div>
    </MainLayout>
  )
} 
