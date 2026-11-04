/**
 * Production Insaan API Client
 * - In-memory access token storage (never localStorage)
 * - Single in-flight silent refresh promise on 401
 * - Automatic CSRF protection header (X-Requested-With)
 * - Credentials included for first-party httpOnly cookie transport
 * - Cold-start retry logic for free tier cloud hosting
 */

class ApiClient {
  constructor() {
    this.accessToken = null;
    this.refreshPromise = null;
    this.onAuthFailure = null;
    this.onServerWakeup = null;
  }

  setAccessToken(token) {
    this.accessToken = token;
  }

  getAccessToken() {
    return this.accessToken;
  }

  setAuthFailureHandler(handler) {
    this.onAuthFailure = handler;
  }

  setServerWakeupHandler(handler) {
    this.onServerWakeup = handler;
  }

  async request(path, options = {}, isRetry = false) {
    const url = path.startsWith('http') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;

    const headers = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(options.headers || {})
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const fetchOptions = {
      ...options,
      headers,
      credentials: 'include' // Sends httpOnly cookies
    };

    // Cold-start detection timer
    let wakeTimer = null;
    if (this.onServerWakeup) {
      wakeTimer = setTimeout(() => {
        this.onServerWakeup(true);
      }, 2500);
    }

    let response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (networkErr) {
      if (wakeTimer) clearTimeout(wakeTimer);
      if (this.onServerWakeup) this.onServerWakeup(false);

      // Retry once after 3 seconds if cold start caused timeout
      if (!isRetry) {
        if (this.onServerWakeup) this.onServerWakeup(true);
        await new Promise(r => setTimeout(r, 3000));
        return this.request(path, options, true);
      }
      throw new Error('Unable to connect to Insaan cloud. Please check your network connection.');
    } finally {
      if (wakeTimer) clearTimeout(wakeTimer);
      if (this.onServerWakeup) this.onServerWakeup(false);
    }

    // Handle 401 Unauthorized -> Attempt Silent Refresh
    if (response.status === 401 && !isRetry && !path.includes('/auth/login') && !path.includes('/auth/signup') && !path.includes('/auth/refresh')) {
      const refreshed = await this.silentRefresh();
      if (refreshed) {
        return this.request(path, options, true);
      } else {
        if (this.onAuthFailure) this.onAuthFailure();
      }
    }

    // Parse Response
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMsg = data?.error?.message || response.statusText || 'Request failed';
      const errorObj = new Error(errorMsg);
      errorObj.status = response.status;
      errorObj.code = data?.error?.code || 'API_ERROR';
      errorObj.details = data?.error?.details;
      throw errorObj;
    }

    return data;
  }

  // Silent refresh with in-flight promise deduplication
  async silentRefresh() {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'include'
        });

        if (!res.ok) {
          this.accessToken = null;
          return false;
        }

        const data = await res.json();
        if (data.accessToken) {
          this.accessToken = data.accessToken;
          return true;
        }
        return false;
      } catch (err) {
        this.accessToken = null;
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  get(path, options = {}) {
    return this.request(path, { ...options, method: 'GET' });
  }

  post(path, body, options = {}) {
    return this.request(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  delete(path, options = {}) {
    return this.request(path, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
