import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'
import VerifyEmailClient from './VerifyEmailClient'

export default async function VerifyEmailPage() {
  const session = await auth0.getSession()

  // Si ya está autenticado, redirigir a select-gym
  if (session) {
    redirect('/select-gym')
  }

  return <VerifyEmailClient />
}
