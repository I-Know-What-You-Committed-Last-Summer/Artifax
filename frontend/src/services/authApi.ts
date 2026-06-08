import axios, { AxiosResponse } from 'axios';
import apiClient from './apiClient';

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

async function withAxios<T>(request: Promise<AxiosResponse<T>>): Promise<T> {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const responseData = error.response?.data;
      const message =
        typeof responseData === 'string'
          ? responseData
          : (responseData as { message?: string } | undefined)?.message || `Request failed: ${status ?? 'unknown'}`;

      const err = new Error(message);
      (err as { status?: number }).status = status;
      throw err;
    }

    throw error;
  }
}

export function loginEmployee(payload: LoginRequest): Promise<LoginEmployeeResponse> {
  return withAxios<LoginEmployeeResponse>(
    apiClient.post('/User/employees/login', {
      email: payload.email,
      password: payload.password,
    }),
  );
}

export function getCurrentUserFromSession(): Promise<CurrentUserResponse> {
  return withAxios<CurrentUserResponse>(apiClient.get('/User/me'));
}
