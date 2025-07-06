import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'https://gymapi-eh6m.onrender.com'

// Debug: Verificar que la URL se construye correctamente
console.log('BACKEND_URL configurado:', BACKEND_URL)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  console.log('🔥 API PROXY EJECUTÁNDOSE - /api/v1/users/[userId]/route.ts');
  console.log('🔥 Request URL:', request.url);
  console.log('🔥 Request method:', request.method);
  
  try {
    // Verificar autenticación
    const session = await auth0.getSession()
    if (!session) {
      console.log('❌ No hay sesión, devolviendo 401');
      return NextResponse.json(
        { detail: 'No autorizado' },
        { status: 401 }
      )
    }

    console.log('✅ Sesión verificada, obteniendo token...');

    // Obtener el token de acceso desde la ruta /api/token
    let accessToken;
    try {
      const tokenResponse = await fetch(`${request.nextUrl.origin}/api/token`, {
        headers: {
          'Cookie': request.headers.get('Cookie') || ''
        }
      });
      
      console.log('Token response:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        ok: tokenResponse.ok
      });
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('Token error response:', errorData);
        throw new Error(`Token request failed: ${tokenResponse.status} - ${JSON.stringify(errorData)}`);
      }
      
      const tokenData = await tokenResponse.json();
      accessToken = tokenData.accessToken;
      
      console.log('Token obtenido exitosamente:', {
        hasAccessToken: !!accessToken,
        tokenLength: accessToken?.length,
        tokenType: tokenData.tokenType
      });
      
    } catch (tokenError) {
      console.error('Error obteniendo token:', tokenError);
      return NextResponse.json(
        { detail: 'Error de autenticación', error: tokenError instanceof Error ? tokenError.message : 'Error desconocido' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    console.log('🔥 UserId extraído de params:', userId);
    
    // Obtener el gym_id del header enviado por el frontend
    const gymId = request.headers.get('X-Gym-ID')
    console.log('🔥 GymId del header:', gymId);
    
    if (!gymId) {
      console.log('❌ No hay Gym ID, devolviendo 400');
      return NextResponse.json(
        { detail: 'Gym ID requerido' },
        { status: 400 }
      )
    }

    // Obtener parámetros opcionales skip y limit
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '1';
    
    console.log('🔥 Query params:', { skip, limit });

    // Construir la URL completa paso a paso para debug
    const baseUrl = `${BACKEND_URL}/api/v1/users/gym-participants/${userId}`;
    const queryParams = `skip=${skip}&limit=${limit}`;
    const fullUrl = `${baseUrl}?${queryParams}`;
    
    console.log('🔥🔥🔥 CONSTRUCCIÓN DE URL:');
    console.log('- BACKEND_URL:', BACKEND_URL);
    console.log('- baseUrl:', baseUrl);
    console.log('- queryParams:', queryParams);
    console.log('- fullUrl:', fullUrl);
    console.log('🔥🔥🔥 ENVIANDO REQUEST AL BACKEND...');

    // Hacer la llamada al backend
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Gym-ID': gymId,
        'Content-Type': 'application/json'
      }
    })

    console.log('🔥 Response del backend:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });

    const responseText = await response.text()
    console.log('User info response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText.substring(0, 200) // Solo primeros 200 caracteres para log
    })

    if (!response.ok) {
      try {
        const jsonError = JSON.parse(responseText)
        return NextResponse.json(jsonError, { status: response.status })
      } catch {
        return NextResponse.json(
          { detail: `Error del servidor: ${response.status} ${response.statusText}` },
          { status: response.status }
        )
      }
    }

    try {
      const data = JSON.parse(responseText)
      console.log('✅ Response exitosa, devolviendo data');
      return NextResponse.json(data)
    } catch (parseError) {
      console.error('Error parsing user info response:', parseError)
      console.log('Raw response:', responseText)
      return NextResponse.json(
        { detail: 'Respuesta inválida del servidor' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in user info proxy:', error)
    return NextResponse.json(
      { detail: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 