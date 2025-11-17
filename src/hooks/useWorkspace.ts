'use client'

import { useEffect, useState, useCallback } from 'react'
import { dashboardAPI, WorkspaceContext, WorkspaceType, getSelectedGymId } from '@/lib/api'

// Contexto por defecto cuando el endpoint no existe
const DEFAULT_WORKSPACE: WorkspaceContext = {
  workspace_id: 0,
  type: WorkspaceType.GYM,
  name: 'Gimnasio',
  terminology: {
    user_singular: 'miembro',
    user_plural: 'miembros',
    workspace: 'gimnasio',
    relationship: 'membresía'
  }
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
    isTrainer: workspace?.type === WorkspaceType.PERSONAL_TRAINER,
    isGym: workspace?.type === WorkspaceType.GYM || !workspace?.type,
    workspaceType: workspace?.type || WorkspaceType.GYM,
    // Función para limpiar cache (útil al cambiar de gym)
    clearCache: () => {
      sessionStorage.removeItem('workspace_context')
    }
  }
}
