import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

/**
 * Devuelve el token de acceso del USUARIO que tiene la sesión abierta.
 *
 * Aquí había un respaldo que, cuando la sesión no traía token, pedía uno a Auth0 con
 * `grant_type: client_credentials` usando el secreto de cliente, y lo devolvía al navegador.
 * Ese token no representa a nadie: lleva los permisos de la APLICACIÓN, no los de quien está
 * conectado. Cualquiera que abriera esta ruta desde el navegador se llevaba una credencial de
 * máquina con la que la API no puede distinguir un cliente de un administrador.
 *
 * Se ha quitado. Si la sesión no trae token, la respuesta correcta es 401 y volver a entrar,
 * que es lo que ya hacía la rama del final.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    // El token del usuario, directamente en la sesión.
    if (session.accessToken) {
      return NextResponse.json({
        accessToken: session.accessToken,
        expiresIn: 3600,
        tokenType: 'Bearer',
      });
    }

    // O dentro del tokenSet, según cómo lo haya guardado el SDK.
    const tokenSet = (session as any).tokenSet;
    if (tokenSet && tokenSet.accessToken) {
      return NextResponse.json({
        accessToken: tokenSet.accessToken,
        expiresIn: tokenSet.expiresAt
          ? Math.floor((tokenSet.expiresAt - Date.now()) / 1000)
          : 3600,
        tokenType: 'Bearer',
      });
    }

    // Sin token de usuario no hay nada que devolver. La respuesta no lleva datos de la sesión:
    // un cuerpo de error no es sitio para volcar identificadores.
    return NextResponse.json(
      {
        error: 'No access token available',
        details:
          'Your session does not carry an access token. Sign out and sign in again to get one with the right audience.',
        action: 'logout_required',
      },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error obteniendo token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
