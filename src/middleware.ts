import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  try {
    const response = await auth0.middleware(request);
    
    // Verificar si el usuario está autenticado y necesita seleccionar gimnasio
    const pathname = request.nextUrl.pathname;
    
    // Páginas que no requieren verificación de gimnasio
    const publicPaths = [
      '/auth/login',
      '/auth/callback', 
      '/auth/logout',
      '/login',
      '/post-login',
      '/select-gym',
      '/api/',
      '/_next/',
      '/favicon.ico'
    ];
    
    // Si es una ruta pública, continuar
    if (publicPaths.some(path => pathname.startsWith(path))) {
      console.log(`[Middleware] Ruta pública permitida: ${pathname}`);
      return response;
    }
    
    // Verificar si hay sesión
    const session = await auth0.getSession(request);
    
    if (!session) {
      // Si no hay sesión, redirigir a login
      console.log(`[Middleware] No hay sesión, redirigiendo a /login desde: ${pathname}`);
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Usuario autenticado, verificar si tiene gimnasio seleccionado
    const selectedGymId = request.cookies.get('selectedGymId')?.value;
    console.log(`[Middleware] Usuario autenticado en ${pathname}, gymId: ${selectedGymId || 'NO_SELECCIONADO'}`);
    
    // Si no tiene gimnasio seleccionado y no está en la página de selección
    if (!selectedGymId && pathname !== '/select-gym') {
      console.log(`[Middleware] No hay gimnasio seleccionado, redirigiendo a /select-gym desde: ${pathname}`);
      const selectGymUrl = new URL('/select-gym', request.url);
      return NextResponse.redirect(selectGymUrl);
    }
    
    // Si tiene gimnasio seleccionado pero está en la página de selección, redirigir al dashboard
    if (selectedGymId && pathname === '/select-gym') {
      console.log(`[Middleware] Gimnasio ya seleccionado (${selectedGymId}), redirigiendo al dashboard`);
      const dashboardUrl = new URL('/', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    
    console.log(`[Middleware] Permitiendo acceso a ${pathname} con gimnasio ${selectedGymId}`);
    return response;
    
  } catch (error: any) {
    // Si hay error de descifrado JWE, limpiar cookies y continuar
    if (error.code === 'ERR_JWE_DECRYPTION_FAILED' || 
        error.message?.includes('decryption operation failed') ||
        error.message?.includes('ikm')) {
      
      console.log('Cookies Auth0 corruptas detectadas, limpiando automáticamente...');
      
      // Crear respuesta que limpia las cookies de Auth0
      const response = NextResponse.next();
      
      // Limpiar todas las cookies relacionadas con Auth0
      const cookiesToClear = [
        'appSession',
        'appSession.0',
        'appSession.1', 
        'appSession.2',
        'auth0.is.authenticated',
        'selectedGymId' // También limpiar el gym seleccionado
      ];
      
      cookiesToClear.forEach(cookieName => {
        response.cookies.set(cookieName, '', {
          expires: new Date(0),
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      });
      
      return response;
    }
    
    // Para otros errores, relanzar
    console.error('[Middleware] Error inesperado:', error);
    throw error;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
  ]
}; 