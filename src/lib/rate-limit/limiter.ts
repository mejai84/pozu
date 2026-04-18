/**
 * In-memory Rate Limiter for Next.js API Routes.
 * 
 * Works without external dependencies (Redis, Upstash, etc.).
 * Suitable for single-instance deployments (Docker/Dokploy).
 * 
 * For multi-instance deployments, replace with @upstash/ratelimit.
 * 
 * Usage:
 *   const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60_000 })
 *   
 *   export async function POST(req: Request) {
 *     const limited = limiter.check(req)
 *     if (limited) return limited  // Returns 429 Response
 *     // ... handle request
 *   }
 */

import { NextResponse } from 'next/server'

interface RateLimiterConfig {
  /** Maximum number of requests allowed within the time window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
  /** Custom message for rate limit exceeded (optional) */
  message?: string
}

interface RequestRecord {
  count: number
  resetAt: number
}

/**
 * Creates a rate limiter instance with the given configuration.
 * Each limiter maintains its own request tracking map.
 */
export function createRateLimiter(config: RateLimiterConfig) {
  const { maxRequests, windowMs, message } = config
  const requests = new Map<string, RequestRecord>()

  // Auto-cleanup stale entries every 60 seconds to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, record] of requests) {
      if (now > record.resetAt) {
        requests.delete(key)
      }
    }
  }, 60_000)

  // Prevent the interval from keeping the process alive (Node.js)
  if (cleanupInterval.unref) {
    cleanupInterval.unref()
  }

  return {
    /**
     * Check if a request should be rate limited.
     * @returns NextResponse with 429 if rate limited, or null if allowed.
     */
    check(req: Request): NextResponse | null {
      const ip = getClientIP(req)
      const now = Date.now()

      const record = requests.get(ip)

      // First request or window expired → reset
      if (!record || now > record.resetAt) {
        requests.set(ip, { count: 1, resetAt: now + windowMs })
        return null
      }

      // Within window → increment
      record.count++

      // Over limit
      if (record.count > maxRequests) {
        const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000)

        return NextResponse.json(
          {
            error: message || 'Demasiadas peticiones. Inténtalo de nuevo en unos minutos.',
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(retryAfterSeconds),
              'X-RateLimit-Limit': String(maxRequests),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(record.resetAt),
            },
          }
        )
      }

      return null
    },

    /**
     * Get the current status for debugging/monitoring.
     */
    getStats() {
      return {
        trackedIPs: requests.size,
        config: { maxRequests, windowMs },
      }
    },
  }
}

/**
 * Extract client IP from request headers.
 * Handles common reverse proxy headers (Vercel, Cloudflare, Nginx, Docker).
 */
function getClientIP(req: Request): string {
  const headers = req.headers

  // Vercel / general proxy
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  // Cloudflare
  const cfIP = headers.get('cf-connecting-ip')
  if (cfIP) return cfIP

  // Generic real IP header (Nginx)
  const realIP = headers.get('x-real-ip')
  if (realIP) return realIP

  // Fallback
  return 'unknown'
}

// ========================================
// Pre-configured limiters for common use cases
// ========================================

/** Public forms: 10 requests per minute (reservas, contacto) */
export const formLimiter = createRateLimiter({
  maxRequests: 10,
  windowMs: 60_000,
  message: 'Has enviado demasiados formularios. Espera un momento.',
})

/** Payment endpoints: 5 per minute (checkout) */
export const paymentLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 60_000,
  message: 'Demasiados intentos de pago. Espera un momento.',
})

/** File uploads: 20 per minute */
export const uploadLimiter = createRateLimiter({
  maxRequests: 20,
  windowMs: 60_000,
  message: 'Demasiadas subidas de archivos. Espera un momento.',
})

/** Admin API: 30 per minute (authenticated operations) */
export const adminLimiter = createRateLimiter({
  maxRequests: 30,
  windowMs: 60_000,
  message: 'Demasiadas operaciones. Espera un momento.',
})

/** Auth/Login: 5 per 5 minutes (brute force protection) */
export const authLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 5 * 60_000,
  message: 'Demasiados intentos de acceso. Espera 5 minutos.',
})
