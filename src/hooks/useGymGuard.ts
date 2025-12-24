'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getSelectedGymId } from '@/lib/api'

export function useGymGuard() {
  const [isGymSelected, setIsGymSelected] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkGymSelection = () => {
      try {
        // Verificar que pathname no sea null
        if (!pathname) {
          setIsChecking(false)
          return
        }

        // Rutas que no requieren gimnasio seleccionado
        const exemptRoutes = ['/select-gym', '/auth/login', '/auth/logout', '/auth/callback', '/logout']
        
        if (exemptRoutes.some(route => pathname.startsWith(route))) {
          setIsGymSelected(true)
          setIsChecking(false)
          return
        }

        const selectedGymId = getSelectedGymId()
        
        if (!selectedGymId || selectedGymId === 'null' || selectedGymId === 'undefined') {
          console.log('🚨 No gym selected, redirecting to /select-gym')
          setIsGymSelected(false)
          setIsChecking(false)
          
          // Redirigir con returnTo para volver a la página actual
          const currentPath = encodeURIComponent(pathname)
          router.push(`/select-gym?returnTo=${currentPath}`)
          return
        }

        console.log('✅ Gym selected:', selectedGymId)
        setIsGymSelected(true)
        setIsChecking(false)
        
      } catch (error) {
        console.error('Error checking gym selection:', error)
        setIsGymSelected(false)
        setIsChecking(false)
        router.push('/select-gym')
      }
    }

    // Verificar inmediatamente
    checkGymSelection()

    // También verificar cuando cambie el localStorage (ej: otra pestaña)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedGymId') {
        checkGymSelection()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [pathname, router])

  return {
    isGymSelected,
    isChecking,
    selectedGymId: getSelectedGymId() || null
  }
} 