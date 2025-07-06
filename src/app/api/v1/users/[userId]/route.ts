import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'https://gymapi-eh6m.onrender.com'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verificar autenticación
    const session = await auth0.getSession()
    if (!session) {
      return NextResponse.json(
        { detail: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener el token de acceso desde la ruta /api/token
    let accessToken;
    try {
      const tokenResponse = await fetch(`${request.nextUrl.origin}/api/token`, {
        headers: {
          'Cookie': request.headers.get('Cookie') || ''
        }
      });
      
      if (!tokenResponse.ok) {
        throw new Error('No se pudo obtener el token de acceso');
      }
      
      const tokenData = await tokenResponse.json();
      accessToken = tokenData.accessToken;
    } catch (tokenError) {
      console.error('Error obteniendo token:', tokenError);
      return NextResponse.json(
        { detail: 'Error de autenticación' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    // Obtener el gym_id del header enviado por el frontend
    const gymId = request.headers.get('X-Gym-ID')
    
    if (!gymId) {
      return NextResponse.json(
        { detail: 'Gym ID requerido' },
        { status: 400 }
      )
    }

    console.log('Fetching user info:', {
      url: `${BACKEND_URL}/api/v1/users/gym-participants/${userId}`,
      userId,
      gymId,
      hasToken: !!accessToken
    })

    // Hacer la llamada al backend
    const response = await fetch(`${BACKEND_URL}/api/v1/users/gym-participants/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Gym-ID': gymId,
        'Content-Type': 'application/json'
      }
    })

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