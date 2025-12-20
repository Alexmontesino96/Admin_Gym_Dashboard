'use client'

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  Globe,
  Camera,
  Lock,
  Flame,
  Users2,
  Grid,
  BellRing,
  Heart,
  CalendarCheck,
  Activity,
  TrendingDown,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import '@/lib/i18n'
import LanguageSelector from './LanguageSelector'

export default function LandingPage() {
  const { t } = useTranslation()
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
              <LanguageSelector />
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {t('nav.createGym')}
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
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-4 py-2 rounded-full mb-6 animate-pulse">
                <Flame className="h-4 w-4" />
                <span className="text-sm font-semibold">235 {t('hero.badge')}</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {t('hero.headline')}{' '}
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  {t('hero.headlineHighlight')}
                </span>{' '}
                {t('hero.headlineEnd')}
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {t('hero.subheadline')} <span className="font-bold text-purple-600">{t('hero.subheadlineRetention')}</span> {t('hero.subheadlineContinue')} <span className="font-bold text-pink-600">{t('hero.stories')}</span>, <span className="font-bold text-green-600">{t('hero.chat')}</span> {t('hero.subheadlineEnd')} <span className="font-bold text-blue-600">{t('hero.feed')}</span> {t('hero.subheadlineEnd')} <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{t('hero.instagram')}</span>{t('hero.subheadlineFitness')} <span className="font-bold text-indigo-600">{t('hero.gymsCount')}</span> {t('hero.subheadlineLocation')}
              </p>

              {/* Métricas destacadas */}
              <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">{t('hero.metric1Value')}</div>
                  <div className="text-sm text-gray-600">{t('hero.metric1Label')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">{t('hero.metric2Value')}</div>
                  <div className="text-sm text-gray-600">{t('hero.metric2Label')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600 mb-1">{t('hero.metric3Value')}</div>
                  <div className="text-sm text-gray-600">{t('hero.metric3Label')}</div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>{t('hero.ctaPrimary')}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
                >
                  {t('hero.ctaSecondary')}
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>{t('hero.trustBadge1')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>{t('hero.trustBadge2')}</span>
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
                    <div className="text-2xl font-bold text-gray-900">{t('hero.floatingCardValue')}</div>
                    <div className="text-sm text-gray-600">{t('hero.floatingCardLabel')}</div>
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
            <p className="text-gray-600 font-medium mb-6">{t('socialProof.title')}</p>
            <div className="flex items-center justify-center space-x-2 text-yellow-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 fill-current" />
              ))}
              <span className="ml-2 text-gray-900 font-semibold">{t('socialProof.rating')}</span>
              <span className="text-gray-500">({t('socialProof.reviews')})</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 border-y border-red-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              El Problema Oculto que Está{' '}
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Matando
              </span>{' '}
              tu Gimnasio
            </h2>
            <div className="flex flex-col items-center mb-4">
              <div className="text-7xl lg:text-8xl font-black text-red-600 mb-2">30-40%</div>
              <p className="text-2xl text-gray-700 font-semibold">de tus miembros se van cada año</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {/* Problema 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-red-100">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Miembros Desconectados</h3>
              <p className="text-gray-600 leading-relaxed">
                Llegan, entrenan, se van. Sin comunidad, sin engagement. Son solo un número en tu lista de cobros.
              </p>
            </div>

            {/* Problema 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-orange-100">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingDown className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Baja Asistencia a Clases</h3>
              <p className="text-gray-600 leading-relaxed">
                Clases medio vacías porque olvidan reservar o no saben qué hay. Pierdes dinero en cada clase.
              </p>
            </div>

            {/* Problema 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-amber-100">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sin Lealtad de Marca</h3>
              <p className="text-gray-600 leading-relaxed">
                Te ven como "otro gimnasio más", no como su segunda casa. Al primer descuento de la competencia, se van.
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xl text-gray-700 font-semibold mb-2">¿Te suena familiar?</p>
            <div className="flex items-center justify-center text-purple-600 font-bold text-lg">
              <span>Hay una mejor manera</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades en Tiempo Real que Crean Adicción
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Las mismas features que <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Instagram</span>, <span className="font-bold text-gray-900">TikTok</span> y <span className="font-bold text-green-600">WhatsApp</span> usan para mantenerte enganchado.
              Ahora para <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">tu</span> gimnasio.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Stories */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 hover:border-purple-300">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-6">
                <Camera className="h-7 w-7 text-purple-600" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-gray-900">Stories que Desaparecen en 24h</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Comparte WODs del día, transformaciones de clientes, tips de entrenamiento. Tus miembros revisan las stories cada mañana como revisan <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Instagram</span>. <span className="font-bold text-purple-600">+300% más engagement</span> vs posts normales.
              </p>
              <div className="bg-purple-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-purple-700 font-semibold">892 gimnasios lo usan</div>
              </div>
              <div className="flex items-center text-purple-600 font-semibold text-sm hover:text-purple-700 transition-colors">
                <span>Como <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Instagram</span>, pero tuyo</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Feature 2: Chat */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 hover:border-green-300">
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="h-7 w-7 text-green-600" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-gray-900">Mensajería Instantánea con Encriptación E2E</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Tus miembros te escriben directamente. Entrenadores responden dudas al instante. Chats grupales para cada clase. Todo encriptado como <span className="font-bold text-green-600">WhatsApp</span>. <span className="font-bold text-green-600">+40% mejor comunicación</span> vs email.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-green-50 rounded-lg px-3 py-1.5">
                  <div className="flex items-center gap-1 text-xs text-green-700 font-semibold">
                    <Lock className="h-3 w-3" />
                    <span>Encriptación E2E</span>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg px-3 py-1.5">
                  <div className="text-xs text-green-700 font-semibold">500K+ mensajes/día</div>
                </div>
              </div>
              <div className="flex items-center text-green-600 font-semibold text-sm hover:text-green-700 transition-colors">
                <span>Conecta con tu comunidad</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Feature 3: Feed Social */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 hover:border-blue-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Grid className="h-7 w-7 text-blue-600" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-gray-900">Tu Propia Red Social Fitness</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Feed personalizado con posts, fotos de progreso, logros. Likes, comentarios y menciones en tiempo real. Construye comunidad sin depender de <span className="font-bold text-blue-600">Facebook</span> o <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Instagram</span>. <span className="font-bold text-blue-600">+250% interacción</span> vs redes externas.
              </p>
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-blue-700 font-semibold">100K+ posts al mes</div>
              </div>
              <div className="flex items-center text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors">
                <span>Crea tu comunidad</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Feature 4: Notificaciones */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 hover:border-orange-300">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mb-6">
                <BellRing className="h-7 w-7 text-orange-600" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-gray-900">Push Notifications que Aumentan Asistencia</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Recordatorios 30 min antes de clase. Avisos cuando hay cupo en clase llena. Alertas de eventos nuevos. <span className="font-bold text-orange-600">Reduce no-shows en 40%</span> y llena tus clases automáticamente.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-orange-50 rounded-lg px-3 py-1.5">
                  <div className="text-xs text-orange-700 font-semibold">40% menos ausencias</div>
                </div>
                <div className="bg-orange-50 rounded-lg px-3 py-1.5">
                  <div className="text-xs text-orange-700 font-semibold">Adiós a clases vacías</div>
                </div>
              </div>
              <div className="flex items-center text-orange-600 font-semibold text-sm hover:text-orange-700 transition-colors">
                <span>Llena tus clases</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Feature 5: Actividad en Vivo */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 hover:border-cyan-300">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Activity className="h-7 w-7 text-cyan-600" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-gray-900">FOMO Social: "Quién Está Entrenando Ahora"</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Dashboard en vivo muestra quién está en el gym en este momento. Crea FOMO social que motiva a más miembros a ir. Rachas de días consecutivos gamificadas. <span className="font-bold text-cyan-600">+35% más visitas</span> por presión social positiva.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-cyan-50 rounded-lg px-3 py-1.5">
                  <div className="text-xs text-cyan-700 font-semibold">35% más visitas</div>
                </div>
                <div className="bg-cyan-50 rounded-lg px-3 py-1.5">
                  <div className="text-xs text-cyan-700 font-semibold">Rachas desbloqueables</div>
                </div>
              </div>
              <div className="flex items-center text-cyan-600 font-semibold text-sm hover:text-cyan-700 transition-colors">
                <span>Activa el FOMO</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Feature 6: Gestión de Clases */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 hover:border-emerald-300">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center mb-6">
                <CalendarCheck className="h-7 w-7 text-emerald-600" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-gray-900">Reserva en 3 Segundos + Lista de Espera</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Contador en tiempo real de cupos. Registro instantáneo. Lista de espera inteligente con notificación automática si se libera lugar. <span className="font-bold text-emerald-600">Sistema justo</span> que tus miembros amarán.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-emerald-50 rounded-lg px-3 py-1.5">
                  <div className="text-xs text-emerald-700 font-semibold">Sistema justo</div>
                </div>
                <div className="bg-emerald-50 rounded-lg px-3 py-1.5">
                  <div className="text-xs text-emerald-700 font-semibold">Reserva en 3 segundos</div>
                </div>
              </div>
              <div className="flex items-center text-emerald-600 font-semibold text-sm hover:text-emerald-700 transition-colors">
                <span>Nunca pierdas un lugar</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Realtime Matters Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-8">
              El Secreto de la Retención:{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                Tiempo Real
              </span>
            </h2>
            <div className="max-w-3xl mx-auto space-y-3">
              <p className="text-2xl font-semibold text-indigo-200">
                <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Instagram</span>, <span className="font-bold text-green-400">WhatsApp</span>, <span className="font-bold text-white">TikTok</span>. ¿Qué tienen en común?
              </p>
              <p className="text-xl text-indigo-300">
                Actualizaciones <span className="font-bold text-cyan-400">EN TIEMPO REAL</span> que crean hábitos adictivos.
              </p>
              <p className="text-xl text-indigo-300">
                Ahora lleva ese poder a <span className="font-bold text-pink-400">tu gimnasio</span>.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Velocidad Crea Hábito */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Velocidad Crea Hábito</h3>
              <p className="text-indigo-200 text-lg leading-relaxed">
                Notificaciones instantáneas = respuestas instantáneas = usuarios enganchados.
                La velocidad crea la sensación de conexión inmediata.
              </p>
            </div>

            {/* Actualización Constante */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <RefreshCw className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Actualización Constante</h3>
              <p className="text-indigo-200 text-lg leading-relaxed">
                Feeds que cambian constantemente dan razón para volver cada día.
                Como <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Instagram</span> Stories: siempre hay algo nuevo que ver.
              </p>
            </div>

            {/* Presión Social Positiva */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <Users2 className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Presión Social Positiva</h3>
              <p className="text-indigo-200 text-lg leading-relaxed">
                Ver que otros están entrenando HOY motiva a ir.
                El FOMO (Fear of Missing Out) es el mejor entrenador personal.
              </p>
            </div>
          </div>

          {/* Stat Final */}
          <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-10 border-2 border-cyan-400/50">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mb-4">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            <p className="text-5xl lg:text-6xl font-black mb-3 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              60%
            </p>
            <p className="text-2xl font-semibold text-white">
              Gimnasios con features en tiempo real tienen{' '}
              <span className="text-cyan-400">60% más retención</span>
            </p>
            <p className="text-lg text-indigo-300 mt-4">
              Eso es +$50,000 USD al año para un gimnasio promedio
            </p>
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
            {/* Testimonial 1: Retención mejorada */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center space-x-1 text-yellow-500 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic text-lg leading-relaxed">
                  "Desde GymFlow, nuestra <span className="font-bold text-purple-600">retención subió de 65% a 91%</span>.
                  Las stories diarias y el chat hacen que nuestros miembros se sientan parte de una familia, no solo clientes."
                </p>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg px-4 py-2 mb-4 inline-block">
                  <div className="text-sm font-bold text-purple-700">De 65% a 91% retención en 6 meses</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    CR
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Carlos Rodríguez</div>
                    <div className="text-sm text-gray-600">Owner, FitZone CDMX</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2: Engagement con Stories */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border-2 border-orange-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center space-x-1 text-yellow-500 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic text-lg leading-relaxed">
                  "Mis clientes revisan las stories del gym <span className="font-bold text-orange-600">3-4 veces al día</span>.
                  Es como su <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Instagram</span> fitness personal. Creé una comunidad tan fuerte que se recomiendan entre ellos."
                </p>
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg px-4 py-2 mb-4 inline-block">
                  <div className="text-sm font-bold text-orange-700">3-4 vistas diarias por miembro</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                    AM
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Ana Martínez</div>
                    <div className="text-sm text-gray-600">Entrenadora Personal, Buenos Aires</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3: Reducción de No-Shows */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border-2 border-emerald-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center space-x-1 text-yellow-500 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic text-lg leading-relaxed">
                  "Las notificaciones push <span className="font-bold text-emerald-600">redujeron nuestros no-shows de 35% a 8%</span>.
                  Las clases están siempre llenas. Y cuando alguien cancela, la lista de espera automática llena el cupo al instante."
                </p>
                <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg px-4 py-2 mb-4 inline-block">
                  <div className="text-sm font-bold text-emerald-700">De 35% a 8% no-shows</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
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
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              El Engagement en Tiempo Real que Genera Resultados
            </h2>
            <p className="text-xl text-blue-100">
              Métricas reales de uso y engagement de nuestras comunidades fitness
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Stat 1: Mensajes Diarios */}
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl mb-4">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div className="text-5xl font-bold mb-2">500K+</div>
              <div className="text-blue-100 font-medium">Mensajes Enviados Diariamente</div>
              <p className="text-xs text-blue-200 mt-2">Comunicación activa 24/7</p>
            </div>

            {/* Stat 2: Stories Publicadas */}
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl mb-4">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-blue-100 font-medium">Stories Publicadas al Día</div>
              <p className="text-xs text-blue-200 mt-2">Contenido fresco constantemente</p>
            </div>

            {/* Stat 3: Aumento en Retención */}
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl mb-4">
                <Heart className="h-8 w-8 text-white fill-white" />
              </div>
              <div className="text-5xl font-bold mb-2">+60%</div>
              <div className="text-blue-100 font-medium">Promedio de Aumento en Retención</div>
              <p className="text-xs text-blue-200 mt-2">Miembros que se quedan más tiempo</p>
            </div>

            {/* Stat 4: Reducción de No-Shows */}
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl mb-4">
                <BellRing className="h-8 w-8 text-white" />
              </div>
              <div className="text-5xl font-bold mb-2">-40%</div>
              <div className="text-blue-100 font-medium">Menos No-Shows a Clases</div>
              <p className="text-xs text-blue-200 mt-2">Notificaciones que funcionan</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge de urgencia mejorado */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-100 to-orange-100 text-red-700 px-5 py-3 rounded-full mb-6 border-2 border-red-200 shadow-lg animate-pulse">
            <Flame className="h-5 w-5" />
            <span className="text-sm font-bold">Solo quedan 47 espacios este mes para el setup gratuito</span>
          </div>

          {/* Headline emocional */}
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Deja de Perder Miembros.{' '}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Crea una Comunidad
            </span>{' '}
            que se Queda.
          </h2>

          {/* Subheadline con urgencia */}
          <p className="text-xl lg:text-2xl text-gray-700 mb-4 leading-relaxed max-w-3xl mx-auto">
            Cada día que esperas, <span className="font-bold text-red-600">pierdes miembros</span> a gimnasios con mejor engagement.
          </p>
          <p className="text-lg text-gray-600 mb-10">
            Activa <span className="font-semibold text-purple-600">Stories</span>, <span className="font-semibold text-green-600">Chat</span> y <span className="font-semibold text-blue-600">Feed</span> en menos de 5 minutos.{' '}
            <span className="font-bold">Sin tarjeta. Sin compromiso.</span>
          </p>

          {/* CTA Button mejorado */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/register"
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white px-12 py-5 rounded-xl font-bold text-xl hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center space-x-2 border-2 border-white/20"
            >
              <span>Activar mi Comunidad Ahora</span>
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>

          {/* Trust badges mejorados */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold">Sin tarjeta de crédito</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="font-semibold">Setup en 5 minutos</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">Datos 100% seguros</span>
            </div>
          </div>

          {/* Social proof adicional */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm mb-3">Únete a más de 1,200 gimnasios que ya están transformando su retención:</p>
            <div className="flex items-center justify-center space-x-2 text-yellow-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 fill-current" />
              ))}
              <span className="ml-2 text-gray-900 font-semibold">4.9/5.0</span>
              <span className="text-gray-500">(347 reseñas verificadas)</span>
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
