import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  try {
  return await auth0.middleware(request);
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
        'auth0.is.authenticated'
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