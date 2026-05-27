import type { ChildProfile } from '@/types/database.types';

const TOKEN_KEY = 'childSessionToken';
const PROFILE_KEY = 'childProfile';

export const CHILD_SESSION_EVENT = 'edu-child-session-changed';

export function getChildSessionProfile(): ChildProfile | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!token || !raw) return null;
  try {
    const p = JSON.parse(raw) as ChildProfile;
    if (p?.id) return p;
  } catch {
    /* ignore */
  }
  return null;
}

export function hasChildSession(): boolean {
  return getChildSessionProfile() !== null;
}

export function notifyChildSessionChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CHILD_SESSION_EVENT));
}
