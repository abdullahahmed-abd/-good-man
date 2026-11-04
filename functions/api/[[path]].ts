/**
 * Cloudflare Pages Function: First-Party API Proxy
 * 
 * Routes all /api/* requests to the configured backend server (e.g. Render / Fly / VPS).
 * Preserves SameSite=Lax, HttpOnly, and Secure cookies on the client's own domain,
 * ensuring iOS Safari and PWA standalone mode never block authentication cookies.
 */

interface Env {
  BACKEND_URL?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;

  // Read backend URL from Cloudflare environment variable, falling back to localhost for local wrangler testing
  const backendBase = (env.BACKEND_URL || 'http://localhost:3001').replace(/\/+$/, '');

  const clientUrl = new URL(request.url);
  const targetPath = Array.isArray(params.path) ? params.path.join('/') : (params.path || '');
  const targetUrl = new URL(`${backendBase}/api/${targetPath}${clientUrl.search}`);

  // Clone headers and forward client metadata
  const reqHeaders = new Headers(request.headers);
  reqHeaders.set('X-Forwarded-Host', clientUrl.host);
  reqHeaders.set('X-Forwarded-Proto', clientUrl.protocol.replace(':', ''));

  // Cloudflare provides the client's connecting IP in CF-Connecting-IP
  const clientIp = request.headers.get('CF-Connecting-IP');
  if (clientIp) {
    reqHeaders.set('X-Forwarded-For', clientIp);
  }

  // Handle request body for mutations (POST, PUT, PATCH, DELETE)
  const isBodyAllowed = !['GET', 'HEAD'].includes(request.method);
  const body = isBodyAllowed ? request.body : undefined;

  try {
    const backendResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: reqHeaders,
      body,
      // @ts-expect-error duplex required in Node/Edge streaming fetch with request body
      duplex: isBodyAllowed ? 'half' : undefined
    });

    // Create mutable response headers
    const resHeaders = new Headers(backendResponse.headers);

    // Ensure CORS headers don't conflict with proxying
    resHeaders.delete('Access-Control-Allow-Origin');
    resHeaders.delete('Access-Control-Allow-Credentials');

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: resHeaders
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: {
          code: 'PROXY_BACKEND_UNAVAILABLE',
          message: 'Unable to connect to the backend server. The server may be waking up from cold standby.',
          details: err?.message
        }
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
