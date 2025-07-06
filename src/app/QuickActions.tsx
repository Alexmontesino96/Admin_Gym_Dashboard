import Link from 'next/link'

interface QuickAction {
  title: string
  description: string
  href: string
  icon: string
  gradient: string
  hoverGradient: string
  shadowColor: string
  borderColor: string
}

export default function QuickActions() {
  const quickActions: QuickAction[] = [
    {
      title: 'Nueva Sesión',
      description: 'Programar clase',
      href: '/schedule/sessions',
      icon: '📅',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
      shadowColor: 'hover:shadow-blue-200',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Gestionar Usuarios',
      description: 'Ver miembros',
      href: '/usuarios',
      icon: '👥',
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      hoverGradient: 'hover:from-emerald-600 hover:to-emerald-700',
      shadowColor: 'hover:shadow-emerald-200',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'Crear Clase',
      description: 'Nueva actividad',
      href: '/schedule/classes',
      icon: '🎯',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      hoverGradient: 'hover:from-purple-600 hover:to-purple-700',
      shadowColor: 'hover:shadow-purple-200',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Horarios',
      description: 'Configurar horarios',
      href: '/schedule/hours/template',
      icon: '🕒',
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      hoverGradient: 'hover:from-orange-600 hover:to-orange-700',
      shadowColor: 'hover:shadow-orange-200',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Eventos',
      description: 'Gestionar eventos',
      href: '/eventos',
      icon: '🎉',
      gradient: 'bg-gradient-to-br from-pink-500 to-pink-600',
      hoverGradient: 'hover:from-pink-600 hover:to-pink-700',
      shadowColor: 'hover:shadow-pink-200',
      borderColor: 'border-pink-200'
    },
    {
      title: 'Configuración',
      description: 'Ajustar gimnasio',
      href: '/gimnasio',
      icon: '⚙️',
      gradient: 'bg-gradient-to-br from-gray-500 to-gray-600',
      hoverGradient: 'hover:from-gray-600 hover:to-gray-700',
      shadowColor: 'hover:shadow-gray-200',
      borderColor: 'border-gray-200'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {quickActions.map((action, index) => (
        <Link
          key={index}
          href={action.href}
          className={`${action.gradient} ${action.hoverGradient} ${action.shadowColor} rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg group border ${action.borderColor} relative overflow-hidden`}
        >
          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          
          <div className="relative text-center space-y-3">
            <div className="text-3xl group-hover:scale-110 transition-transform duration-200 filter drop-shadow-sm">
              {action.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                {action.title}
              </h3>
              <p className="text-xs text-white/80 group-hover:text-white transition-colors duration-200">
                {action.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
} 