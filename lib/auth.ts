import { Role } from '@/types'

export interface Session {
  username: string
  role: Role
}

const COOKIE_NAME = 'session'

/** Read the session cookie on the client side. Returns null if not logged in. */
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`))
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match[1])) as Session
  } catch {
    return null
  }
}

/** Clear the session cookie on the client side. */
export function clearSession() {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}
