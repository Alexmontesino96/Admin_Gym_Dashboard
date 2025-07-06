import { NextRequest } from 'next/server'
import { auth0 } from '@/lib/auth0'

export function GET(req: NextRequest) {
  // delega al SDK; reconocerá la ruta '/auth/logout' y ejecutará su logout
  return auth0.middleware(req)
} 