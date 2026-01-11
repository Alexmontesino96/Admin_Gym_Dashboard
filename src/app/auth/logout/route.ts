import { NextRequest } from 'next/server'
import { auth0 } from '@/lib/auth0'

export async function GET(req: NextRequest) {
  // En Auth0 SDK v4, el middleware maneja las rutas de auth automáticamente
  // Usamos auth0.middleware() para que el SDK procese el logout
  return auth0.middleware(req)
} 