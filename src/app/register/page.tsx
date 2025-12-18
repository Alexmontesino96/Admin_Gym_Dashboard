import { auth0 } from '@/lib/auth0'
import { redirect } from 'next/navigation'

export default async function RegisterPage() {
  const session = await auth0.getSession()

  // Si ya está autenticado, redirigir a select-gym
  if (session) {
    redirect('/select-gym')
  }

  // Redirigir a Auth0 con screen_hint=signup para mostrar pantalla de registro
  redirect('/auth/login?screen_hint=signup&returnTo=%2Fpost-login')
}
