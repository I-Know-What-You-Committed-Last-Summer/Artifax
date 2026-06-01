const AUTH_TOKEN_KEY = 'artifax.authToken';

let memoryToken: string | null = null;

function canUseWindow() {
  return typeof window !== 'undefined';
}

export function setAuthToken(token: string): void {
  memoryToken = token;

  if (!canUseWindow()) {
    return;
  }

  window.sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  if (memoryToken) {
    return memoryToken;
  }

  if (!canUseWindow()) {
    return null;
  }

  const stored = window.sessionStorage.getItem(AUTH_TOKEN_KEY);
  memoryToken = stored;
  return stored;
}

export function clearAuthToken(): void {
  memoryToken = null;

  if (!canUseWindow()) {
    return;
  }

  window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
}
