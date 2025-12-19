import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import { clearSelectedGymId } from '@/lib/api'

export default async function PostLoginPage() {
  const session = await auth0.getSession()

  if (!session) {
    redirect('/login')
  }

  // Limpiar cualquier selección previa de gimnasio al hacer login
  // Esto fuerza al usuario a seleccionar un gimnasio explícitamente
  clearSelectedGymId()

  // Redirigir al dashboard
  // El middleware detectará que no hay gimnasio seleccionado y redirigirá a /select-gym
  redirect('/dashboard')
} 