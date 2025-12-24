import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Construir la URL base desde el request (funciona en dev y prod)
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'
  const baseUrl = `${protocol}://${host}`

  // Usar baseUrl para returnTo (siempre volver a la raíz)
  const returnTo = request.nextUrl.searchParams.get('returnTo') || baseUrl

  const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL || process.env.NEXT_PUBLIC_AUTH0_DOMAIN
  const clientId = process.env.AUTH0_CLIENT_ID || process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID

  if (!auth0Domain || !clientId) {
    return NextResponse.json({ error: 'Auth0 config missing' }, { status: 500 })
  }

  console.log('Logout - returnTo URL:', returnTo)

  const logoutUrl = `${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${encodeURIComponent(returnTo)}`
  return NextResponse.redirect(logoutUrl, 302)
} 