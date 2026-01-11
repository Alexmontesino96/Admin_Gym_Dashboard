import { NextRequest } from 'next/server'
import { auth0 } from '@/lib/auth0'

export async function GET(req: NextRequest) {
  // Usar el SDK de Auth0 para hacer logout correctamente
  // Esto elimina la sesión del servidor Y redirige a Auth0 para cerrar la sesión allí también
  return auth0.handleLogout(req, {
    returnTo: '/login'
  })
} 