import { auth0 } from '@/lib/auth0'
import { NextRequest, NextResponse } from 'next/server'

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rutas que no requieren autenticación.
  //
  // /legal y /support son públicas a propósito: App Review las abre sin sesión, y la app enlaza a
  // ellas desde el alta y desde el perfil.
  //
  const publicRoutes = ['/', '/login', '/register', '/verify-email', '/legal', '/support']

  // Rutas que requieren autenticación pero no requieren gimnasio seleccionado
  const authOnlyRoutes = ['/select-gym', '/post-login', '/logout']

  // Rutas de API que no necesitan verificación de gimnasio.
  //
  // Están TODAS las del panel, no solo dos: los manejadores propios responden JSON, y un
  // redirect a /select-gym donde el navegador espera un objeto rompe la llamada en silencio.
  // Cada uno comprueba la sesión por su cuenta.
  const apiExemptRoutes = ['/api/auth', '/api/token', '/api/v1']

  // Permitir acceso a rutas públicas.
  //
  // El comparador era `startsWith`, y como '/' está en la lista la condición era CIERTA PARA
  // CUALQUIER RUTA: el middleware devolvía `next()` siempre y la sesión no se verificaba nunca.
  // La raíz se compara por igualdad y el resto por prefijo con barra, para que '/login' no
  // haga públicas rutas como '/login-algo'.
  const isPublic =
    pathname === '/' ||
    publicRoutes
      .filter(route => route !== '/')
      .some(route => pathname === route || pathname.startsWith(`${route}/`))

  if (isPublic) {
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