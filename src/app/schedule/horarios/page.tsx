'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HorariosPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir automáticamente a la vista semanal
    router.replace('/schedule/horarios/semana')
  }, [router])

  // Mostrar un spinner mientras se redirige
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
} 