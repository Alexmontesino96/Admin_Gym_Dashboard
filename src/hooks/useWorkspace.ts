'use client'

import { useEffect, useState, useCallback } from 'react'
import { dashboardAPI, WorkspaceContext, WorkspaceType, getSelectedGymId } from '@/lib/api'

// Contexto por defecto cuando el endpoint no existe
const DEFAULT_WORKSPACE: WorkspaceContext = {
  workspace: {
    id: 0,
    name: 'Gimnasio',
    type: 'gym',
    is_personal_trainer: false,
    display_name: 'Gimnasio',
    entity_label: 'Gimnasio',
    timezone: 'America/Mexico_City',
    email: null,
    phone: null,
    address: null,
    max_clients: null,
    specialties: null
  },
  terminology: {
    gym: 'gimnasio',
    gym_plural: 'gimnasios',
    member: 'miembro',
    members: 'miembros',
    trainer: 'entrenador',
    trainers: 'entrenadores',
    class: 'clase',
    classes: 'clases',
    schedule: 'horario',
    membership: 'membresía',
    memberships: 'membresías',
    equipment: 'equipamiento',
    event: 'evento',
    events: 'eventos',
    owner: 'propietario',
    admin: 'administrador',
    dashboard: 'dashboard'
  },
  features: {
    chat: true,
    notifications: true,
    profile: true,
    health_tracking: true,
    nutrition: true,
    surveys: true,
    payments: true,
    show_multiple_trainers: true,
    show_equipment_management: true,
    show_class_schedule: true,
    show_gym_hours: true,
    show_appointments: false,
    show_client_progress: false,
    show_session_packages: false,
    simplified_billing: false,
    show_staff_management: false,
    max_clients_limit: false,
    personal_branding: false,
    quick_client_add: false,
    session_tracking: false,
    client_notes: false,
    event_management: true,
    capacity_management: true,
    equipment_booking: true
  },
  navigation: [],
  quick_actions: [],
  branding: {
    logo_url: null,
    primary_color: '#007bff',
    secondary_color: '#6c757d',
    accent_color: '#28a745',
    app_title: 'Gym Admin',
    app_subtitle: 'Sistema de Gestión',
    theme: 'gym',
    show_logo: true,
    compact_mode: false
  },
  user_context: {
    id: 0,
    email: '',
    name: '',
    photo_url: null,
    role: 'MEMBER',
    role_label: 'miembro',
    permissions: []
  },
  api_version: '1.0.0',
  environment: 'production'
}

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<WorkspaceContext>(DEFAULT_WORKSPACE)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkspace = useCallback(async () => {
      try {
        setLoading(true)

        // Intentar obtener del cache primero
        const cached = sessionStorage.getItem('workspace_context')
        if (cached) {
          const cachedData = JSON.parse(cached)
          setWorkspace(cachedData)
          setLoading(false)
          return
        }

        // Si no hay cache, intentar obtener del servidor
        try {
          const context = await dashboardAPI.getWorkspaceContext()
          setWorkspace(context)

          // Cachear por esta sesión
          sessionStorage.setItem('workspace_context', JSON.stringify(context))
        } catch (apiError: any) {
          // Si el endpoint no existe (404), usar valores por defecto
          if (apiError?.status === 404 || apiError?.message?.includes('404')) {
            console.warn('Endpoint /context/workspace no implementado, usando valores por defecto')
            setWorkspace(DEFAULT_WORKSPACE)
            // Cachear los valores por defecto también
            sessionStorage.setItem('workspace_context', JSON.stringify(DEFAULT_WORKSPACE))
          } else {
            throw apiError
          }
        }
      } catch (err) {
        console.error('Error fetching workspace:', err)
        setError('Error al cargar información del workspace')
        // Usar workspace por defecto en caso de error
        setWorkspace(DEFAULT_WORKSPACE)
      } finally {
        setLoading(false)
      }
    }, [])

  useEffect(() => {
    fetchWorkspace()

    // Escuchar eventos de cambio de gym
    const handleGymChange = () => {
      console.log('Gym changed, re-fetching workspace context...')
      sessionStorage.removeItem('workspace_context')
      fetchWorkspace()
    }

    // Escuchar eventos personalizados
    window.addEventListener('gymChanged', handleGymChange)

    // Escuchar cambios en storage (para sincronizar entre tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedGymId' && e.newValue !== e.oldValue) {
        handleGymChange()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('gymChanged', handleGymChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [fetchWorkspace])

  return {
    workspace,
    loading,
    error,
    isTrainer: workspace?.workspace?.type === 'personal_trainer',
    isGym: workspace?.workspace?.type === 'gym' || !workspace?.workspace?.type,
    workspaceType: workspace?.workspace?.type || 'gym',
    // Función para limpiar cache (útil al cambiar de gym)
    clearCache: () => {
      sessionStorage.removeItem('workspace_context')
    }
  }
}
