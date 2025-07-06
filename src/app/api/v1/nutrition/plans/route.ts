import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '') || 'https://gymapi-eh6m.onrender.com'

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

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const per_page = searchParams.get('per_page') || '20'
    const goal = searchParams.get('goal')
    const difficulty_level = searchParams.get('difficulty_level')
    const budget_level = searchParams.get('budget_level')
    const dietary_restrictions = searchParams.get('dietary_restrictions')
    const search_query = searchParams.get('search_query')
    const creator_id = searchParams.get('creator_id')

    // Obtener el gym ID del header
    const gymId = request.headers.get('X-Gym-ID') || '1'

    // Construir URL con parámetros
    const params = new URLSearchParams({
      page,
      per_page
    })

    if (goal) params.append('goal', goal)
    if (difficulty_level) params.append('difficulty_level', difficulty_level)
    if (budget_level) params.append('budget_level', budget_level)
    if (dietary_restrictions) params.append('dietary_restrictions', dietary_restrictions)
    if (search_query) params.append('search_query', search_query)
    if (creator_id) params.append('creator_id', creator_id)

    console.log('Fetching nutrition plans:', {
      url: `${BACKEND_URL}/api/v1/nutrition/plans?${params.toString()}`,
      gymId,
      hasToken: !!accessToken
    })

    // Hacer la llamada al backend
    const response = await fetch(`${BACKEND_URL}/api/v1/nutrition/plans?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Gym-ID': gymId,
        'Content-Type': 'application/json'
      }
    })

    const responseText = await response.text()
    console.log('Backend response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText.substring(0, 500) // Solo primeros 500 caracteres para log
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
      console.error('Error parsing backend response:', parseError)
      console.log('Raw response:', responseText)
      return NextResponse.json(
        { detail: 'Respuesta inválida del servidor' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in nutrition plans proxy:', error)
    return NextResponse.json(
      { detail: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

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
    
    // Obtener el gym ID del header
    const gymId = request.headers.get('X-Gym-ID') || '1'

    console.log('Creating nutrition plan:', {
      url: `${BACKEND_URL}/api/v1/nutrition/plans`,
      body,
      gymId,
      hasToken: !!accessToken
    })

    // Hacer la llamada al backend
    const response = await fetch(`${BACKEND_URL}/api/v1/nutrition/plans`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Gym-ID': gymId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const responseText = await response.text()
    console.log('Create plan response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText.substring(0, 500) // Solo primeros 500 caracteres para log
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
      return NextResponse.json(data, { status: 201 })
    } catch (parseError) {
      console.error('Error parsing create plan response:', parseError)
      console.log('Raw response:', responseText)
      return NextResponse.json(
        { detail: 'Respuesta inválida del servidor' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in create nutrition plan proxy:', error)
    return NextResponse.json(
      { detail: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 