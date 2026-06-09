import { useEffect, useState } from 'react';

export type CurrentUser = {
  name: string;
  role: string;
  email?: string;
  employeeId?: number;
  branchId?: number;
  branchName?: string;
};

const CURRENT_USER_KEY = 'artifax.currentUser';
const CURRENT_USER_EVENT = 'artifax-current-user-changed';

function canUseWindow() {
  return typeof window !== 'undefined';
}

function readStoredUser(): CurrentUser | null {
  if (!canUseWindow()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(CURRENT_USER_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as CurrentUser;

    if (!parsedValue?.name || !parsedValue?.role) {
      return null;
    }

    return parsedValue;
  } catch {
    return null;
  }
}

export function getCurrentUser(): CurrentUser | null {
  return readStoredUser();
}

export function setCurrentUser(user: CurrentUser): void {
  if (!canUseWindow()) {
    return;
  }

  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent(CURRENT_USER_EVENT, { detail: user }));
}

export function clearCurrentUser(): void {
  if (!canUseWindow()) {
    return;
  }

  window.localStorage.removeItem(CURRENT_USER_KEY);
  window.dispatchEvent(new CustomEvent(CURRENT_USER_EVENT));
}

export function subscribeCurrentUser(listener: (user: CurrentUser | null) => void): () => void {
  if (!canUseWindow()) {
    return () => undefined;
  }

  const notify = () => listener(readStoredUser());

  window.addEventListener(CURRENT_USER_EVENT, notify);
  window.addEventListener('storage', notify);

  return () => {
    window.removeEventListener(CURRENT_USER_EVENT, notify);
    window.removeEventListener('storage', notify);
  };
}

export function useCurrentUser(): CurrentUser | null {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => getCurrentUser());

  useEffect(() => subscribeCurrentUser(setCurrentUser), []);

  return currentUser;
}