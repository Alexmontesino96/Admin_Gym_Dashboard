import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import GymRegistrationWizard from '@/components/GymRegistrationWizard'
import GymTypeSelector from '@/components/GymTypeSelector'

interface RegisterPageProps {
  searchParams: {
    type?: 'gym' | 'personal_trainer'
  }
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const session = await auth0.getSession()

  // Si ya está autenticado, redirigir al dashboard
  // El middleware manejará la redirección a /select-gym si no hay gimnasio seleccionado
  if (session) {
    redirect('/dashboard')
  }

  // Si NO hay tipo en la URL, mostrar la splash screen de selección
  if (!searchParams.type) {
    return <GymTypeSelector />
  }

  // Si HAY tipo en la URL, mostrar el wizard con el tipo pre-seleccionado
  return <GymRegistrationWizard preSelectedType={searchParams.type} />
}
