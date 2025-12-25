'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Loader2,
  Users,
  Dumbbell,
  Eye,
  EyeOff,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { useStripeConnect } from '@/hooks/useStripeConnect'

// Tipos
interface OwnerData {
  email: string
  password: string
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
  gym_type: 'gym' | 'personal_trainer'
}

interface PasswordStrength {
  score: number
  label: string
  color: string
}

interface GymRegistrationWizardProps {
  preSelectedType?: 'gym' | 'personal_trainer'
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

export default function GymRegistrationWizard({ preSelectedType }: GymRegistrationWizardProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Estado para validación de email
  const [emailCheckLoading, setEmailCheckLoading] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)

  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false)

  // Estado para el gym ID creado (para Stripe Connect)
  const [createdGymId, setCreatedGymId] = useState<string | null>(null)

  // Estados de los formularios
  const [ownerData, setOwnerData] = useState<OwnerData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: ''
  })

  const [gymData, setGymData] = useState<GymData>({
    gym_name: '',
    gym_address: '',
    gym_phone: '',
    gym_email: '',
    timezone: typeof window !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'America/Mexico_City',
    gym_type: preSelectedType || 'gym'
  })

  // Validación de email
  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  // Verificar disponibilidad de email
  const checkEmailAvailability = useCallback(async (email: string) => {
    if (!email || !validateEmail(email)) {
      setEmailAvailable(null)
      return
    }

    setEmailCheckLoading(true)
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/check-email-availability`
      console.log('🔍 Checking email availability:', {
        url,
        email,
        apiKey: process.env.NEXT_PUBLIC_API_KEY ? '✅ Present' : '❌ Missing'
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || ''
        },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        console.error('Email check failed with status:', response.status)
        setEmailAvailable(null)
        return
      }

      // Verificar content-type antes de parsear
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()

        // El backend retorna { status: "success" } o { status: "error" }
        if (data.status === 'success') {
          setEmailAvailable(true)
          setFieldErrors(prev => {
            const { email, ...rest } = prev
            return rest
          })
        } else if (data.status === 'error') {
          setEmailAvailable(false)
          setFieldErrors(prev => ({
            ...prev,
            email: data.message || 'Este email ya tiene cuenta - Iniciar sesión'
          }))
        }
      } else {
        console.error('Response is not JSON')
        setEmailAvailable(null)
      }
    } catch (err) {
      console.error('Error checking email:', err)
      setEmailAvailable(null)
    } finally {
      setEmailCheckLoading(false)
    }
  }, [])

  // Manejar blur del campo email (cuando el usuario sale del campo)
  const handleEmailBlur = () => {
    if (ownerData.email && validateEmail(ownerData.email)) {
      checkEmailAvailability(ownerData.email)
    }
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

  // Validar paso 1 (Tipo de negocio + Nombre del negocio)
  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {}

    if (!gymData.gym_name || gymData.gym_name.length < 3) {
      errors.gym_name = gymData.gym_type === 'gym'
        ? '¿Cómo se llama tu gimnasio? (mínimo 3 caracteres)'
        : '¿Cómo te conocen? (mínimo 3 caracteres)'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validar paso 2 (Datos personales)
  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {}

    if (!ownerData.email) {
      errors.email = 'Email is required to create your account'
    } else if (!validateEmail(ownerData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!ownerData.password) {
      errors.password = 'Create a password to secure your account'
    } else if (ownerData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    } else if (!/[A-Z]/.test(ownerData.password)) {
      errors.password = 'Include at least one uppercase letter'
    } else if (!/[a-z]/.test(ownerData.password)) {
      errors.password = 'Include at least one lowercase letter'
    } else if (!/\d/.test(ownerData.password)) {
      errors.password = 'Include at least one number'
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

  // Handle step 2 completion - create gym account and go to step 3
  const handleStep2Complete = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep2()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Auto-generate first_name and last_name from email if not provided
      const emailUsername = ownerData.email.split('@')[0]
      const autoFirstName = ownerData.first_name || emailUsername
      const autoLastName = ownerData.last_name || 'Owner'

      const payload = {
        // Datos del owner
        email: ownerData.email,
        password: ownerData.password,
        first_name: autoFirstName,
        last_name: autoLastName,
        phone: ownerData.phone || undefined,
        // Datos del gimnasio
        gym_name: gymData.gym_name,
        gym_address: gymData.gym_address || undefined,
        gym_phone: gymData.gym_phone || undefined,
        gym_email: gymData.gym_email || undefined,
        timezone: gymData.timezone,
        gym_type: gymData.gym_type
      }

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register-gym-owner`
      console.log('🚀 Registering gym:', {
        url,
        payload: { ...payload, password: '***' }
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const contentType = response.headers.get('content-type')
      let data = null

      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = {
          detail: {
            message: 'Error en el servidor. Por favor intenta de nuevo.'
          }
        }
      }

      if (!response.ok) {
        console.error('❌ Registration failed:', {
          status: response.status,
          data
        })

        // Manejar errores específicos
        if (response.status === 422) {
          const validationErrors: Record<string, string> = {}
          data.detail.forEach((err: { loc: string[]; msg: string }) => {
            const field = err.loc[err.loc.length - 1]
            validationErrors[field] = err.msg
          })
          setFieldErrors(validationErrors)
          setError('Hmm, hay algunos campos que necesitan corrección')
        } else if (response.status === 400) {
          if (data.detail?.error_code === 'EMAIL_EXISTS') {
            setError('Este email ya tiene cuenta. ¿Quieres iniciar sesión?')
            setStep(1)
          } else {
            setError(data.detail?.message || 'Algo salió mal. Verifica tus datos e intenta de nuevo.')
          }
        } else if (response.status === 429) {
          setError('Muchos intentos en poco tiempo. Espera un momento e intenta de nuevo.')
        } else {
          setError('No pudimos conectar con el servidor. Verifica tu conexión e intenta de nuevo.')
        }
        return
      }

      console.log('✅ Registration successful:', data)

      // Guardar gym ID y pasar al Step 3
      setCreatedGymId(data.gym.id.toString())
      setStep(3)
      setError(null)
      setFieldErrors({})

    } catch (err) {
      console.error('Registration error:', err)
      setError('No pudimos conectar. Verifica tu internet e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Stripe onboarding completion
  const handleStripeComplete = () => {
    // Redirect to verify-email page
    window.location.href = `/verify-email?email=${encodeURIComponent(ownerData.email)}&gym=${encodeURIComponent(gymData.gym_name)}&type=${encodeURIComponent(gymData.gym_type)}`
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">The gym management platform Miami gyms choose</h1>
          <p className="text-gray-600">Automated payments, scheduling, and growth tools. Starting at $77/month.</p>

          {/* Founding Gyms Program Badge */}
          <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 px-4 py-2 rounded-full">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            <span className="text-sm font-bold text-orange-900">Founding Gyms Program: 50% off first 3 months</span>
            <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-orange-600">6 spots left</span>
          </div>

          {/* Social Proof Badge - Miami market */}
          <div className="mt-3 inline-block">
            <p className="text-sm text-gray-500">
              Join <span className="font-bold text-blue-600">50+ Miami fitness businesses</span> already automating with GymFlow
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {step} of 3
            </span>
            <span className="text-sm text-gray-500">
              {step === 1 ? 'Business info' : step === 2 ? 'Account setup' : 'Payment setup'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Trust Badges - Movido arriba */}
        <div className="mb-6 flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Prueba gratis, sin sorpresas</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Solo 2 pasos más</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Importa tus clientes con un clic</span>
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

          <form onSubmit={handleStep2Complete}>
            {/* PASO 1: Tipo de Negocio + Nombre */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center pb-4 border-b border-gray-200">
                  {gymData.gym_type === 'gym' ? (
                    <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  ) : gymData.gym_type === 'personal_trainer' ? (
                    <Dumbbell className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  ) : (
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  )}
                  <h2 className="text-xl font-semibold text-gray-900">
                    {preSelectedType
                      ? (gymData.gym_type === 'gym' ? 'Cuéntanos sobre tu gimnasio' : 'Cuéntanos sobre ti')
                      : 'Cuéntanos sobre tu negocio'
                    }
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {preSelectedType
                      ? 'Empecemos con la información básica'
                      : 'Esto nos ayuda a personalizar tu experiencia'
                    }
                  </p>
                </div>

                {/* Selector de Tipo de Negocio - Solo si NO viene pre-seleccionado */}
                {!preSelectedType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    ¿Cómo trabajas?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Opción: Gimnasio */}
                    <button
                      type="button"
                      onClick={() => setGymData({ ...gymData, gym_type: 'gym' })}
                      className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                        gymData.gym_type === 'gym'
                          ? 'border-blue-600 bg-blue-50 shadow-lg'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <Building2 className={`h-10 w-10 mx-auto mb-3 ${
                          gymData.gym_type === 'gym' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <h3 className={`font-semibold mb-2 ${
                          gymData.gym_type === 'gym' ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          Tengo un local
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Administro un gimnasio, box de CrossFit, estudio de yoga/pilates, o centro deportivo
                        </p>
                      </div>
                      {gymData.gym_type === 'gym' && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                    </button>

                    {/* Opción: Entrenador Personal */}
                    <button
                      type="button"
                      onClick={() => setGymData({ ...gymData, gym_type: 'personal_trainer' })}
                      className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                        gymData.gym_type === 'personal_trainer'
                          ? 'border-green-600 bg-green-50 shadow-lg'
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <Dumbbell className={`h-10 w-10 mx-auto mb-3 ${
                          gymData.gym_type === 'personal_trainer' ? 'text-green-600' : 'text-gray-400'
                        }`} />
                        <h3 className={`font-semibold mb-2 ${
                          gymData.gym_type === 'personal_trainer' ? 'text-green-900' : 'text-gray-900'
                        }`}>
                          Soy independiente
                        </h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Entreno clientes en su casa, en un parque, o rento espacio por hora. Soy mi propio jefe
                        </p>
                      </div>
                      {gymData.gym_type === 'personal_trainer' && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Puedes cambiar esto después en configuración
                  </p>
                </div>
                )}

                {/* Badge de tipo pre-seleccionado */}
                {preSelectedType && (
                  <div className="flex items-center justify-center mb-4">
                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                      gymData.gym_type === 'gym' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {gymData.gym_type === 'gym' ? (
                        <>
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Gimnasio con local</span>
                        </>
                      ) : (
                        <>
                          <Dumbbell className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">Entrenador independiente</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Nombre del Negocio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {gymData.gym_type === 'gym' ? '¿Cómo se llama tu negocio?' : '¿Cómo te conocen tus clientes?'}
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
                      placeholder={gymData.gym_type === 'gym' ? 'Ej: CrossFit Condesa' : 'Ej: Coach María PT'}
                    />
                  </div>
                  {fieldErrors.gym_name && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.gym_name}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {gymData.gym_type === 'gym'
                      ? 'El nombre de tu gimnasio o centro de entrenamiento'
                      : 'El nombre con el que te conocerán tus clientes'
                    }
                  </p>
                </div>

                {/* Pricing Preview Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide font-semibold">Your pricing</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-gray-900">$77</span>
                        <span className="text-gray-600 text-lg">/month</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Up to 150 members</p>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-bold mb-2">
                        61% cheaper than Mindbody
                      </div>
                      <p className="text-xs text-gray-500">Save ~$1,400/year</p>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="font-medium">Stripe Standard Account</span>
                      <span className="text-gray-500">- payments go directly to your bank</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>No transaction fees from us, only Stripe's 2.9%</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Cancel anytime, no contracts</span>
                    </div>
                  </div>

                  <div className="mt-4 bg-white/60 rounded-lg px-3 py-2 text-xs text-gray-600">
                    <strong className="text-gray-900">Founding Gyms:</strong> Pay $38.50/month for 3 months, then $77/month
                  </div>
                </div>

                {/* Botón Continuar */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>Continue to account setup</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                <p className="text-center text-xs text-gray-500 mt-2">
                  Siguiente: tus datos de acceso
                </p>
              </div>
            )}

            {/* PASO 2: Tu Cuenta Personal */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Header dinámico con nombre del negocio */}
                <div className="text-center pb-4 border-b border-gray-200">
                  {gymData.gym_type === 'gym' ? (
                    <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  ) : (
                    <Dumbbell className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  )}

                  {/* Mostrar el nombre del negocio si ya lo ingresó */}
                  {gymData.gym_name && (
                    <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full mb-3">
                      <span className="text-sm font-medium text-gray-700">{gymData.gym_name}</span>
                      {gymData.gym_type === 'gym' ? (
                        <span className="text-xs text-blue-600 font-semibold">Gimnasio</span>
                      ) : (
                        <span className="text-xs text-green-600 font-semibold">Entrenador</span>
                      )}
                    </div>
                  )}

                  <h2 className="text-xl font-semibold text-gray-900">
                    Create your account
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    You'll have access to your dashboard in 30 seconds
                  </p>
                </div>

                {/* OAuth Options */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      // TODO: Implement Google OAuth
                      console.log('Google OAuth not implemented yet')
                    }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // TODO: Implement Apple OAuth
                      console.log('Apple OAuth not implemented yet')
                    }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-900 bg-gray-900 rounded-xl font-semibold text-white hover:bg-gray-800 transition-all duration-200"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <span>Continue with Apple</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or continue with email</span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={ownerData.email}
                      onChange={(e) => {
                        setOwnerData({ ...ownerData, email: e.target.value })
                        setEmailAvailable(null)
                      }}
                      onBlur={handleEmailBlur}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.email
                          ? 'border-red-300 bg-red-50'
                          : emailAvailable === true
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300'
                      }`}
                      placeholder="tu@email.com"
                    />
                    {/* Indicadores de estado */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailCheckLoading && (
                        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
                      )}
                      {!emailCheckLoading && emailAvailable === true && validateEmail(ownerData.email) && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {!emailCheckLoading && emailAvailable === false && (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                  )}
                  {!fieldErrors.email && emailAvailable === true && (
                    <p className="mt-1 text-sm text-green-600 flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>Great! This email is available</span>
                    </p>
                  )}
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Create a password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={ownerData.password}
                      onChange={(e) => setOwnerData({ ...ownerData, password: e.target.value })}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {ownerData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Strength:</span>
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
                    8+ characters with uppercase and number
                  </p>
                </div>

                {/* Botones de navegación */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <span>Continue to payment setup</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: Stripe Connect Onboarding */}
            {step === 3 && createdGymId && (
              <StripeConnectStep
                gymId={createdGymId}
                userEmail={ownerData.email}
                gymName={gymData.gym_name}
                onComplete={handleStripeComplete}
                onBack={() => setStep(2)}
              />
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
      </div>
    </div>
  )
}

// Componente para Step 3: Stripe Connect
interface StripeConnectStepProps {
  gymId: string
  userEmail: string
  gymName: string
  onComplete: () => void
  onBack: () => void
}

function StripeConnectStep({ gymId, userEmail, gymName, onComplete, onBack }: StripeConnectStepProps) {
  const {
    status,
    isLoading,
    error,
    createAccount,
    getOnboardingLink,
    startPolling,
    stopPolling
  } = useStripeConnect(gymId)

  const [accountCreated, setAccountCreated] = useState(false)
  const [onboardingStarted, setOnboardingStarted] = useState(false)

  // Detectar si cuenta ya existe (reconectar) o crear nueva
  useEffect(() => {
    if (status?.is_connected && !accountCreated) {
      // Cuenta ya existe - modo reconexión
      console.log('Stripe account already exists, enabling reconnect mode')
      setAccountCreated(true)
    } else if (!status?.is_connected && !accountCreated && !isLoading) {
      // Crear nueva cuenta
      handleCreateAccount()
    }
  }, [status, accountCreated, isLoading])

  // Iniciar polling si hay cuenta pero onboarding no completado
  useEffect(() => {
    if (onboardingStarted && status?.is_connected && !status.onboarding_completed) {
      startPolling()
    }
    return () => stopPolling()
  }, [onboardingStarted, status, startPolling, stopPolling])

  const handleCreateAccount = async () => {
    try {
      await createAccount({
        country: 'US',
        email: userEmail,
        business_type: 'company'
      })
      setAccountCreated(true)
    } catch (err) {
      console.error('Error creando cuenta Stripe:', err)
    }
  }

  const handleStartOnboarding = async () => {
    try {
      const link = await getOnboardingLink()
      setOnboardingStarted(true)
      // Abrir en nueva ventana
      window.open(link.url, '_blank', 'width=800,height=900')
      // Iniciar polling para detectar cuando complete
      startPolling()
    } catch (err) {
      console.error('Error obteniendo onboarding link:', err)
    }
  }

  // Si onboarding completado, mostrar éxito
  if (status?.onboarding_completed) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-gray-900">Stripe Configured Successfully!</h3>
          <p className="text-gray-600 mb-2">
            Your payment account is ready to receive payments directly to your bank.
          </p>
          <p className="text-sm text-gray-500">
            {gymName} is all set up!
          </p>
        </div>

        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
          <h4 className="font-semibold text-gray-900 mb-3">What's next?</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Payments from members go directly to your bank account</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>You can view all transactions in your Stripe dashboard</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Funds are transferred in 1-2 business days</span>
            </div>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Complete Setup & Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4 border-b border-gray-200">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 mx-auto">
          <CreditCard className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Setup your payment account
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Connect Stripe to start receiving payments directly to your bank
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-semibold">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !accountCreated && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Setting up your Stripe account...</span>
        </div>
      )}

      {/* Account Created - Ready for Onboarding */}
      {accountCreated && !status?.onboarding_completed && !isLoading && (
        <>
          {/* Reconnect Info Banner (si la cuenta ya existía) */}
          {status?.is_connected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-800 font-semibold text-sm">Continue your Stripe setup</p>
                  <p className="text-yellow-700 text-xs mt-1">
                    You started connecting your Stripe account but didn't finish. Click below to continue where you left off.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Why Stripe Section */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Why we use Stripe
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Direct deposits:</strong> Payments go straight to your bank account (not ours)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Only 2.9% fee:</strong> Standard Stripe rate, no markup from us</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Full transparency:</strong> You control everything in your Stripe dashboard</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span><strong>Next-day transfers:</strong> Money hits your account in 1-2 business days</span>
              </div>
            </div>
          </div>

          {/* What You'll Need */}
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">What you'll need (takes 3 minutes)</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Business EIN or SSN</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Bank account info</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Business address</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Phone number</span>
              </div>
            </div>
          </div>

          {/* Polling Status */}
          {onboardingStarted && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 text-yellow-600 animate-spin mr-3" />
                <div>
                  <p className="text-yellow-800 font-semibold text-sm">Waiting for Stripe verification...</p>
                  <p className="text-yellow-600 text-xs mt-1">
                    We'll automatically detect when you complete the process in the popup window
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleStartOnboarding}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="h-5 w-5" />
              <span>
                {onboardingStarted
                  ? 'Reopen Stripe Verification'
                  : status?.is_connected
                  ? 'Continue Stripe Setup'
                  : 'Connect Stripe Account'}
              </span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to account setup</span>
            </button>
          </div>

          {/* Trust Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              🔒 Secure connection • Stripe handles all sensitive data • We never see your bank info
            </p>
          </div>
        </>
      )}
    </div>
  )
}
