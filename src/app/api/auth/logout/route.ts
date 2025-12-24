import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Usar el origin del request (forma oficial de Next.js)
  // En Vercel, esto automáticamente resuelve a https://admin-gym-dashboard.vercel.app
  // En local, resuelve a http://localhost:3000
  const baseUrl = request.nextUrl.origin

  // Después del logout, siempre redirigir a /login para forzar un flujo limpio
  // Esto evita que el usuario vaya al dashboard sin selectedGymId
  const returnTo = `${baseUrl}/login`

  const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL || process.env.NEXT_PUBLIC_AUTH0_DOMAIN
  const clientId = process.env.AUTH0_CLIENT_ID || process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID

  if (!auth0Domain || !clientId) {
    return NextResponse.json({ error: 'Auth0 config missing' }, { status: 500 })
  }

  console.log('Logout - origin:', request.nextUrl.origin)
  console.log('Logout - returnTo URL:', returnTo)
  console.log('Logout - headers x-forwarded-proto:', request.headers.get('x-forwarded-proto'))
  console.log('Logout - headers x-forwarded-host:', request.headers.get('x-forwarded-host'))

  const logoutUrl = `${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${encodeURIComponent(returnTo)}`
  return NextResponse.redirect(logoutUrl, 302)
} 