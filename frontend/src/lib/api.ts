const BASE_URL = '/api';

export class ApiError extends Error {
  constructor(public status: number, public message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWrapper<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    throw new ApiError(
      response.status,
      errorData?.error || errorData?.message || response.statusText,
      errorData
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  // Allow native Blob responses for CSV exports
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return response.blob() as any;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => fetchWrapper<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, data: any, options?: RequestInit) => fetchWrapper<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: any, options?: RequestInit) => fetchWrapper<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string, options?: RequestInit) => fetchWrapper<T>(endpoint, { ...options, method: 'DELETE' }),
};
