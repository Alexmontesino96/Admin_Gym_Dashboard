'use client'

import { useState, useEffect } from 'react'
import { getUsersAPI, GymParticipant, membershipsAPI, MembershipStatus } from '@/lib/api'
import { eventsAPI } from '@/lib/api'
import { CreditCardIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

interface UserProfileClientProps {
  userId: number
}

export default function UserProfileClient({ userId }: UserProfileClientProps) {
  const [profile, setProfile] = useState<GymParticipant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus | null>(null)
  const [loadingMembership, setLoadingMembership] = useState(false)
  const [membershipError, setMembershipError] = useState<string | null>(null)

  // Sesiones del entrenador
  const [sessions, setSessions] = useState<any[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [sessionsError, setSessionsError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Intentar endpoint privado (requiere permisos de admin/propio)
        const data = await getUsersAPI.getGymParticipantById(userId)
        setProfile(data)
      } catch (err: any) {
        console.warn('Fallo getGymParticipantById, intentando perfil público', err?.message||err)
        try {
          const pub = await getUsersAPI.getPublicProfile(userId)
          // Adaptar estructura mínima
          setProfile({
            ...pub,
            gym_role: pub.role,
            is_active: pub.is_active ?? true,
          } as any)
        } catch (err2) {
          console.error('Error fetching public profile', err2)
          setError('No se pudo cargar el perfil')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [userId])

  // Cargar información de membresía
  useEffect(() => {
    const fetchMembershipStatus = async () => {
      try {
        setLoadingMembership(true)
        setMembershipError(null)
        const membershipData = await membershipsAPI.getUserMembershipStatus(userId)
        setMembershipStatus(membershipData)
      } catch (err: any) {
        console.warn('Error obteniendo estado de membresía:', err)
        setMembershipError(err?.message || 'Error obteniendo información de membresía')
      } finally {
        setLoadingMembership(false)
      }
    }
    fetchMembershipStatus()
  }, [userId])

  // Cargar sesiones si es entrenador
  useEffect(() => {
    const fetchTrainerSessions = async () => {
      if (!profile || profile.gym_role !== 'TRAINER') return
      try {
        setLoadingSessions(true)
        const data = await eventsAPI.getSessionsByTrainer(profile.id, { upcoming_only: false, limit: 100 })
        setSessions(data)
      } catch (err:any) {
        console.error('Error cargando sesiones del entrenador', err)
        setSessionsError(err?.message || 'Error obteniendo sesiones')
      } finally {
        setLoadingSessions(false)
      }
    }
    fetchTrainerSessions()
  }, [profile])

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil del usuario...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Perfil no encontrado</h3>
          <p className="text-gray-500 mb-4">No se pudo cargar la información del usuario.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email

  const createdDate = profile.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : null

  const birthDate = profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('es-ES') : null

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })
  }
  const formatTimeRange = (start: string, end?: string) => {
    const s = new Date(start)
    const e = end ? new Date(end) : null
    const fmt = (d: Date) => d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    return `${fmt(s)}${e ? ' - ' + fmt(e) : ''}`
  }

  const getMembershipStatusColor = (status?: MembershipStatus) => {
    if (!status) return 'bg-gray-100 text-gray-600'
    
    if (!status.is_active) return 'bg-red-100 text-red-600'
    if (status.days_remaining !== undefined && status.days_remaining !== null && status.days_remaining <= 7) {
      return 'bg-yellow-100 text-yellow-600'
    }
    return 'bg-green-100 text-green-600'
  }

  const getMembershipStatusText = (status?: MembershipStatus) => {
    if (!status) return 'Sin membresía'
    
    if (!status.is_active) return 'Membresía expirada'
    if (status.days_remaining !== undefined && status.days_remaining !== null && status.days_remaining <= 7) {
      return `Expira en ${status.days_remaining} días`
    }
    return 'Membresía activa'
  }

  return (
    <div className="overflow-visible">
      {/* Header */}
      <div className="h-36 bg-gradient-to-r from-blue-600 to-teal-500 relative rounded-t-2xl">
        {profile.picture ? (
          <Image
            src={profile.picture}
            alt="avatar"
            width={96}
            height={96}
            className="w-24 h-24 rounded-full ring-4 ring-white absolute -bottom-12 left-6 object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full ring-4 ring-white absolute -bottom-12 left-6 bg-white flex items-center justify-center text-2xl font-semibold text-blue-600 uppercase">
            {fullName.slice(0,2)}
          </div>
        )}
      </div>

      <div className="pt-20 px-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">{fullName}</h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${profile.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {profile.is_active ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Información de suscripción */}
        {membershipStatus && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCardIcon className="h-5 w-5 mr-2 text-blue-600" />
              Información de Suscripción
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-gray-500 mb-1">Plan de Membresía</p>
                <p className="text-lg font-semibold text-gray-900">{membershipStatus.plan_name || membershipStatus.membership_type}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-gray-500 mb-1">Estado</p>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMembershipStatusColor(membershipStatus)}`}>
                    {getMembershipStatusText(membershipStatus)}
                  </span>
                  {membershipStatus.can_access ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
              {membershipStatus.expires_at && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-gray-500 mb-1">Fecha de Expiración</p>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900 font-medium">
                      {new Date(membershipStatus.expires_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
              {membershipStatus.days_remaining !== undefined && membershipStatus.days_remaining !== null && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-gray-500 mb-1">Días Restantes</p>
                  <p className={`text-lg font-semibold ${membershipStatus.days_remaining <= 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {membershipStatus.days_remaining} días
                  </p>
                </div>
              )}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-gray-500 mb-1">Gimnasio</p>
                <p className="text-gray-900 font-medium">{membershipStatus.gym_name}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-gray-500 mb-1">Acceso</p>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${membershipStatus.can_access ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {membershipStatus.can_access ? 'Puede acceder' : 'Sin acceso'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Información básica del perfil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div>
            <p className="font-medium text-gray-500 mb-1">Email</p>
            <p>{profile.email}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500 mb-1">Rol</p>
            <p className="capitalize">{(profile.role || '').replace('_', ' ').toLowerCase()}</p>
          </div>
          {profile.phone_number && (
            <div>
              <p className="font-medium text-gray-500 mb-1">Teléfono</p>
              <p>{profile.phone_number}</p>
            </div>
          )}
          {createdDate && (
            <div>
              <p className="font-medium text-gray-500 mb-1">Miembro desde</p>
              <p>{createdDate}</p>
            </div>
          )}
          {birthDate && (
            <div>
              <p className="font-medium text-gray-500 mb-1">Fecha nacimiento</p>
              <p>{birthDate}</p>
            </div>
          )}
          {profile.height && profile.height > 0 && (
            <div>
              <p className="font-medium text-gray-500 mb-1">Altura</p>
              <p>{profile.height} cm</p>
            </div>
          )}
          {profile.weight && profile.weight > 0 && (
            <div>
              <p className="font-medium text-gray-500 mb-1">Peso</p>
              <p>{profile.weight} kg</p>
            </div>
          )}
          {profile.goals && (
            <div className="md:col-span-2">
              <p className="font-medium text-gray-500 mb-1">Objetivos</p>
              <p className="text-gray-700 whitespace-pre-line">{profile.goals}</p>
            </div>
          )}
          {profile.health_conditions && (
            <div className="md:col-span-2">
              <p className="font-medium text-gray-500 mb-1">Condiciones de salud</p>
              <p className="text-gray-700 whitespace-pre-line">{profile.health_conditions}</p>
            </div>
          )}
          {profile.gym_role && (
            <div>
              <p className="font-medium text-gray-500 mb-1">Rol en Gimnasio</p>
              <p className="capitalize">{profile.gym_role.toLowerCase()}</p>
            </div>
          )}
          {profile.qr_code && (
            <div>
              <p className="font-medium text-gray-500 mb-1">QR Code</p>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{profile.qr_code}</span>
                <button
                  onClick={() => profile.qr_code && navigator.clipboard.writeText(profile.qr_code)}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  Copiar
                </button>
              </div>
            </div>
          )}
          {profile.is_superuser && (
            <div className="md:col-span-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium">Superuser</span>
            </div>
          )}
        </div>

        {/* Sesiones programadas (solo entrenadores) */}
        {profile.gym_role === 'TRAINER' && (
          <div className="md:col-span-2 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas sesiones asignadas</h3>
            {loadingSessions ? (
              <p className="text-sm text-gray-500">Cargando sesiones...</p>
            ) : sessionsError ? (
              <p className="text-sm text-red-500 whitespace-pre-wrap">{sessionsError}</p>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-gray-500">No hay sesiones próximas</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {sessions.map((ses) => {
                  const start = ses.start_time || ses.session?.start_time
                  const end = ses.end_time || ses.session?.end_time
                  const clsName = ses.class_name || ses.class?.name || ses.class_definition?.name || `Clase ID ${ses.class_id}`
                  return (
                    <li key={ses.id || ses.session?.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">{clsName}</p>
                        <p className="text-xs text-gray-500">{formatDate(start)} · {formatTimeRange(start, end)}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 capitalize">{(ses.status || ses.session?.status) || 'programada'}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 