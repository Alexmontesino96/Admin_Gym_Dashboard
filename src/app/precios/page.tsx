'use client'

import { useState } from 'react'
import {
  Building2,
  Check,
  X,
  ArrowRight,
  Users,
  Zap,
  Shield,
  MessageSquare,
  Camera,
  Utensils,
  ClipboardList,
  Calendar,
  BarChart3,
  Star,
  Globe,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'

export default function PreciosPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">GymFlow</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Crear mi Gimnasio
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Precios Simples.{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Sin Sorpresas.
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Elige el plan perfecto para tu gimnasio o negocio de entrenamiento personal.
            Sin cargos ocultos. Cancela cuando quieras.
          </p>

          {/* Toggle Billing Cycle */}
          <div className="inline-flex items-center bg-white rounded-full p-1 shadow-lg border border-gray-200 mb-12">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 relative ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Anual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Plan GRATIS */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 relative">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratis</h3>
                <p className="text-gray-600">Para empezar y probar</p>
              </div>

              <div className="mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">$0</div>
                <div className="text-gray-600">por siempre</div>
              </div>

              <Link
                href="/register"
                className="w-full block text-center border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 mb-8"
              >
                Empezar Gratis
              </Link>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Hasta 50 usuarios</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Stories y feed básico</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Chat 1-a-1</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">1 administrador</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Gestión de clases</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-semibold mb-2">Ideal para:</p>
                <p className="text-sm text-gray-600">Entrenadores personales que están empezando</p>
              </div>
            </div>

            {/* Plan PRO - Más Popular */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-2xl border-2 border-blue-500 p-8 relative transform scale-105">
              {/* Badge "Más Popular" */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                  Más Popular
                </div>
              </div>

              <div className="mb-6 mt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <p className="text-gray-700">Para gimnasios en crecimiento</p>
              </div>

              <div className="mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  ${billingCycle === 'monthly' ? '49' : '39'}
                </div>
                <div className="text-gray-700">
                  por mes{billingCycle === 'annual' && ', facturado anualmente'}
                </div>
                {billingCycle === 'annual' && (
                  <div className="text-sm text-green-600 font-semibold mt-1">
                    Ahorras $120/año
                  </div>
                )}
              </div>

              <Link
                href="/register"
                className="w-full block text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl mb-8"
              >
                Empezar Ahora
              </Link>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Usuarios ilimitados</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Todo lo del plan Gratis</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Planes nutricionales ilimitados</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Sistema de encuestas completo</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Gestión de membresías y pagos</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Exportación de datos (CSV/Excel)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">5 administradores</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Soporte prioritario</span>
                </div>
              </div>

              <div className="pt-6 border-t border-blue-200">
                <p className="text-sm text-gray-700 font-semibold mb-2">Ideal para:</p>
                <p className="text-sm text-gray-700">Gimnasios pequeños y entrenadores establecidos</p>
              </div>
            </div>

            {/* Plan ENTERPRISE */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 relative">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600">Para cadenas y grandes gimnasios</p>
              </div>

              <div className="mb-6">
                <div className="text-5xl font-bold text-gray-900 mb-2">Custom</div>
                <div className="text-gray-600">contacta para cotización</div>
              </div>

              <Link
                href="mailto:hola@gymflow.com"
                className="w-full block text-center bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200 mb-8"
              >
                Contactar Ventas
              </Link>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Todo lo del plan Pro</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Múltiples gimnasios</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Integraciones custom</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Onboarding dedicado</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">SLA garantizado</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">API access completo</span>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">Soporte 24/7</span>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-semibold mb-2">Ideal para:</p>
                <p className="text-sm text-gray-600">Cadenas de gimnasios y franquicias</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comparación Detallada de Features
            </h2>
            <p className="text-lg text-gray-600">
              Todos los planes incluyen lo esencial. Elige según tus necesidades.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Gratis</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Pro</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Usuarios</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">50</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Ilimitados</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Ilimitados</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">Stories & Feed Social</td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Chat en Tiempo Real</td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">Gestión de Clases</td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Planes Nutricionales</td>
                  <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">Sistema de Encuestas</td>
                  <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Gestión de Membresías</td>
                  <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">Exportación de Datos</td>
                  <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Administradores</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">1</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">5</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Ilimitados</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">Múltiples Gimnasios</td>
                  <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Integraciones Custom</td>
                  <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><X className="h-5 w-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">Soporte</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Email</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">Prioritario</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">24/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-start space-x-4">
                <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ¿Hay cargos ocultos?
                  </h3>
                  <p className="text-gray-600">
                    No. El precio que ves es el precio que pagas. Sin fees por transacción,
                    sin costos de setup, sin cargos adicionales.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-start space-x-4">
                <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ¿Puedo cambiar de plan?
                  </h3>
                  <p className="text-gray-600">
                    Sí. Puedes actualizar o degradar tu plan cuando quieras.
                    Los cambios se reflejan inmediatamente y se prorratean en tu próxima factura.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-start space-x-4">
                <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ¿Hay descuento por pago anual?
                  </h3>
                  <p className="text-gray-600">
                    Sí. Obtienes 20% de descuento pagando anualmente.
                    En el plan Pro, ahorras $120 USD al año.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-start space-x-4">
                <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ¿Puedo cancelar en cualquier momento?
                  </h3>
                  <p className="text-gray-600">
                    Sí. Sin contratos a largo plazo. Cancela cuando quieras desde tu panel de configuración.
                    Mantendrás acceso hasta el final de tu período de facturación.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-start space-x-4">
                <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ¿Qué métodos de pago aceptan?
                  </h3>
                  <p className="text-gray-600">
                    Aceptamos todas las tarjetas de crédito principales (Visa, Mastercard, American Express).
                    Para planes Enterprise, también ofrecemos transferencia bancaria.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            ¿Listo para Transformar tu Gimnasio?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a más de 1,200 gimnasios que ya están aumentando su retención con GymFlow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <span>Empezar Gratis</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center space-x-2 border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-200"
            >
              Ver Demo
            </Link>
          </div>

          <p className="text-sm text-blue-200 mt-6">
            Sin tarjeta de crédito • Setup en 5 minutos • Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">GymFlow</span>
          </div>
          <p className="text-sm">© 2024 GymFlow. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
