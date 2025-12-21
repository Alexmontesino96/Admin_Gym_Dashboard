'use client'

import { useState } from 'react'
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
  RefreshCw,
  Sparkles,
  UserPlus,
  Rocket,
  DollarSign,
  ArrowDown,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import '@/lib/i18n'
import LanguageSelector from './LanguageSelector'

export default function LandingPage() {
  const { t } = useTranslation()
  const [segment, setSegment] = useState<'gym' | 'trainer'>('gym')

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
                {t(segment === 'gym' ? 'nav.createGym' : 'nav.createWorkspace')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - MEJORADO */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Decoraciones de fondo */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Toggle de Segmento */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center bg-white/80 backdrop-blur-md rounded-full p-1 shadow-lg border border-gray-200">
              <button
                onClick={() => setSegment('gym')}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                  segment === 'gym'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('segment.gym')}
              </button>
              <button
                onClick={() => setSegment('trainer')}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                  segment === 'trainer'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('segment.trainer')}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenido */}
            <div>
              {/* Badge de social proof */}
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-full mb-6">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-semibold">{t(segment === 'gym' ? 'hero.socialProofGym' : 'hero.socialProofTrainer')}</span>
              </div>

              {/* NUEVO HEADLINE - Personalizado por segmento */}
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {segment === 'gym' ? (
                  <>
                    {t('hero.headlineGym1')}{' '}
                    <span className="text-red-600">{t('hero.headlineGym2')}</span>{' '}
                    {t('hero.headlineGym3')}{' '}
                    <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                      {t('hero.headlineGym4')}
                    </span>
                  </>
                ) : (
                  <>
                    {t('hero.headlineTrainer1')}{' '}
                    <span className="text-red-600">{t('hero.headlineTrainer2')}</span>{' '}
                    {t('hero.headlineTrainer3')}{' '}
                    <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                      {t('hero.headlineTrainer4')}
                    </span>
                  </>
                )}
              </h1>

              {/* NUEVO SUBHEADLINE - Simplificado */}
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {t(segment === 'gym' ? 'hero.subheadlineGym' : 'hero.subheadlineTrainer')}
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

              {/* CTAs MEJORADOS */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <span>{t('hero.ctaPrimary')}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/precios"
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

          {/* PUENTE NARRATIVO al problema */}
          <div className="text-center mt-16">
            <p className="text-lg text-gray-500 font-medium">
              {t('hero.bridgeText')}
            </p>
            <ArrowDown className="h-6 w-6 text-gray-400 mx-auto mt-4 animate-bounce" />
          </div>
        </div>
      </section>

      {/* REORDENADO: Problem Section ARRIBA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 border-y border-red-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>

            {/* NUEVO HEADLINE - Con dolor monetario */}
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {segment === 'gym' ? (
                <>
                  {t('problem.titleGym1')}{' '}
                  <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    {t('problem.titleGym2')}
                  </span>{' '}
                  {t('problem.titleGym3')}
                </>
              ) : (
                <>
                  {t('problem.titleTrainer1')}{' '}
                  <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    {t('problem.titleTrainer2')}
                  </span>{' '}
                  {t('problem.titleTrainer3')}
                </>
              )}
            </h2>

            <p className="text-xl text-gray-700 mb-2">
              {t('problem.subtitle1')}
            </p>
            <p className="text-2xl text-gray-900 font-semibold mb-4">
              {t('problem.subtitle2')}
            </p>

            <div className="flex flex-col items-center mb-4">
              <div className="text-7xl lg:text-8xl font-black text-red-600 mb-2">
                {t('problem.statValue')}
              </div>
              <p className="text-2xl text-gray-700 font-semibold">
                {t(segment === 'gym' ? 'problem.statLabelGym' : 'problem.statLabelTrainer')}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {/* Problema 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-red-100">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t(segment === 'gym' ? 'problem.issue1TitleGym' : 'problem.issue1TitleTrainer')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t(segment === 'gym' ? 'problem.issue1DescGym' : 'problem.issue1DescTrainer')}
              </p>
            </div>

            {/* Problema 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-orange-100">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingDown className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t(segment === 'gym' ? 'problem.issue2TitleGym' : 'problem.issue2TitleTrainer')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t(segment === 'gym' ? 'problem.issue2DescGym' : 'problem.issue2DescTrainer')}
              </p>
            </div>

            {/* Problema 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-amber-100">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t(segment === 'gym' ? 'problem.issue3TitleGym' : 'problem.issue3TitleTrainer')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t(segment === 'gym' ? 'problem.issue3DescGym' : 'problem.issue3DescTrainer')}
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xl text-gray-700 font-semibold mb-2">{t('problem.question')}</p>
            <div className="flex items-center justify-center text-purple-600 font-bold text-lg">
              <span>{t('problem.cta')}</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </div>
          </div>
        </div>
      </section>

      {/* NUEVA SECCION: Solution Reveal */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-6">
              <Sparkles className="h-10 w-10 text-purple-600" />
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              {t('solution.title1')}{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('solution.title2')}
              </span>
            </h2>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              {t(segment === 'gym' ? 'solution.subtitleGym' : 'solution.subtitleTrainer')}
            </p>
          </div>

          {/* Comparación Visual Antes/Después */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-red-50 rounded-xl p-8 border-2 border-red-200">
              <div className="flex items-center justify-center mb-4">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-4 text-center">
                {t('solution.beforeTitle')}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2 text-gray-700">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>{t(segment === 'gym' ? 'solution.before1Gym' : 'solution.before1Trainer')}</span>
                </li>
                <li className="flex items-start space-x-2 text-gray-700">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>{t(segment === 'gym' ? 'solution.before2Gym' : 'solution.before2Trainer')}</span>
                </li>
                <li className="flex items-start space-x-2 text-gray-700">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>{t(segment === 'gym' ? 'solution.before3Gym' : 'solution.before3Trainer')}</span>
                </li>
                <li className="flex items-start space-x-2 text-gray-700">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>{t(segment === 'gym' ? 'solution.before4Gym' : 'solution.before4Trainer')}</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl p-8 border-2 border-green-200 relative">
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                {t('solution.badge')}
              </div>
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-4 text-center">
                {t('solution.afterTitle')}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2 text-gray-700">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="font-medium">{t(segment === 'gym' ? 'solution.after1Gym' : 'solution.after1Trainer')}</span>
                </li>
                <li className="flex items-start space-x-2 text-gray-700">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="font-medium">{t(segment === 'gym' ? 'solution.after2Gym' : 'solution.after2Trainer')}</span>
                </li>
                <li className="flex items-start space-x-2 text-gray-700">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="font-medium">{t(segment === 'gym' ? 'solution.after3Gym' : 'solution.after3Trainer')}</span>
                </li>
                <li className="flex items-start space-x-2 text-gray-700">
                  <span className="text-green-600 mt-1">✓</span>
                  <span className="font-medium">{t(segment === 'gym' ? 'solution.after4Gym' : 'solution.after4Trainer')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section MEJORADA - Con logos */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm font-medium mb-6 uppercase tracking-wide">
              {t('socialProof.title')}
            </p>

            {/* Logos placeholder */}
            <div className="flex items-center justify-center flex-wrap gap-8 md:gap-12 opacity-60 mb-8">
              <div className="text-xl font-bold text-gray-400">FitZone</div>
              <div className="text-xl font-bold text-gray-400">PowerGym</div>
              <div className="text-xl font-bold text-gray-400">CrossFit MX</div>
              <div className="text-xl font-bold text-gray-400">Elite Fitness</div>
              <div className="text-xl font-bold text-gray-400">+1,196 más</div>
            </div>

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

      {/* Features Section - MEJORADA */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('features.title1')}{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t('features.title2')}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Stories */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 hover:border-purple-300">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-6">
                <Camera className="h-7 w-7 text-purple-600" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-gray-900">{t('features.story.title')}</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {t('features.story.desc')} <span className="font-bold text-purple-600">{t('features.story.metric')}</span> {t('features.story.descEnd')}
              </p>
              <div className="bg-purple-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-purple-700 font-semibold">{t('features.story.badge')}</div>
              </div>
              <div className="flex items-center text-purple-600 font-semibold text-sm hover:text-purple-700 transition-colors">
                <span>{t('features.story.cta')}</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Feature 2: Chat */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 hover:border-green-300">
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-teal-100 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="h-7 w-7 text-green-600" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-gray-900">{t('features.chat.title')}</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {t('features.chat.desc')} <span className="font-bold text-green-600">{t('features.chat.metric')}</span> {t('features.chat.descEnd')}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-green-50 rounded-lg px-3 py-1.5">
                  <div className="flex items-center gap-1 text-xs text-green-700 font-semibold">
                    <Lock className="h-3 w-3" />
                    <span>{t('features.chat.badge1')}</span>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg px-3 py-1.5">
                  <div className="text-xs text-green-700 font-semibold">{t('features.chat.badge2')}</div>
                </div>
              </div>
              <div className="flex items-center text-green-600 font-semibold text-sm hover:text-green-700 transition-colors">
                <span>{t('features.chat.cta')}</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Feature 3: Feed Social */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 hover:border-blue-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Grid className="h-7 w-7 text-blue-600" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-gray-900">{t('features.socialFeed.title')}</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {t('features.socialFeed.desc')} <span className="font-bold text-blue-600">{t('features.socialFeed.metric')}</span> {t('features.socialFeed.descEnd')}
              </p>
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-blue-700 font-semibold">{t('features.socialFeed.badge')}</div>
              </div>
              <div className="flex items-center text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors">
                <span>{t('features.socialFeed.cta')}</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Feature 4: Notificaciones */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 hover:border-orange-300">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mb-6">
                <BellRing className="h-7 w-7 text-orange-600" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-gray-900">{t('features.notifications.title')}</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {t('features.notifications.desc')} <span className="font-bold text-orange-600">{t('features.notifications.metric')}</span> {t('features.notifications.descEnd')}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-orange-50 rounded-lg px-3 py-1.5">
                  <div className="text-xs text-orange-700 font-semibold">{t('features.notifications.badge1')}</div>
                </div>
                <div className="bg-orange-50 rounded-lg px-3 py-1.5">
                  <div className="text-xs text-orange-700 font-semibold">{t('features.notifications.badge2')}</div>
                </div>
              </div>
              <div className="flex items-center text-orange-600 font-semibold text-sm hover:text-orange-700 transition-colors">
                <span>{t('features.notifications.cta')}</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Feature 5: Actividad en Vivo */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 hover:border-cyan-300">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Activity className="h-7 w-7 text-cyan-600" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-gray-900">{t('features.liveActivity.title')}</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {t('features.liveActivity.desc')} <span className="font-bold text-cyan-600">{t('features.liveActivity.metric')}</span> {t('features.liveActivity.descEnd')}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-cyan-50 rounded-lg px-3 py-1.5">
                  <div className="text-xs text-cyan-700 font-semibold">{t('features.liveActivity.badge1')}</div>
                </div>
                <div className="bg-cyan-50 rounded-lg px-3 py-1.5">
                  <div className="text-xs text-cyan-700 font-semibold">{t('features.liveActivity.badge2')}</div>
                </div>
              </div>
              <div className="flex items-center text-cyan-600 font-semibold text-sm hover:text-cyan-700 transition-colors">
                <span>{t('features.liveActivity.cta')}</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            {/* Feature 6: Gestión de Clases */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200 border border-gray-100 hover:border-emerald-300">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center mb-6">
                <CalendarCheck className="h-7 w-7 text-emerald-600" />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-gray-900">{t('features.classBooking.title')}</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {t('features.classBooking.desc')} <span className="font-bold text-emerald-600">{t('features.classBooking.metric')}</span> {t('features.classBooking.descEnd')}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="bg-emerald-50 rounded-lg px-3 py-1.5">
                  <div className="text-xs text-emerald-700 font-semibold">{t('features.classBooking.badge1')}</div>
                </div>
                <div className="bg-emerald-50 rounded-lg px-3 py-1.5">
                  <div className="text-xs text-emerald-700 font-semibold">{t('features.classBooking.badge2')}</div>
                </div>
              </div>
              <div className="flex items-center text-emerald-600 font-semibold text-sm hover:text-emerald-700 transition-colors">
                <span>{t('features.classBooking.cta')}</span>
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
              {t('whyRealtime.title')}{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                {t('whyRealtime.titleHighlight')}
              </span>
            </h2>
            <div className="max-w-3xl mx-auto space-y-3">
              <p className="text-2xl font-semibold text-indigo-200">
                {t('whyRealtime.intro1')}
              </p>
              <p className="text-xl text-indigo-300">
                {t('whyRealtime.intro2')} <span className="font-bold text-cyan-400">{t('whyRealtime.intro2Highlight')}</span> {t('whyRealtime.intro2End')}
              </p>
              <p className="text-xl text-indigo-300">
                {t('whyRealtime.intro3')} <span className="font-bold text-pink-400">{t('whyRealtime.intro3Highlight')}</span>.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Velocidad Crea Hábito */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('whyRealtime.pillar1Title')}</h3>
              <p className="text-indigo-200 text-lg leading-relaxed">
                {t('whyRealtime.pillar1Desc')}
              </p>
            </div>

            {/* Actualización Constante */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <RefreshCw className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('whyRealtime.pillar2Title')}</h3>
              <p className="text-indigo-200 text-lg leading-relaxed">
                {t('whyRealtime.pillar2Desc')} {t('whyRealtime.pillar2DescEnd')}
              </p>
            </div>

            {/* Presión Social Positiva */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <Users2 className="h-9 w-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('whyRealtime.pillar3Title')}</h3>
              <p className="text-indigo-200 text-lg leading-relaxed">
                {t('whyRealtime.pillar3Desc')}
              </p>
            </div>
          </div>

          {/* Stat Final */}
          <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-10 border-2 border-cyan-400/50">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mb-4">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            <p className="text-5xl lg:text-6xl font-black mb-3 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              {t('whyRealtime.statValue')}
            </p>
            <p className="text-2xl font-semibold text-white">
              {t('whyRealtime.statText')}{' '}
              <span className="text-cyan-400">{t('whyRealtime.statHighlight')}</span>
            </p>
            <p className="text-lg text-indigo-300 mt-4">
              {t('whyRealtime.statSubtext')}
            </p>
          </div>
        </div>
      </section>

      {/* REORDENADO: How It Works - AHORA DESPUES de Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {t('howItWorks.title')}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t('howItWorks.titleHighlight')}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Paso 1: Crear Espacio */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200 h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 mt-2">
                  <Rocket className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('howItWorks.step1Title')}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {t('howItWorks.step1Desc')}
                </p>
                <div className="bg-blue-100 rounded-lg px-4 py-2 inline-block">
                  <div className="flex items-center gap-2 text-sm text-blue-700 font-semibold">
                    <Clock className="h-4 w-4" />
                    <span>{t('howItWorks.step1Time')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Paso 2: Invitar Miembros */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  2
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-6 mt-2">
                  <UserPlus className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('howItWorks.step2Title')}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {t('howItWorks.step2Desc')}
                </p>
                <div className="bg-purple-100 rounded-lg px-4 py-2 inline-block">
                  <div className="flex items-center gap-2 text-sm text-purple-700 font-semibold">
                    <Users className="h-4 w-4" />
                    <span>{t('howItWorks.step2Feature')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Paso 3: Publicar Primera Story */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200 h-full">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  3
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6 mt-2">
                  <Camera className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('howItWorks.step3Title')}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {t('howItWorks.step3Desc')}
                </p>
                <div className="bg-green-100 rounded-lg px-4 py-2 inline-block">
                  <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
                    <Zap className="h-4 w-4" />
                    <span>{t('howItWorks.step3Impact')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/register"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              <span>{t('howItWorks.cta')}</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              {t('howItWorks.ctaSubtext')}
            </p>
          </div>
        </div>
      </section>

      {/* FUSIONADO: Testimonials + Stats */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              {t('testimonials.title')}
            </h2>
            <p className="text-xl text-blue-100">
              {t('testimonials.subtitle')}
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-5xl font-bold mb-2">{t('stats.stat1Value')}</div>
              <div className="text-blue-100 font-medium mb-1">{t('stats.stat1Label')}</div>
              <p className="text-xs text-blue-200">{t('stats.stat1Subtext')}</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-5xl font-bold mb-2">{t('stats.stat3Value')}</div>
              <div className="text-blue-100 font-medium mb-1">{t('stats.stat3Label')}</div>
              <p className="text-xs text-blue-200">{t('stats.stat3Subtext')}</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-5xl font-bold mb-2">{t('stats.stat4Value')}</div>
              <div className="text-blue-100 font-medium mb-1">{t('stats.stat4Label')}</div>
              <p className="text-xs text-blue-200">{t('stats.stat4Subtext')}</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-5xl font-bold mb-2">{t('socialProof.rating')}</div>
              <div className="text-blue-100 font-medium mb-1">Calificación</div>
              <p className="text-xs text-blue-200">{t('socialProof.reviews')}</p>
            </div>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-300/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center space-x-1 text-yellow-400 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-white mb-4 italic text-lg leading-relaxed">
                  "{t('testimonials.testimonial1.quote')} <span className="font-bold text-purple-300">{t('testimonials.testimonial1.quoteHighlight')}</span>{t('testimonials.testimonial1.quoteContinue')}"
                </p>
                <div className="bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-lg px-4 py-2 mb-4 inline-block">
                  <div className="text-sm font-bold text-purple-200">{t('testimonials.testimonial1.badge')}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    CR
                  </div>
                  <div>
                    <div className="font-bold text-white">{t('testimonials.testimonial1.name')}</div>
                    <div className="text-sm text-blue-200">{t('testimonials.testimonial1.role')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-orange-300/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center space-x-1 text-yellow-400 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-white mb-4 italic text-lg leading-relaxed">
                  "{t('testimonials.testimonial2.quote')} <span className="font-bold text-orange-300">{t('testimonials.testimonial2.quoteHighlight')}</span>{t('testimonials.testimonial2.quoteContinue')} {t('testimonials.testimonial2.quoteContinue2')}"
                </p>
                <div className="bg-gradient-to-r from-orange-200/20 to-amber-200/20 rounded-lg px-4 py-2 mb-4 inline-block">
                  <div className="text-sm font-bold text-orange-200">{t('testimonials.testimonial2.badge')}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                    AM
                  </div>
                  <div>
                    <div className="font-bold text-white">{t('testimonials.testimonial2.name')}</div>
                    <div className="text-sm text-blue-200">{t('testimonials.testimonial2.role')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-emerald-300/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center space-x-1 text-yellow-400 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="text-white mb-4 italic text-lg leading-relaxed">
                  "{t('testimonials.testimonial3.quote')} <span className="font-bold text-emerald-300">{t('testimonials.testimonial3.quoteHighlight')}</span>{t('testimonials.testimonial3.quoteContinue')}"
                </p>
                <div className="bg-gradient-to-r from-emerald-200/20 to-teal-200/20 rounded-lg px-4 py-2 mb-4 inline-block">
                  <div className="text-sm font-bold text-emerald-200">{t('testimonials.testimonial3.badge')}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    JL
                  </div>
                  <div>
                    <div className="font-bold text-white">{t('testimonials.testimonial3.name')}</div>
                    <div className="text-sm text-blue-200">{t('testimonials.testimonial3.role')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NUEVA SECCION: Objeciones/FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {t('objections.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('objections.subtitle')}
            </p>
          </div>

          <div className="space-y-6">
            {/* Objecion 1 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {t('objections.obj1Question')}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t('objections.obj1Answer')}
                  </p>
                </div>
              </div>
            </div>

            {/* Objecion 2 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {t('objections.obj2Question')}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t('objections.obj2Answer')}
                  </p>
                </div>
              </div>
            </div>

            {/* Objecion 3 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {t('objections.obj3Question')}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t('objections.obj3Answer')}
                  </p>
                </div>
              </div>
            </div>

            {/* Objecion 4 */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {t('objections.obj4Question')}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t('objections.obj4Answer')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Section - MEJORADO */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge de social proof real */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-5 py-3 rounded-full mb-6 border-2 border-blue-200 shadow-lg">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-bold">{t('cta.realSocialProof')}</span>
          </div>

          {/* NUEVO HEADLINE - Con urgencia real y dolor monetario */}
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('cta.titleNew1')}{' '}
            <span className="text-red-600">{t('cta.titleNew2')}</span>.{' '}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              {t('cta.titleNew3')}
            </span>
          </h2>

          {/* Subheadline con dolor específico */}
          <p className="text-xl lg:text-2xl text-gray-700 mb-4 leading-relaxed max-w-3xl mx-auto">
            {t('cta.subtitleNew1')} <span className="font-bold text-red-600">{t('cta.subtitleNew2')}</span> {t('cta.subtitleNew3')}
          </p>

          <p className="text-lg text-gray-600 mb-10">
            {t('cta.urgency1')} <span className="font-bold">{t('cta.urgency2')}</span>
          </p>

          {/* CTA Button mejorado */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/register"
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white px-12 py-5 rounded-xl font-bold text-xl hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center space-x-2 border-2 border-white/20"
            >
              <span>{t('cta.button')}</span>
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>

          {/* Trust badges mejorados */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold">{t('cta.trust1')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="font-semibold">{t('cta.trust2')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">{t('cta.trust3')}</span>
            </div>
          </div>

          {/* Social proof adicional */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm mb-3">{t('cta.socialProof')}</p>
            <div className="flex items-center justify-center space-x-2 text-yellow-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 fill-current" />
              ))}
              <span className="ml-2 text-gray-900 font-semibold">4.9/5.0</span>
              <span className="text-gray-500">({t('cta.verifiedReviews')})</span>
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
                {t('footer.tagline')}
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.productTitle')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">{t('footer.features')}</a></li>
                <li><Link href="/precios" className="hover:text-white transition-colors">{t('footer.pricing')}</Link></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">{t('footer.successCases')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.supportTitle')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.docs')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.helpCenter')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.legalTitle')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t('footer.security')}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">{t('footer.copyright')}</p>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Globe className="h-4 w-4" />
              <span className="text-sm">{t('footer.availability')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
