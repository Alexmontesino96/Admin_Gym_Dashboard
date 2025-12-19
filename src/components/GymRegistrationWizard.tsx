'use client'

import { useState } from 'react'
import {
  User,
  Lock,
  Mail,
  Phone,
  Building2,
  MapPin,
  Globe,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

// Tipos
interface OwnerData {
  email: string
  password: string
  confirmPassword: string
  first_name: string
  last_name: string
  phone: string
}

interface GymData {
  gym_name: string
  gym_address: string
  gym_phone: string
  gym_email: string
  timezone: string
}

interface PasswordStrength {
  score: number
  label: string
  color: string
}

const TIMEZONES = [
  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
  { value: 'America/Cancun', label: 'Cancún (GMT-5)' },
  { value: 'America/Monterrey', label: 'Monterrey (GMT-6)' },
  { value: 'America/Tijuana', label: 'Tijuana (GMT-8)' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)' },
  { value: 'America/New_York', label: 'Nueva York (GMT-5)' },
  { value: 'America/Chicago', label: 'Chicago (GMT-6)' },
  { value: 'America/Denver', label: 'Denver (GMT-7)' },
  { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
  { value: 'America/Lima', label: 'Lima (GMT-5)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
  { value: 'America/Santiago', label: 'Santiago (GMT-3)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
  { value: 'Europe/London', label: 'Londres (GMT+0)' }
]

export default function GymRegistrationWizard() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Estados de los formularios
  const [ownerData, setOwnerData] = useState<OwnerData>({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: ''
  })

  const [gymData, setGymData] = useState<GymData>({
    gym_name: '',
    gym_address: '',
    gym_phone: '',
    gym_email: '',
    timezone: 'America/Mexico_City'
  })

  // Validación de email
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  // Validación de teléfono
  const validatePhone = (phone: string): boolean => {
    if (!phone) return true // Opcional
    const cleaned = phone.replace(/[\s-]/g, '')
    return /^\+?[1-9]\d{1,14}$/.test(cleaned)
  }

  // Fortaleza de contraseña
  const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0

    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) return { score, label: 'Débil', color: 'red' }
    if (score <= 4) return { score, label: 'Media', color: 'orange' }
    return { score, label: 'Fuerte', color: 'green' }
  }

  // Validar paso 1
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {}

    if (!ownerData.email) {
      errors.email = 'El email es requerido'
    } else if (!validateEmail(ownerData.email)) {
      errors.email = 'Email inválido'
    }

    if (!ownerData.password) {
      errors.password = 'La contraseña es requerida'
    } else if (ownerData.password.length < 8) {
      errors.password = 'Mínimo 8 caracteres'
    } else if (!/[A-Z]/.test(ownerData.password)) {
      errors.password = 'Debe contener al menos una mayúscula'
    } else if (!/[a-z]/.test(ownerData.password)) {
      errors.password = 'Debe contener al menos una minúscula'
    } else if (!/\d/.test(ownerData.password)) {
      errors.password = 'Debe contener al menos un número'
    }

    if (!ownerData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña'
    } else if (ownerData.password !== ownerData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (!ownerData.first_name || ownerData.first_name.length < 2) {
      errors.first_name = 'El nombre debe tener al menos 2 caracteres'
    }

    if (!ownerData.last_name || ownerData.last_name.length < 2) {
      errors.last_name = 'El apellido debe tener al menos 2 caracteres'
    }

    if (ownerData.phone && !validatePhone(ownerData.phone)) {
      errors.phone = 'Formato: +525512345678'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validar paso 2
  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {}

    if (!gymData.gym_name || gymData.gym_name.length < 3) {
      errors.gym_name = 'El nombre debe tener al menos 3 caracteres'
    }

    if (gymData.gym_email && !validateEmail(gymData.gym_email)) {
      errors.gym_email = 'Email inválido'
    }

    if (gymData.gym_phone && !validatePhone(gymData.gym_phone)) {
      errors.gym_phone = 'Formato: +525512345678'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Ir al siguiente paso
  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
      setError(null)
      setFieldErrors({})
    }
  }

  // Volver al paso anterior
  const handleBack = () => {
    setStep(1)
    setError(null)
    setFieldErrors({})
  }

  // Submit final
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep2()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = {
        // Datos del owner
        email: ownerData.email,
        password: ownerData.password,
        first_name: ownerData.first_name,
        last_name: ownerData.last_name,
        phone: ownerData.phone || undefined,
        // Datos del gimnasio
        gym_name: gymData.gym_name,
        gym_address: gymData.gym_address || undefined,
        gym_phone: gymData.gym_phone || undefined,
        gym_email: gymData.gym_email || undefined,
        timezone: gymData.timezone
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/register-gym-owner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        // Manejar errores específicos
        if (response.status === 422) {
          // Errores de validación de Pydantic
          const validationErrors: Record<string, string> = {}
          data.detail.forEach((err: { loc: string[]; msg: string }) => {
            const field = err.loc[err.loc.length - 1]
            validationErrors[field] = err.msg
          })
          setFieldErrors(validationErrors)
          setError('Por favor corrige los errores en el formulario')
        } else if (response.status === 400) {
          // Email duplicado u otro error de negocio
          if (data.detail?.error_code === 'EMAIL_EXISTS') {
            setError('Este email ya está registrado. ¿Quieres iniciar sesión?')
            setStep(1) // Volver al paso 1
          } else {
            setError(data.detail?.message || 'Error en los datos proporcionados')
          }
        } else if (response.status === 429) {
          // Rate limit
          setError('Demasiados intentos. Por favor espera un momento e intenta de nuevo.')
        } else {
          setError('Error al crear el gimnasio. Por favor intenta de nuevo.')
        }
        return
      }

      // Éxito - Redirigir a página de verificación
      window.location.href = `/verify-email?email=${encodeURIComponent(data.user.email)}&gym=${encodeURIComponent(data.gym.name)}`

    } catch (err) {
      console.error('Registration error:', err)
      setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = getPasswordStrength(ownerData.password)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crea tu Gimnasio</h1>
          <p className="text-gray-600">Completa el registro en 2 simples pasos</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Paso {step} de 2
            </span>
            <span className="text-sm text-gray-500">
              {step === 1 ? 'Acceso de la Cuenta' : 'Información del Gimnasio'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Error Global */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
                {error.includes('iniciar sesión') && (
                  <Link href="/login" className="text-sm text-red-600 hover:text-red-700 font-medium mt-2 inline-block">
                    Ir a iniciar sesión →
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* PASO 1: Datos del Propietario */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center pb-4 border-b border-gray-200">
                  <User className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Crea tu Cuenta</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Datos de acceso para administrar tu gimnasio
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={ownerData.email}
                      onChange={(e) => setOwnerData({ ...ownerData, email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="tu@email.com"
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Nombre y Apellido */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={ownerData.first_name}
                      onChange={(e) => setOwnerData({ ...ownerData, first_name: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Juan"
                    />
                    {fieldErrors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={ownerData.last_name}
                      onChange={(e) => setOwnerData({ ...ownerData, last_name: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Pérez"
                    />
                    {fieldErrors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.last_name}</p>
                    )}
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={ownerData.password}
                      onChange={(e) => setOwnerData({ ...ownerData, password: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {ownerData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Fortaleza:</span>
                        <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`bg-${passwordStrength.color}-500 h-1.5 rounded-full transition-all duration-300`}
                          style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {fieldErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Mínimo 8 caracteres, incluye mayúscula, minúscula y número
                  </p>
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={ownerData.confirmPassword}
                      onChange={(e) => setOwnerData({ ...ownerData, confirmPassword: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Teléfono (opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono (opcional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={ownerData.phone}
                      onChange={(e) => setOwnerData({ ...ownerData, phone: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="+525512345678"
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Formato internacional con código de país
                  </p>
                </div>

                {/* Botón Siguiente */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>Siguiente</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* PASO 2: Datos del Gimnasio */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center pb-4 border-b border-gray-200">
                  <Building2 className="h-12 w-12 text-indigo-600 mx-auto mb-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Datos del Gimnasio</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Información de tu negocio
                  </p>
                </div>

                {/* Nombre del Gimnasio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Gimnasio *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={gymData.gym_name}
                      onChange={(e) => setGymData({ ...gymData, gym_name: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.gym_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Fitness Pro México"
                    />
                  </div>
                  {fieldErrors.gym_name && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.gym_name}</p>
                  )}
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección (opcional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={gymData.gym_address}
                      onChange={(e) => setGymData({ ...gymData, gym_address: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Av. Reforma 123, Col. Centro, CDMX"
                    />
                  </div>
                </div>

                {/* Email y Teléfono del Gimnasio */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email del Gimnasio (opcional)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={gymData.gym_email}
                        onChange={(e) => setGymData({ ...gymData, gym_email: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          fieldErrors.gym_email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="contacto@gym.com"
                      />
                    </div>
                    {fieldErrors.gym_email && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.gym_email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono (opcional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={gymData.gym_phone}
                        onChange={(e) => setGymData({ ...gymData, gym_phone: e.target.value })}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          fieldErrors.gym_phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="+525587654321"
                      />
                    </div>
                    {fieldErrors.gym_phone && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.gym_phone}</p>
                    )}
                  </div>
                </div>

                {/* Zona Horaria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona Horaria
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={gymData.timezone}
                      onChange={(e) => setGymData({ ...gymData, timezone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none bg-white"
                    >
                      {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Botones de navegación */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Atrás</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Creando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Crear Gimnasio</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Sin tarjeta de crédito</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Setup en 5 minutos</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>100% seguro</span>
          </div>
        </div>
      </div>
    </div>
  )
}
