import { NextRequest } from 'next/server'
import { auth0 } from '@/lib/auth0'
 
export function GET(req: NextRequest) {
  // Dejar que Auth0 maneje el callback normalmente
  // El middleware se encargará de redirigir a /select-gym después
  return auth0.middleware(req)
} 