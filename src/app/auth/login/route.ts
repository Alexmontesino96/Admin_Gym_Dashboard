import { NextRequest } from 'next/server'
import { auth0 } from '@/lib/auth0'
 
export async function GET(req: NextRequest) {
  const returnTo = req.nextUrl.searchParams.get('returnTo') || '/'
  // Utiliza el helper del SDK para gestionar login y estado de forma segura
  return auth0.startInteractiveLogin({ returnTo })
} 