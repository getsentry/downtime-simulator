import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const requestStart = Date.now()
  
  // Get Vercel's edge timing if available
  const vercelId = request.headers.get('x-vercel-id')
  const vercelTimestamp = vercelId ? parseInt(vercelId.split('-')[1]) : null
  
  // Clone the request headers to add our timing
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-middleware-request-start', requestStart.toString())
  
  // Continue with your existing middleware logic
  const hostname = request.headers.get('host') || ''
  const rootHostname = process.env.DOWNTIME_SIMULATOR_ROOT_HOSTNAME || 'localhost:3000'
  
  // For non-root hostnames, rewrite to dynamic route
  if (hostname !== rootHostname && !hostname.startsWith('localhost')) {
    const response = NextResponse.rewrite(
      new URL(`/${hostname}?nxtPhost=${hostname}`, request.url),
      {
        request: {
          headers: requestHeaders,
        },
      }
    )
    
    // Add Server-Timing header with edge latency if we have Vercel timestamp
    if (vercelTimestamp) {
      const edgeLatency = requestStart - vercelTimestamp
      response.headers.set('Server-Timing', `edge;dur=${edgeLatency}`)
    }
    
    // Add custom timing headers
    response.headers.set('X-Middleware-Process-Time', (Date.now() - requestStart).toString())
    
    return response
  }
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}