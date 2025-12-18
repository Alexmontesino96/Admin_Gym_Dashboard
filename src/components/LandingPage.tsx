'use client'

import {
  Building2,
  Users,
  Calendar,
  BarChart3,
  Shield,
  Zap,
  MessageSquare,
  Utensils,
  ClipboardList,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  Clock,
  Globe
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">GymFlow</span>
            </div>
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
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Decoraciones de fondo */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenido */}
            <div>
              {/* Badge de urgencia */}
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6 animate-pulse">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-semibold">+247 gimnasios se unieron este mes</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                El Sistema de Gestión que{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Revoluciona
                </span>{' '}
                tu Gimnasio
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Aumenta tus ingresos hasta un <span className="font-bold text-blue-600">43%</span> con
                la plataforma todo-en-uno que usan más de <span className="font-bold text-indigo-600">1,200+ gimnasios</span> para
                gestionar miembros, clases, nutrición y pagos automáticamente.
              </p>

              {/* Métricas destacadas */}
              <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">1,200+</div>
                  <div className="text-sm text-gray-600">Gimnasios Activos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-1">98%</div>
                  <div className="text-sm text-gray-600">Satisfacción</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">24/7</div>
                  <div className="text-sm text-gray-600">Soporte</div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>Crear mi Gimnasio Gratis</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
                >
                  Iniciar Sesión
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Sin tarjeta de crédito</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Setup en 5 minutos</span>
                </div>
              </div>
            </div>

            {/* Imagen Hero */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80"
                  alt="Dashboard de gestión de gimnasio moderno"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>

              {/* Floating stats card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">+43%</div>
                    <div className="text-sm text-gray-600">Crecimiento promedio</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gray-600 font-medium mb-6">Confiado por gimnasios líderes en toda Latinoamérica</p>
            <div className="flex items-center justify-center space-x-2 text-yellow-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 fill-current" />
              ))}
              <span className="ml-2 text-gray-900 font-semibold">4.9/5.0</span>
              <span className="text-gray-500">(347 reseñas)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que Necesitas en una Sola Plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desde gestión de miembros hasta planes nutricionales personalizados.
              Ahorra <span className="font-bold text-blue-600">15+ horas semanales</span> en tareas administrativas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gestión de Usuarios</h3>
              <p className="text-gray-600 mb-4">
                Administra miembros, entrenadores y staff. Control de acceso por roles y seguimiento completo de actividad.
              </p>
              <div className="flex items-center text-blue-600 font-semibold text-sm">
                <span>Sistema multi-gimnasio incluido</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="h-7 w-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Programación Inteligente</h3>
              <p className="text-gray-600 mb-4">
                Crea horarios, programa clases y eventos automáticamente. Sincronización en tiempo real con tu equipo.
              </p>
              <div className="flex items-center text-indigo-600 font-semibold text-sm">
                <span>+85% reducción en conflictos</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Utensils className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Planes Nutricionales</h3>
              <p className="text-gray-600 mb-4">
                Sistema completo de nutrición con templates, planes live y seguimiento de comidas. Exportación automática.
              </p>
              <div className="flex items-center text-purple-600 font-semibold text-sm">
                <span>3 tipos de planes incluidos</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Chat en Tiempo Real</h3>
              <p className="text-gray-600 mb-4">
                Comunicación instantánea con miembros y staff. Chats grupales para eventos y clases. Powered by Stream.
              </p>
              <div className="flex items-center text-green-600 font-semibold text-sm">
                <span>Mensajería estilo Messenger</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <ClipboardList className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sistema de Encuestas</h3>
              <p className="text-gray-600 mb-4">
                13 tipos de preguntas, lógica condicional y estadísticas automáticas. Exporta a CSV/Excel en un click.
              </p>
              <div className="flex items-center text-orange-600 font-semibold text-sm">
                <span>Encuestas anónimas disponibles</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Análisis Avanzado</h3>
              <p className="text-gray-600 mb-4">
                Dashboard con métricas en tiempo real, gráficos interactivos y reportes automatizados para tomar mejores decisiones.
              </p>
              <div className="flex items-center text-red-600 font-semibold text-sm">
                <span>Insights accionables diarios</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que Dicen Nuestros Clientes
            </h2>
            <p className="text-xl text-gray-600">
              Resultados reales de gimnasios que crecieron con GymFlow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
              <div className="flex items-center space-x-1 text-yellow-500 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Desde que implementamos GymFlow, nuestros ingresos aumentaron un 52% en 6 meses.
                La automatización de pagos y la gestión de clases nos ahorró muchísimo tiempo."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                  CR
                </div>
                <div>
                  <div className="font-bold text-gray-900">Carlos Rodríguez</div>
                  <div className="text-sm text-gray-600">Owner, FitZone CDMX</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
              <div className="flex items-center space-x-1 text-yellow-500 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "El sistema de nutrición es increíble. Mis clientes están más comprometidos y
                puedo escalar mi negocio sin contratar más personal administrativo."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  AM
                </div>
                <div>
                  <div className="font-bold text-gray-900">Ana Martínez</div>
                  <div className="text-sm text-gray-600">Entrenadora Personal, Buenos Aires</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
              <div className="flex items-center space-x-1 text-yellow-500 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "La mejor inversión que hicimos. El ROI fue positivo desde el primer mes.
                Nuestros miembros aman la app y el chat integrado."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                  JL
                </div>
                <div>
                  <div className="font-bold text-gray-900">Jorge López</div>
                  <div className="text-sm text-gray-600">Director, PowerGym Bogotá</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Números que Hablan por Sí Solos
            </h2>
            <p className="text-xl text-blue-100">
              El impacto real de GymFlow en gimnasios de todo el mundo
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">1,200+</div>
              <div className="text-blue-100">Gimnasios Activos</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">45,000+</div>
              <div className="text-blue-100">Usuarios Diarios</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">$2.3M+</div>
              <div className="text-blue-100">Procesado en Pagos</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime Garantizado</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-full mb-6">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-semibold">Oferta limitada: 30 días gratis + setup incluido</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Únete a los 1,200+ Gimnasios que ya Crecen con GymFlow
          </h2>

          <p className="text-xl text-gray-600 mb-10">
            No pierdas más tiempo con hojas de cálculo y sistemas obsoletos.
            Comienza gratis hoy y ve resultados en menos de una semana.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/register"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-xl font-bold text-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Crear mi Gimnasio Ahora</span>
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Cancela cuando quieras</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span>Datos 100% seguros</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">GymFlow</span>
              </div>
              <p className="text-sm">
                La plataforma todo-en-uno para gestionar tu gimnasio de manera profesional.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Casos de Éxito</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Seguridad</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2024 GymFlow. Todos los derechos reservados.</p>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Globe className="h-4 w-4" />
              <span className="text-sm">Disponible en toda Latinoamérica</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
