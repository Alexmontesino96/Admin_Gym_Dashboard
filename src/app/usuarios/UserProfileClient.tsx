'use client'

import { useEffect, useState } from 'react'
import { getUsersAPI, eventsAPI, GymParticipant } from '@/lib/api'

interface UserProfileClientProps {
  userId: number
}

export default function UserProfileClient({ userId }: UserProfileClientProps) {
  const [profile, setProfile] = useState<GymParticipant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    return <div className="py-8 text-center">Cargando perfil...</div>
  }

  if (error || !profile) {
    return <div className="text-center text-gray-500 py-8">Perfil no encontrado</div>
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

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-visible">
      {/* Header */}
      <div className="h-36 bg-gradient-to-r from-blue-600 to-teal-500 relative">
        {profile.picture ? (
          <img
            src={profile.picture}
            alt="avatar"
            className="w-24 h-24 rounded-full ring-4 ring-white absolute -bottom-12 left-6 object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full ring-4 ring-white absolute -bottom-12 left-6 bg-white flex items-center justify-center text-2xl font-semibold text-blue-600 uppercase">
            {fullName.slice(0,2)}
          </div>
        )}
      </div>

      <div className="pt-20 px-6 pb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">{fullName}</h2>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${profile.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{profile.is_active ? 'Activo' : 'Inactivo'}</span>
        </div>

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