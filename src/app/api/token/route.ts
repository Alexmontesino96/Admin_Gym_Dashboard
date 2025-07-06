import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No hay sesión activa' },
        { status: 401 }
      );
    }

    // Debugging: Log completo de la sesión
    console.log('Sesión completa:', {
      hasUser: !!session.user,
      hasAccessToken: !!session.accessToken,
      hasTokenSet: !!(session as any).tokenSet,
      userSub: session.user?.sub,
      sessionKeys: Object.keys(session),
      tokenSetKeys: (session as any).tokenSet ? Object.keys((session as any).tokenSet) : [],
      accessToken: session.accessToken ? 'PRESENTE' : 'AUSENTE'
    });

    // Verificar si tenemos un accessToken en la sesión directamente
    if (session.accessToken) {
      return NextResponse.json({
        accessToken: session.accessToken,
        expiresIn: 3600, // Default 1 hora
        tokenType: 'Bearer'
      });
    }

    // Verificar si el accessToken está en el tokenSet
    const tokenSet = (session as any).tokenSet;
    if (tokenSet && tokenSet.accessToken) {
      console.log('AccessToken encontrado en tokenSet');
      return NextResponse.json({
        accessToken: tokenSet.accessToken,
        expiresIn: tokenSet.expiresAt ? Math.floor((tokenSet.expiresAt - Date.now()) / 1000) : 3600,
        tokenType: 'Bearer'
      });
    }

    // Si no tenemos accessToken, intentar obtenerlo directamente
    console.log('No se encontró accessToken en la sesión, intentando obtenerlo directamente...');
    
    try {
      // Intentar obtener el token desde la API de Auth0
      const tokenResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: process.env.AUTH0_API_AUDIENCE,
          grant_type: 'client_credentials'
        })
      });

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        console.log('Token obtenido via client_credentials:', {
          hasAccessToken: !!tokenData.access_token,
          tokenType: tokenData.token_type
        });
        
        return NextResponse.json({
          accessToken: tokenData.access_token,
          expiresIn: tokenData.expires_in,
          tokenType: tokenData.token_type
        });
      }
    } catch (clientCredentialsError) {
      console.error('Error con client_credentials:', clientCredentialsError);
    }

    // Si no pudimos obtener el token, devolver error con detalles
    return NextResponse.json(
      { 
        error: 'No se pudo obtener access token',
        details: 'El token de acceso no está disponible en la sesión. Es necesario hacer logout y login nuevamente para obtener el token con el audience correcto.',
        sessionData: {
          hasUser: !!session.user,
          hasAccessToken: !!session.accessToken,
          userSub: session.user.sub,
          sessionKeys: Object.keys(session)
        },
        action: 'logout_required'
      },
      { status: 401 }
    );
    
  } catch (error) {
    console.error('Error obteniendo token:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 