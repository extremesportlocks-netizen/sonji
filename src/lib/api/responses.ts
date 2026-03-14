import { NextResponse } from "next/server";

/**
 * Standard API response envelope.
 * Every API route uses this for consistent response format.
 */

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  code?: string;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    hasMore?: boolean;
  };
}

/** 200 — Success with data */
export function ok<T>(data: T, meta?: ApiResponse["meta"]): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ ok: true, data, ...(meta ? { meta } : {}) }, { status: 200 });
}

/** 201 — Created */
export function created<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ ok: true, data }, { status: 201 });
}

/** 204 — No Content (for deletes) */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/** 400 — Bad Request */
export function badRequest(error: string, code?: string): NextResponse<ApiResponse> {
  return NextResponse.json({ ok: false, error, code: code || "BAD_REQUEST" }, { status: 400 });
}

/** 401 — Unauthorized */
export function unauthorized(error = "Authentication required"): NextResponse<ApiResponse> {
  return NextResponse.json({ ok: false, error, code: "UNAUTHORIZED" }, { status: 401 });
}

/** 403 — Forbidden */
export function forbidden(error = "Insufficient permissions"): NextResponse<ApiResponse> {
  return NextResponse.json({ ok: false, error, code: "FORBIDDEN" }, { status: 403 });
}

/** 404 — Not Found */
export function notFound(resource = "Resource"): NextResponse<ApiResponse> {
  return NextResponse.json({ ok: false, error: `${resource} not found`, code: "NOT_FOUND" }, { status: 404 });
}

/** 409 — Conflict (duplicate, already exists) */
export function conflict(error: string): NextResponse<ApiResponse> {
  return NextResponse.json({ ok: false, error, code: "CONFLICT" }, { status: 409 });
}

/** 422 — Validation Error */
export function validationError(errors: Record<string, string[]>): NextResponse<ApiResponse> {
  return NextResponse.json(
    { ok: false, error: "Validation failed", code: "VALIDATION_ERROR", data: errors },
    { status: 422 }
  );
}

/** 429 — Rate Limited */
export function rateLimited(retryAfter = 60): NextResponse<ApiResponse> {
  return NextResponse.json(
    { ok: false, error: "Too many requests", code: "RATE_LIMITED" },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

/** 500 — Internal Server Error */
export function serverError(error = "Internal server error"): NextResponse<ApiResponse> {
  console.error("[API Error]", error);
  return NextResponse.json({ ok: false, error, code: "SERVER_ERROR" }, { status: 500 });
}

/**
 * Wrap an API handler with try/catch for consistent error handling.
 */
export function withErrorHandler(
  handler: (req: any, ctx?: any) => Promise<NextResponse>
) {
  return async (req: any, ctx?: any): Promise<NextResponse> => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`[API] ${req.method} ${new URL(req.url).pathname}:`, message);
      
      // Handle AuthErrors with proper status codes
      if (err && typeof err === "object" && "status" in err) {
        const authErr = err as { status: number; message: string };
        if (authErr.status === 401) return unauthorized(authErr.message);
        if (authErr.status === 403) return forbidden(authErr.message);
      }
      
      // NOTE: Showing real errors during development phase. Hide before public launch.
      return serverError(message);
    }
  };
}
