import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import { clearSelectedGymId } from '@/lib/api'

export default async function PostLoginPage() {
  const session = await auth0.getSession()

  if (!session) {
    redirect('/login')
  }

  // Limpiar cualquier selección previa de gimnasio
  // Esto se hace en el servidor, pero también se limpiará en el cliente
  
  // Redirigir inmediatamente a selección de gimnasio
  redirect('/select-gym')
} 