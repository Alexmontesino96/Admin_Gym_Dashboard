import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Limpiar la cookie selectedGymId antes de hacer logout
  const response = NextResponse.redirect(
    new URL('/api/auth/logout', req.url),
    { status: 302 }
  );

  // Eliminar la cookie selectedGymId
  response.cookies.set('selectedGymId', '', {
    path: '/',
    expires: new Date(0), // Fecha en el pasado para eliminar
    maxAge: 0,
  });

  return response;
} 