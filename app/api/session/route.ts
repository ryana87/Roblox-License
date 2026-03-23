import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { Role } from '@/types'

// Users are defined in environment variables — no database needed.
// Set these in .env.local (dev) or Vercel environment variables (prod).
interface UserConfig {
  password: string
  role: Role
}

function getUsers(): Record<string, UserConfig> {
  return {
    mum: { password: process.env.MUM_PASSWORD ?? '', role: 'parent' },
    dad: { password: process.env.DAD_PASSWORD ?? '', role: 'parent' },
    son: { password: process.env.SON_PASSWORD ?? '', role: 'child' },
  }
}

// POST /api/session — check credentials, set session cookie
export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  if (!username || !password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
  }

  const users = getUsers()
  const user = users[username.toLowerCase().trim()]

  if (!user || user.password === '' || user.password !== password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const sessionValue = encodeURIComponent(
    JSON.stringify({ username: username.toLowerCase().trim(), role: user.role })
  )

  const cookieStore = await cookies()
  // Not httpOnly — AuthContext reads this client-side to get username + role.
  // This is intentional for a family app with no sensitive personal data.
  cookieStore.set('session', sessionValue, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days — stay logged in on the shared devices
    path: '/',
  })

  return NextResponse.json({ ok: true, role: user.role })
}

// DELETE /api/session — sign out
export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  return NextResponse.json({ ok: true })
}
