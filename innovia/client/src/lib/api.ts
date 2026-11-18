const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('innovia_access_token');
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If token expired, clear and notify or redirect
    const data = await response.json().catch(() => ({}));
    if (data.code === 'TOKEN_EXPIRED') {
      localStorage.removeItem('innovia_access_token');
      localStorage.removeItem('innovia_user');
      window.dispatchEvent(new Event('auth_expired'));
    }
    throw new ApiError(401, data.error || 'Authentication required', data);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.error || response.statusText, errorData);
  }

  // If blob/csv
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return (await response.text()) as any;
  }

  return response.json();
}
