'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

export default function RootPage() {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!session) {
      router.replace('/login')
    } else if (session.role === 'parent') {
      router.replace('/parent/dashboard')
    } else if (session.role === 'child') {
      router.replace('/child/dashboard')
    } else {
      router.replace('/login')
    }
  }, [session, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )
}
