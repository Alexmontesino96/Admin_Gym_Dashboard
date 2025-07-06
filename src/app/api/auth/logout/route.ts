import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get('returnTo') || process.env.NEXT_PUBLIC_BASE_URL || '/'
  const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL || process.env.NEXT_PUBLIC_AUTH0_DOMAIN
  const clientId = process.env.AUTH0_CLIENT_ID || process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID

  if (!auth0Domain || !clientId) {
    return NextResponse.json({ error: 'Auth0 config missing' }, { status: 500 })
  }

  const logoutUrl = `${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${encodeURIComponent(returnTo)}`
  return NextResponse.redirect(logoutUrl, 302)
} 