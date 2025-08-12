import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { kv } from '@vercel/kv'
import { unstable_noStore as noStore } from 'next/cache'
import { Metadata } from 'next'
import { captureException } from '@sentry/nextjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function generateMetadata({
  params,
}: {
  params: { host: string }
}): Promise<Metadata> {
  return {
    title: `${params.host} - Status Page`,
    description: `Current status for ${params.host}`,
  }
}

export default async function HostPage({
  params,
}: {
  params: { host: string }
}) {
  noStore()
  
  const pageStart = Date.now()
  const headersList = await headers()
  const middlewareStart = headersList.get('x-middleware-request-start')
  
  try {
    console.log('received with request URL', `https://${params.host}/`)
    console.log('received with request method:', 'GET')
    console.log('received with request body:')
    
    // Log headers for debugging
    const headersObj: Record<string, string> = {}
    headersList.forEach((value: string, key: string) => {
      headersObj[key] = value
    })
    console.log('received with request headers:', JSON.stringify(headersObj))
    
    // Check if host should return an error status
    const status = await kv.get<number>(`host:${params.host}:status`)
    
    // Simulate an error for testing (force 500)
    if (status === 500) {
      try {
        const posts = await prisma.post.findMany()
        console.log('posts', posts)
      } catch (error) {
        console.error(error)
        captureException(error)
      }
    }
    
    // Calculate timing metrics
    const timingMetrics = []
    
    // Add edge-to-middleware timing if available
    if (middlewareStart) {
      const edgeToMiddleware = parseInt(middlewareStart) - (parseInt(headersList.get('x-vercel-id')?.split('-')[1] || '0') || Date.now())
      if (edgeToMiddleware > 0) {
        timingMetrics.push(`edge-to-middleware;dur=${edgeToMiddleware}`)
      }
      
      // Add middleware-to-page timing
      const middlewareToPage = pageStart - parseInt(middlewareStart)
      timingMetrics.push(`middleware-to-page;dur=${middlewareToPage}`)
    }
    
    // Add page processing time
    const pageProcessing = Date.now() - pageStart
    timingMetrics.push(`page-processing;dur=${pageProcessing}`)
    
    // Set Server-Timing header
    if (timingMetrics.length > 0) {
      // Note: In App Router, we can't directly set response headers from page components
      // This would need to be handled differently, possibly through middleware or API routes
      console.log('Server-Timing:', timingMetrics.join(', '))
    }
    
    if (status === 404) {
      console.log(`Returning 404 for host: ${params.host}`)
      notFound()
    }
    
    if (status === 500) {
      console.log(`Returning 500 for host: ${params.host}`)
      throw new Error(`Internal server error for host: ${params.host}`)
    }
    
    // Normal response
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <main className="flex flex-col items-center gap-8">
          <h1 className="text-4xl font-bold">{params.host}</h1>
          <p className="text-xl text-green-600">✓ Service is operational</p>
          <div className="text-sm text-gray-500">
            <p>No downtime configured</p>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    // Re-throw to trigger error boundary
    throw error
  }
}