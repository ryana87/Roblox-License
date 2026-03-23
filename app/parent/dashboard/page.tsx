'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PointsDisplay from '@/components/PointsDisplay'
import TransactionList from '@/components/TransactionList'
import { subscribeToPoints, subscribeToTransactions, subscribeToClaims, updateClaimStatus } from '@/lib/firestore'
import { PointsConfig, Transaction, Claim } from '@/types'

export default function ParentDashboard() {
  const [points, setPoints] = useState<PointsConfig>({ currentPoints: 0, totalEarned: 0, lastUpdated: new Date() })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [claims, setClaims] = useState<Claim[]>([])

  useEffect(() => {
    const unsub1 = subscribeToPoints(setPoints)
    const unsub2 = subscribeToTransactions(setTransactions, 10)
    const unsub3 = subscribeToClaims(setClaims)
    return () => { unsub1(); unsub2(); unsub3() }
  }, [])

  const pendingClaims = claims.filter((c) => c.status === 'pending')

  async function handleClaim(claimId: string, action: 'approved' | 'rejected') {
    await updateClaimStatus(claimId, action)
  }

  return (
    <div className="space-y-6">
      {/* Points overview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
        <PointsDisplay points={points.currentPoints} />
        <div className="mt-3 text-sm text-gray-500">
          {points.totalEarned.toLocaleString()} total earned all-time
        </div>
        <div className="mt-4 flex gap-3 justify-center">
          <Link
            href="/parent/points"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            Add / Remove Points
          </Link>
        </div>
      </div>

      {/* Pending reward claims */}
      {pendingClaims.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h2 className="font-semibold text-gray-900 mb-3">
            Pending Claims ({pendingClaims.length})
          </h2>
          <ul className="space-y-3">
            {pendingClaims.map((claim) => (
              <li key={claim.id} className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">{claim.rewardName}</div>
                  <div className="text-xs text-gray-400">{claim.pointsSpent} pts spent</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleClaim(claim.id, 'approved')}
                    className="text-xs bg-green-100 text-green-700 hover:bg-green-200 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleClaim(claim.id, 'rejected')}
                    className="text-xs bg-red-100 text-red-600 hover:bg-red-200 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          <Link href="/parent/history" className="text-sm text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        <TransactionList transactions={transactions} />
      </div>
    </div>
  )
}
