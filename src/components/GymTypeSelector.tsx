'use client'

import { Building2, Dumbbell, CheckCircle, ArrowRight, Users, Calendar, CreditCard, TrendingUp, User, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function GymTypeSelector() {
  const router = useRouter()
  const [hoveredType, setHoveredType] = useState<'gym' | 'personal_trainer' | null>(null)

  const handleSelectType = (type: 'gym' | 'personal_trainer') => {
    router.push(`/register?type=${type}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ¿Cómo quieres transformar tu negocio fitness?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            En 5 minutos tendrás tu gimnasio digital listo.
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Opción: Gimnasio */}
          <button
            onClick={() => handleSelectType('gym')}
            onMouseEnter={() => setHoveredType('gym')}
            onMouseLeave={() => setHoveredType(null)}
            className={`relative bg-white rounded-3xl shadow-xl border-2 transition-all duration-300 p-8 text-left ${
              hoveredType === 'gym'
                ? 'border-blue-600 shadow-2xl transform scale-105'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            {/* Badge */}
            <div className="absolute top-6 right-6">
              <div className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-semibold">
                MÁS POPULAR
              </div>
            </div>

            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 transition-colors ${
              hoveredType === 'gym' ? 'bg-blue-600' : 'bg-blue-100'
            }`}>
              <Building2 className={`h-8 w-8 transition-colors ${
                hoveredType === 'gym' ? 'text-white' : 'text-blue-600'
              }`} />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Soy dueño de gimnasio
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Para dueños que quieren menos Excel y más tiempo con sus miembros.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Gestión de múltiples entrenadores y staff</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Control de accesos y asistencias</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Clases grupales con reservas y listas de espera</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Planes de membresía flexibles y pagos recurrentes</span>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-gray-600">Gimnasios activos</div>
                </div>
                <div className="w-px h-12 bg-blue-200"></div>
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-blue-600">85%</div>
                  <div className="text-gray-600">Retención promedio</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
              hoveredType === 'gym' ? 'bg-blue-600' : 'bg-gray-100'
            }`}>
              <span className={`font-semibold transition-colors ${
                hoveredType === 'gym' ? 'text-white' : 'text-gray-900'
              }`}>
                Activar mi gimnasio gratis
              </span>
              <ArrowRight className={`h-5 w-5 transition-colors ${
                hoveredType === 'gym' ? 'text-white' : 'text-gray-600'
              }`} />
            </div>
          </button>

          {/* Opción: Entrenador Personal */}
          <button
            onClick={() => handleSelectType('personal_trainer')}
            onMouseEnter={() => setHoveredType('personal_trainer')}
            onMouseLeave={() => setHoveredType(null)}
            className={`relative bg-white rounded-3xl shadow-xl border-2 transition-all duration-300 p-8 text-left ${
              hoveredType === 'personal_trainer'
                ? 'border-green-600 shadow-2xl transform scale-105'
                : 'border-gray-200 hover:border-green-300'
            }`}
          >
            {/* Badge */}
            <div className="absolute top-6 right-6">
              <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-semibold">
                INDEPENDIENTE
              </div>
            </div>

            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 transition-colors ${
              hoveredType === 'personal_trainer' ? 'bg-green-600' : 'bg-green-100'
            }`}>
              <Dumbbell className={`h-8 w-8 transition-colors ${
                hoveredType === 'personal_trainer' ? 'text-white' : 'text-green-600'
              }`} />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Soy entrenador personal
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Para entrenadores que quieren menos WhatsApp y más transformaciones.
            </p>

            {/* Features */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Gestión personalizada de cada cliente</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Planes nutricionales y seguimiento individual</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Agenda flexible de sesiones 1 a 1</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Cobros simplificados y recordatorios automáticos</span>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-green-600">800+</div>
                  <div className="text-gray-600">Entrenadores activos</div>
                </div>
                <div className="w-px h-12 bg-green-200"></div>
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-green-600">50+</div>
                  <div className="text-gray-600">Clientes por trainer</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
              hoveredType === 'personal_trainer' ? 'bg-green-600' : 'bg-gray-100'
            }`}>
              <span className={`font-semibold transition-colors ${
                hoveredType === 'personal_trainer' ? 'text-white' : 'text-gray-900'
              }`}>
                Activar mi negocio gratis
              </span>
              <ArrowRight className={`h-5 w-5 transition-colors ${
                hoveredType === 'personal_trainer' ? 'text-white' : 'text-gray-600'
              }`} />
            </div>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>100% gratis para empezar</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Setup en 3 minutos</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Sin compromisos, cancela con un clic</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>+500 negocios fitness en México confían en nosotros</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Inicia sesión
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Ambas opciones incluyen todas las funcionalidades. Puedes cambiar el tipo más adelante en configuración.
          </p>
        </div>
      </div>
    </div>
  )
}
