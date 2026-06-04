const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5253/api';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginEmployeeResponse = {
  employeeId?: number;
  employeeEmail?: string;
  employeeName?: string;
  branchId?: number;
  accessToken?: string;
  token?: string;
};

export type CurrentUserResponse = {
  UserLevel: string;
  UserEmail?: string;
  Username?: string;
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    const err = new Error(message || `Request failed: ${response.status}`);
    // attach status for callers to discriminate errors
    (err as any).status = response.status;
    throw err;
  }

  return (await response.json()) as T;
}

export function loginEmployee(payload: LoginRequest): Promise<LoginEmployeeResponse> {
  return fetchJson<LoginEmployeeResponse>(`${API_BASE}/User/employees/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });
}

export function getCurrentUserFromSession(): Promise<CurrentUserResponse> {
  return fetchJson<CurrentUserResponse>(`${API_BASE}/User/me`);
}
