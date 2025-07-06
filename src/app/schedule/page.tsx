import { auth0 } from '@/lib/auth0'
import MainLayout from '@/components/MainLayout'
import { redirect } from 'next/navigation'
import UnifiedNavigation from '@/components/UnifiedNavigation'
import ScheduleStats from './ScheduleStats'
import Link from 'next/link'

export default async function SchedulePage() {
  const session = await auth0.getSession()
  if (!session) {
    redirect('/auth/login')
  }

  const quickActions = [
    {
      title: 'Nueva Categoría',
      description: 'Crear una nueva categoría de clases',
      href: '/schedule/categories',
      icon: '🏷️',
      color: 'bg-blue-500'
    },
    {
      title: 'Nueva Clase',
      description: 'Crear una nueva plantilla de clase',
      href: '/schedule/classes',
      icon: '🎯',
      color: 'bg-green-500'
    },
    {
      title: 'Nueva Sesión',
      description: 'Programar una nueva sesión',
      href: '/schedule/sessions/create',
      icon: '➕',
      color: 'bg-purple-500'
    },
    {
      title: 'Día Especial',
      description: 'Configurar horario especial',
      href: '/schedule/hours/special',
      icon: '⭐',
      color: 'bg-yellow-500'
    }
  ]

  const sections = [
    {
      title: 'Gestión',
      description: 'Configuración base del sistema',
      items: [
        { label: 'Categorías', href: '/schedule/categories', icon: '🏷️' },
        { label: 'Clases', href: '/schedule/classes', icon: '🎯' }
      ]
    },
    {
      title: 'Programación',
      description: 'Sesiones y eventos',
      items: [
        { label: 'Vista Semanal', href: '/schedule/sessions', icon: '📅' },
        { label: 'Nueva Sesión', href: '/schedule/sessions/create', icon: '➕' }
      ]
    },
    {
      title: 'Horarios',
      description: 'Gestión de horarios del gimnasio',
      items: [
        { label: 'Plantilla Base', href: '/schedule/hours/template', icon: '📝' },
        { label: 'Días Especiales', href: '/schedule/hours/special', icon: '⭐' },
        { label: 'Vista Calendario', href: '/schedule/hours/calendar', icon: '📆' }
      ]
    }
  ]

  return (
    <MainLayout user={session.user}>
      <div className="space-y-8">
        {/* Header de bienvenida */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full">
            <span className="text-3xl">📅</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Schedule</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Gestiona horarios, clases y sesiones de tu gimnasio
          </p>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 ${action.color} text-white rounded-xl mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <span className="text-xl">{action.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{action.title}</h3>
                <p className="text-sm text-slate-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Secciones principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{section.title}</h3>
              <p className="text-sm text-slate-600 mb-6">{section.description}</p>
              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    className="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200 group"
                  >
                    <span className="text-lg mr-3 group-hover:scale-110 transition-transform duration-200">
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Estadísticas dinámicas */}
        <ScheduleStats />
      </div>
    </MainLayout>
  )
} 