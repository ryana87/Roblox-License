'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PointsDisplay from '@/components/PointsDisplay'
import { subscribeToPoints, subscribeToClaims } from '@/lib/firestore'
import { PointsConfig, Claim } from '@/types'

function statusBadge(status: Claim['status']) {
  if (status === 'pending') return 'bg-yellow-100 text-yellow-700'
  if (status === 'approved') return 'bg-green-100 text-green-700'
  return 'bg-red-100 text-red-600'
}

export default function ChildDashboard() {
  const [points, setPoints] = useState<PointsConfig>({ currentPoints: 0, totalEarned: 0, lastUpdated: new Date() })
  const [claims, setClaims] = useState<Claim[]>([])

  useEffect(() => {
    const unsub1 = subscribeToPoints(setPoints)
    const unsub2 = subscribeToClaims(setClaims)
    return () => { unsub1(); unsub2() }
  }, [])

  const recentClaims = claims.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Big points display */}
      <div className="bg-white rounded-3xl shadow-sm border p-8 text-center">
        <p className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">Your Points</p>
        <PointsDisplay points={points.currentPoints} />
        <div className="mt-5">
          <Link
            href="/child/rewards"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Spend Points
          </Link>
        </div>
      </div>

      {/* Recent claims */}
      {recentClaims.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h2 className="font-semibold text-gray-900 mb-3">My Recent Claims</h2>
          <ul className="space-y-2">
            {recentClaims.map((claim) => (
              <li key={claim.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{claim.rewardName}</div>
                  <div className="text-xs text-gray-400">{claim.pointsSpent} pts</div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusBadge(claim.status)}`}>
                  {claim.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
