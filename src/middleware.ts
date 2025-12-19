import { auth0 } from '@/lib/auth0'
import { NextRequest, NextResponse } from 'next/server'

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rutas que no requieren autenticación
  const publicRoutes = ['/', '/login', '/register', '/verify-email']

  // Rutas que requieren autenticación pero no requieren gimnasio seleccionado
  const authOnlyRoutes = ['/select-gym', '/post-login']

  // Rutas de API que no necesitan verificación de gimnasio
  const apiExemptRoutes = ['/api/auth', '/api/token']

  // Permitir acceso a rutas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Permitir acceso a APIs exentas
  if (apiExemptRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  try {
    // Verificar si el usuario está autenticado
    const session = await auth0.getSession(req)
    
    if (!session) {
      console.log('No session found, redirecting to login')
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }

    // Para rutas que solo requieren autenticación
    if (authOnlyRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next()
    }

    // Para todas las demás rutas, verificar que haya un gimnasio seleccionado
    const selectedGymId = req.cookies.get('selectedGymId')?.value

    if (!selectedGymId || selectedGymId === 'null' || selectedGymId === 'undefined') {
      console.log(`No gym selected for ${pathname}, redirecting to /select-gym`)
      const selectGymUrl = new URL('/select-gym', req.url)
      selectGymUrl.searchParams.set('returnTo', pathname)
      return NextResponse.redirect(selectGymUrl)
    }

    // Si llegamos aquí, el usuario está autenticado y tiene gimnasio seleccionado
    return NextResponse.next()

  } catch (error) {
    console.error('Middleware error:', error)
    // En caso de error, redirigir a login por seguridad
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - auth routes (handled by Auth0)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 