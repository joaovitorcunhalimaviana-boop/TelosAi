import { NextRequest, NextResponse } from 'next/server';
import { buildErrorResponse } from './api-utils';

// ============================================
// AUTHENTICATION MIDDLEWARE (Prepared for NextAuth)
// ============================================

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'nurse' | 'assistant';
}

/**
 * Authentication middleware - Prepared for future NextAuth integration
 * Currently returns a mock user for development
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // TODO: Integrate with NextAuth when authentication is implemented
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json(
    //     buildErrorResponse('Unauthorized', 'You must be logged in to access this resource'),
    //     { status: 401 }
    //   );
    // }

    // For now, return a mock user
    const mockUser: AuthUser = {
      id: 'dev-user-id',
      email: 'dev@example.com',
      name: 'Development User',
      role: 'doctor',
    };

    return handler(request, mockUser);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      buildErrorResponse(
        'Authentication failed',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 401 }
    );
  }
}

// ============================================
// AUTHORIZATION MIDDLEWARE
// ============================================

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'assistant';

export function withRole(
  allowedRoles: UserRole[],
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (request: NextRequest, user: AuthUser) => {
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        buildErrorResponse(
          'Forbidden',
          `This action requires one of the following roles: ${allowedRoles.join(', ')}`
        ),
        { status: 403 }
      );
    }

    return handler(request, user);
  };
}

// ============================================
// RATE LIMITING MIDDLEWARE (Prepared for implementation)
// ============================================

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware - Basic implementation
 * For production, consider using a Redis-based solution
 */
export async function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get client identifier (IP address or user ID)
    const identifier =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const now = Date.now();
    const rateLimitData = rateLimitStore.get(identifier);

    if (rateLimitData) {
      // Check if window has expired
      if (now > rateLimitData.resetTime) {
        // Reset the counter
        rateLimitStore.set(identifier, {
          count: 1,
          resetTime: now + config.windowMs,
        });
      } else if (rateLimitData.count >= config.maxRequests) {
        // Rate limit exceeded
        const retryAfter = Math.ceil((rateLimitData.resetTime - now) / 1000);
        return NextResponse.json(
          buildErrorResponse(
            'Rate limit exceeded',
            `Too many requests. Please try again in ${retryAfter} seconds.`,
            'RATE_LIMIT_EXCEEDED'
          ),
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': rateLimitData.resetTime.toString(),
            },
          }
        );
      } else {
        // Increment counter
        rateLimitData.count++;
        rateLimitStore.set(identifier, rateLimitData);
      }
    } else {
      // First request from this identifier
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs,
      });
    }

    // Clean up old entries periodically (simple cleanup)
    if (rateLimitStore.size > 10000) {
      const keysToDelete: string[] = [];
      rateLimitStore.forEach((value, key) => {
        if (now > value.resetTime) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => rateLimitStore.delete(key));
    }

    return handler(request);
  } catch (error) {
    console.error('Rate limiting error:', error);
    // On error, allow the request to proceed
    return handler(request);
  }
}

// ============================================
// CORS MIDDLEWARE
// ============================================

export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  credentials: boolean;
}

const defaultCorsConfig: CorsConfig = {
  allowedOrigins: ['*'],
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

export function withCors(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: Partial<CorsConfig> = {}
): Promise<NextResponse> {
  const corsConfig = { ...defaultCorsConfig, ...config };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return Promise.resolve(
      new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': corsConfig.allowedOrigins.join(', '),
          'Access-Control-Allow-Methods': corsConfig.allowedMethods.join(', '),
          'Access-Control-Allow-Headers': corsConfig.allowedHeaders.join(', '),
          'Access-Control-Allow-Credentials': corsConfig.credentials.toString(),
          'Access-Control-Max-Age': '86400',
        },
      })
    );
  }

  return handler(request);
}

// ============================================
// REQUEST VALIDATION MIDDLEWARE
// ============================================

export async function withValidation<T>(
  request: NextRequest,
  schema: any,
  handler: (request: NextRequest, data: T) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return handler(request, validatedData);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        buildErrorResponse(
          'Validation error',
          error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
          'VALIDATION_ERROR'
        ),
        { status: 400 }
      );
    }

    return NextResponse.json(
      buildErrorResponse(
        'Invalid request body',
        error instanceof Error ? error.message : 'Unknown error',
        'INVALID_REQUEST'
      ),
      { status: 400 }
    );
  }
}

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

export async function withErrorHandler(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    console.error('API Error:', error);

    // Prisma errors
    if (error instanceof Error && error.message.includes('Prisma')) {
      return NextResponse.json(
        buildErrorResponse(
          'Database error',
          'An error occurred while accessing the database',
          'DATABASE_ERROR'
        ),
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      buildErrorResponse(
        'Internal server error',
        error instanceof Error ? error.message : 'Unknown error',
        'INTERNAL_ERROR'
      ),
      { status: 500 }
    );
  }
}

// ============================================
// LOGGING MIDDLEWARE
// ============================================

export async function withLogging(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const method = request.method;
  const url = request.url;

  console.log(`[API] ${method} ${url} - Started`);

  try {
    const response = await handler(request);
    const duration = Date.now() - startTime;
    console.log(`[API] ${method} ${url} - ${response.status} (${duration}ms)`);
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API] ${method} ${url} - Error (${duration}ms)`, error);
    throw error;
  }
}

// ============================================
// COMPOSITE MIDDLEWARE
// ============================================

/**
 * Combine multiple middleware functions
 */
export function compose(
  ...middlewares: Array<
    (
      request: NextRequest,
      next: (request: NextRequest) => Promise<NextResponse>
    ) => Promise<NextResponse>
  >
) {
  return async (
    request: NextRequest,
    handler: (request: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> => {
    let index = 0;

    const next = async (req: NextRequest): Promise<NextResponse> => {
      if (index >= middlewares.length) {
        return handler(req);
      }
      const middleware = middlewares[index++];
      return middleware(req, next);
    };

    return next(request);
  };
}
