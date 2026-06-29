import type { ApiErrorResponse } from '@evoyamwana/shared';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
export { API_URL };

export class ApiClientError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
  }
}

const getStoredToken = () => {
  if (typeof globalThis.localStorage === 'undefined') {
    return null;
  }

  return globalThis.localStorage.getItem('evoyamwana.token');
};

export const apiClient = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getStoredToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      },
      ...options
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`API unavailable at ${API_URL}. Start the API server and try again.`);
    }

    throw error;
  }

  if (!response.ok) {
    const error = (await response.json().catch(() => ({
      message: 'Request failed',
      statusCode: response.status
    }))) as ApiErrorResponse;
    throw new ApiClientError(error.message, response.status);
  }

  return response.json() as Promise<T>;
};
