// Local admin authentication — no Firebase Auth dependency
// Credentials stored in localStorage, password changeable from dashboard

const STORAGE_KEY = 'lucky-club-admin-credentials'
const SESSION_KEY = 'lucky-club-admin-session'

// Default credentials (used only if nothing stored yet)
const DEFAULT_EMAIL    = import.meta.env.VITE_ADMIN_EMAIL    || 'admin@luckyclub.com'
const DEFAULT_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin1234'

interface AdminCredentials {
  email: string
  passwordHash: string  // simple hash — not crypto-grade, just obfuscation
}

interface AdminSession {
  email: string
  loggedInAt: number
  expiresAt: number   // 8-hour session
}

// ─── Simple hash (obfuscation, not security) ──────────────────────────────────
function simpleHash(str: string): string {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
    hash = hash >>> 0  // keep unsigned 32-bit
  }
  return hash.toString(36)
}

// ─── Credential management ────────────────────────────────────────────────────
function getCredentials(): AdminCredentials {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AdminCredentials
  } catch { /* corrupted — fall through to default */ }
  // First run: persist defaults
  const creds: AdminCredentials = {
    email: DEFAULT_EMAIL,
    passwordHash: simpleHash(DEFAULT_PASSWORD),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(creds))
  return creds
}

function saveCredentials(creds: AdminCredentials): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(creds))
}

// ─── Session management ───────────────────────────────────────────────────────
function createSession(email: string): void {
  const now = Date.now()
  const session: AdminSession = {
    email,
    loggedInAt: now,
    expiresAt: now + 8 * 60 * 60 * 1000,  // 8 hours
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function destroySession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

function getSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as AdminSession
    if (Date.now() > session.expiresAt) {
      destroySession()
      return null
    }
    return session
  } catch {
    return null
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Returns the logged-in admin email, or null if not logged in */
export function getAdminSession(): string | null {
  return getSession()?.email ?? null
}

/** Attempt login — returns null on success, error string on failure */
export function adminLogin(email: string, password: string): string | null {
  const creds = getCredentials()
  const emailMatch    = email.trim().toLowerCase() === creds.email.toLowerCase()
  const passwordMatch = simpleHash(password) === creds.passwordHash
  if (!emailMatch || !passwordMatch) {
    return '이메일 또는 비밀번호가 올바르지 않습니다'
  }
  createSession(creds.email)
  return null  // success
}

/** Logout */
export function adminLogout(): void {
  destroySession()
}

/** Change password — requires current password for verification */
export function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): string | null {
  const creds = getCredentials()
  if (simpleHash(currentPassword) !== creds.passwordHash) {
    return '현재 비밀번호가 올바르지 않습니다'
  }
  if (newPassword.length < 6) {
    return '새 비밀번호는 6자 이상이어야 합니다'
  }
  saveCredentials({ ...creds, passwordHash: simpleHash(newPassword) })
  return null  // success
}

/** Change email — requires current password for verification */
export function changeAdminEmail(
  currentPassword: string,
  newEmail: string
): string | null {
  const creds = getCredentials()
  if (simpleHash(currentPassword) !== creds.passwordHash) {
    return '현재 비밀번호가 올바르지 않습니다'
  }
  if (!newEmail.includes('@')) {
    return '올바른 이메일 형식이 아닙니다'
  }
  saveCredentials({ ...creds, email: newEmail.trim().toLowerCase() })
  return null  // success
}

/** Get current admin email (for display) */
export function getAdminEmail(): string {
  return getCredentials().email
}

/** Default credentials hint for dev display */
export const DEFAULT_CREDENTIALS = {
  email:    DEFAULT_EMAIL,
  password: DEFAULT_PASSWORD,
}
