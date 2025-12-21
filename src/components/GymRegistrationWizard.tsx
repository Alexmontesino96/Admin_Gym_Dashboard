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
  EyeOff
} from 'lucide-react'
import Link from 'next/link'

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
      errors.email = 'Necesitamos tu email para crear tu cuenta'
    } else if (!validateEmail(ownerData.email)) {
      errors.email = 'Hmm, este email no parece correcto'
    }

    if (!ownerData.password) {
      errors.password = 'Crea una contraseña para proteger tu cuenta'
    } else if (ownerData.password.length < 8) {
      errors.password = 'Agrega al menos 8 caracteres'
    } else if (!/[A-Z]/.test(ownerData.password)) {
      errors.password = 'Incluye una letra mayúscula'
    } else if (!/[a-z]/.test(ownerData.password)) {
      errors.password = 'Incluye una letra minúscula'
    } else if (!/\d/.test(ownerData.password)) {
      errors.password = 'Incluye al menos un número'
    }

    if (!ownerData.first_name || ownerData.first_name.length < 2) {
      errors.first_name = 'Tu nombre es muy corto'
    }

    if (!ownerData.last_name || ownerData.last_name.length < 2) {
      errors.last_name = 'Tu apellido es muy corto'
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
        timezone: gymData.timezone,
        gym_type: gymData.gym_type
      }

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register-gym-owner`
      console.log('🚀 Registering gym:', {
        url,
        payload: { ...payload, password: '***' },
        passwordLength: payload.password?.length,
        passwordExists: !!payload.password,
        allFields: Object.keys(payload).map(key => `${key}: ${key === 'password' ? '***' : payload[key as keyof typeof payload]}`),
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL
      })

      const bodyToSend = JSON.stringify(payload)
      console.log('📤 Request body (string):', bodyToSend.substring(0, 200) + '...')

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: bodyToSend
      })

      console.log('📥 Response received:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
      })

      // Verificar content-type antes de parsear
      const contentType = response.headers.get('content-type')
      let data = null

      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        // Si no es JSON, crear un objeto de error genérico
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
          // Errores de validación de Pydantic
          const validationErrors: Record<string, string> = {}
          data.detail.forEach((err: { loc: string[]; msg: string }) => {
            const field = err.loc[err.loc.length - 1]
            validationErrors[field] = err.msg
          })
          setFieldErrors(validationErrors)
          setError('Hmm, hay algunos campos que necesitan corrección')
        } else if (response.status === 400) {
          // Email duplicado u otro error de negocio
          if (data.detail?.error_code === 'EMAIL_EXISTS') {
            setError('Este email ya tiene cuenta. ¿Quieres iniciar sesión?')
            setStep(1) // Volver al paso 1
          } else {
            setError(data.detail?.message || 'Algo salió mal. Verifica tus datos e intenta de nuevo.')
          }
        } else if (response.status === 429) {
          // Rate limit
          setError('Muchos intentos en poco tiempo. Espera un momento e intenta de nuevo.')
        } else {
          setError('No pudimos conectar con el servidor. Verifica tu conexión e intenta de nuevo.')
        }
        return
      }

      console.log('✅ Registration successful:', data)

      // Éxito - Redirigir a página de verificación
      window.location.href = `/verify-email?email=${encodeURIComponent(data.user.email)}&gym=${encodeURIComponent(data.gym.name)}&type=${encodeURIComponent(gymData.gym_type)}`

    } catch (err) {
      console.error('Registration error:', err)
      setError('No pudimos conectar. Verifica tu internet e intenta de nuevo.')
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Deja de perseguir pagos. Empieza a crecer.</h1>
          <p className="text-gray-600">Cobra sin perseguir, agenda sin conflictos, crece sin límite.</p>

          {/* Social Proof Badge - Dinámico según tipo seleccionado */}
          <div className="mt-4 inline-block">
            {step === 1 && gymData.gym_type && gymData.gym_name ? (
              // Si ya seleccionó tipo, mostrar social proof específico
              <p className="text-sm text-gray-500">
                {gymData.gym_type === 'gym' ? (
                  <>
                    <span className="font-bold text-blue-600">523 gimnasios</span> en México ya automatizaron su negocio
                  </>
                ) : (
                  <>
                    <span className="font-bold text-green-600">847 entrenadores</span> en LATAM ya cobran en automático
                  </>
                )}
              </p>
            ) : (
              // Antes de seleccionar, mostrar genérico
              <p className="text-sm text-gray-500">
                El promedio de nuestros usuarios ahorra <span className="font-bold text-blue-600">12 horas a la semana</span> en admin
              </p>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Paso {step} de 2
            </span>
            <span className="text-sm text-gray-500">
              {step === 1 ? 'Tu negocio' : 'Tus datos de acceso'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
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

          <form onSubmit={handleSubmit}>
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

                {/* Botón Continuar */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>Crear mi cuenta</span>
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
                    {gymData.gym_type === 'gym'
                      ? 'Último paso: activa tu gimnasio'
                      : 'Último paso: lanza tu marca'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {gymData.gym_type === 'gym'
                      ? 'En 30 segundos tendrás acceso a tu panel de control'
                      : 'Tu app profesional estará lista en segundos'}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de trabajo
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
                      <span>Perfecto, este email está libre</span>
                    </p>
                  )}
                </div>

                {/* Nombre y Apellido */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tu nombre
                    </label>
                    <input
                      type="text"
                      value={ownerData.first_name}
                      onChange={(e) => setOwnerData({ ...ownerData, first_name: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder=""
                    />
                    {fieldErrors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tu apellido
                    </label>
                    <input
                      type="text"
                      value={ownerData.last_name}
                      onChange={(e) => setOwnerData({ ...ownerData, last_name: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        fieldErrors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder=""
                    />
                    {fieldErrors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{fieldErrors.last_name}</p>
                    )}
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crea una contraseña
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
                    8+ caracteres con mayúscula y número
                  </p>
                </div>

                {/* Zona Horaria - Auto-detectada (colapsado por defecto) */}
                <details className="cursor-pointer">
                  <summary className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <span>Zona horaria: {TIMEZONES.find(tz => tz.value === gymData.timezone)?.label?.split('(')[0].trim() || 'Ciudad de México'}</span>
                  </summary>
                  <div className="relative mt-3">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
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
                </details>

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
                        <span>{gymData.gym_type === 'gym' ? 'Activar mi gimnasio ahora' : 'Activar mi negocio ahora'}</span>
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
      </div>
    </div>
  )
}
