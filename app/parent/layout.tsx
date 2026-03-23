'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { clearSession } from '@/lib/auth'

const navItems = [
  { href: '/parent/dashboard', label: 'Dashboard' },
  { href: '/parent/points', label: 'Points' },
  { href: '/parent/rewards', label: 'Rewards' },
  { href: '/parent/history', label: 'History' },
]

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && session?.role !== 'parent') {
      router.replace('/login')
    }
  }, [session, loading, router])

  async function handleSignOut() {
    clearSession()
    await fetch('/api/session', { method: 'DELETE' })
    router.replace('/login')
  }

  if (loading || !session) return null

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-lg mr-2">⭐</span>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  )
}
