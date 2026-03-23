import { NextRequest, NextResponse } from 'next/server'

// Proxy runs on the Edge — it can only read the session cookie we set at
// login. The actual role check happens client-side via AuthContext; proxy
// just ensures unauthenticated users always land on /login.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes — always accessible
  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const session = request.cookies.get('session')?.value

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
