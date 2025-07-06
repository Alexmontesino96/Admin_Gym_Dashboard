'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { gymsAPI, UserGymMembership, setSelectedGymId } from '@/lib/api'
import { Building, Users, Calendar, ChevronRight, Loader2 } from 'lucide-react'

interface GymSelectorClientProps {
  user: {
    name?: string
    email?: string
    picture?: string
  }
}

export default function GymSelectorClient({ user }: GymSelectorClientProps) {
  const [gyms, setGyms] = useState<UserGymMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGym, setSelectedGym] = useState<number | null>(null)
  const [selecting, setSelecting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchUserGyms()
  }, [])

  const fetchUserGyms = async () => {
    try {
      setLoading(true)
      const userGyms = await gymsAPI.getMyGyms()
      
      // Filtrar solo los gimnasios donde es ADMIN u OWNER
      const adminGyms = userGyms.filter(gym => 
        gym.user_role_in_gym === 'ADMIN' || gym.user_role_in_gym === 'OWNER'
      )
      
      console.log('Gimnasios donde es admin/owner:', adminGyms)
      setGyms(adminGyms)
      
      // Si solo tiene un gimnasio, seleccionarlo automáticamente
      if (adminGyms.length === 1) {
        handleGymSelect(adminGyms[0].id)
      }
    } catch (err) {
      console.error('Error fetching user gyms:', err)
      setError('Error al cargar los gimnasios. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleGymSelect = async (gymId: number) => {
    try {
      setSelecting(true)
      setSelectedGym(gymId)
      
      console.log('Seleccionando gimnasio:', gymId)
      
      // Usar la función de la API que establece localStorage y cookie
      setSelectedGymId(gymId.toString())
      
      console.log('Gimnasio guardado, redirigiendo...')
      
      // Pequeña pausa para asegurar que se guarde
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Forzar recarga de la página para que el middleware tome efecto
      window.location.href = '/'
      
    } catch (error) {
      console.error('Error al seleccionar gimnasio:', error)
      setError('Error al seleccionar el gimnasio. Por favor, intenta de nuevo.')
      setSelecting(false)
      setSelectedGym(null)
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'Propietario'
      case 'ADMIN':
        return 'Administrador'
      default:
        return role
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tus gimnasios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 mb-4">{error}</p>
        <button
          onClick={fetchUserGyms}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (gyms.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <Building className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          No tienes gimnasios asignados
        </h3>
        <p className="text-yellow-700 mb-4">
          No eres administrador o propietario de ningún gimnasio en este momento.
        </p>
        <p className="text-sm text-yellow-600">
          Contacta al administrador del sistema para obtener acceso.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selecting && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-blue-800">Configurando gimnasio seleccionado...</p>
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gyms.map((gym) => (
          <div
            key={gym.id}
            className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group ${
              selectedGym === gym.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            } ${selecting ? 'pointer-events-none opacity-75' : ''}`}
            onClick={() => !selecting && handleGymSelect(gym.id)}
          >
            {/* Header con logo o placeholder */}
            <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-600 relative overflow-hidden">
              {gym.logo_url ? (
                <img
                  src={gym.logo_url}
                  alt={`Logo de ${gym.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Building className="h-12 w-12 text-white opacity-80" />
                </div>
              )}
              
              {/* Badge de rol */}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(gym.user_role_in_gym)}`}>
                  {getRoleDisplayName(gym.user_role_in_gym)}
                </span>
              </div>

              {/* Indicador de selección */}
              {selectedGym === gym.id && (
                <div className="absolute top-3 left-3">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                </div>
              )}
            </div>

            {/* Contenido */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {gym.name}
                </h3>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>

              {gym.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {gym.description}
                </p>
              )}

              {gym.address && (
                <p className="text-sm text-gray-500 mb-2 flex items-start">
                  <span className="mr-1">📍</span>
                  {gym.address}
                </p>
              )}

              {gym.phone && (
                <p className="text-sm text-gray-500 mb-2">
                  📞 {gym.phone}
                </p>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  ID: {gym.id}
                </span>
                <div className={`w-2 h-2 rounded-full ${gym.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {gyms.length > 1 && !selecting && (
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">
            Haz clic en cualquier gimnasio para comenzar a administrarlo
          </p>
        </div>
      )}
    </div>
  )
} 