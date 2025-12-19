import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import GymRegistrationWizard from '@/components/GymRegistrationWizard'

export default async function RegisterPage() {
  const session = await auth0.getSession()

  // Si ya está autenticado, redirigir al dashboard
  // El middleware manejará la redirección a /select-gym si no hay gimnasio seleccionado
  if (session) {
    redirect('/dashboard')
  }

  return <GymRegistrationWizard />
}
