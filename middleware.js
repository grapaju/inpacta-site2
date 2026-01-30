import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  // Redirecionar acessos a /dados para a página inicial
  if (pathname.startsWith('/dados')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
}

export const config = {
  matcher: ['/dados/:path*']
}