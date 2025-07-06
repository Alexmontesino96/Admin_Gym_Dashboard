import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'https://gymapi-eh6m.onrender.com'

export async function POST(request: NextRequest) {
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

    // Obtener datos del request
    const body = await request.json()
    // Obtener el gym ID del header (que viene del frontend con el gimnasio seleccionado)
    const gymId = request.headers.get('X-Gym-ID') || '1'

    console.log('Enviando request al backend:', {
      url: `${BACKEND_URL}/api/v1/chat/rooms`,
      body,
      gymId,
      hasToken: !!accessToken
    })

    // Hacer la llamada al backend
    const response = await fetch(`${BACKEND_URL}/api/v1/chat/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Gym-ID': gymId,
      },
      body: JSON.stringify(body)
    })

    const responseText = await response.text()
    console.log('Respuesta del backend:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText
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
      console.log('Datos parseados del backend (POST):', data)
      return NextResponse.json(data)
    } catch (parseError) {
      console.error('Error parseando respuesta del backend (POST):', parseError)
      console.log('Respuesta cruda (POST):', responseText)
      return NextResponse.json(
        { detail: 'Respuesta inválida del servidor' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error en el proxy de chat rooms:', error)
    return NextResponse.json(
      { detail: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
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

    const gymId = request.headers.get('X-Gym-ID') || '1'

    console.log('Obteniendo salas de chat del backend:', {
      url: `${BACKEND_URL}/api/v1/chat/rooms`,
      gymId,
      hasToken: !!accessToken
    })

    // Hacer la llamada al backend para obtener las salas
    const response = await fetch(`${BACKEND_URL}/api/v1/chat/rooms`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Gym-ID': gymId,
      }
    })

    const responseText = await response.text()
    console.log('Respuesta del backend (GET):', {
      status: response.status,
      statusText: response.statusText,
      body: responseText
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
    } catch {
      return NextResponse.json(
        { detail: 'Respuesta inválida del servidor' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error en el proxy de chat rooms (GET):', error)
    return NextResponse.json(
      { detail: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 