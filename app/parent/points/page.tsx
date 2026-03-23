'use client'

import { useEffect, useState } from 'react'
import PointsDisplay from '@/components/PointsDisplay'
import { subscribeToPoints, addTransaction } from '@/lib/firestore'
import { useAuth } from '@/lib/AuthContext'
import { PointsConfig } from '@/types'

const QUICK_REASONS = [
  'Tidied bedroom',
  'Did homework',
  'Helped with chores',
  'Good behaviour',
  'Did reading',
  'Was kind to others',
]

export default function PointsPage() {
  const { session } = useAuth()
  const [points, setPoints] = useState<PointsConfig>({ currentPoints: 0, totalEarned: 0, lastUpdated: new Date() })
  const [amount, setAmount] = useState('10')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'earn' | 'lose'; amount: number } | null>(null)

  useEffect(() => {
    return subscribeToPoints(setPoints)
  }, [])

  async function submit(type: 'earn' | 'lose') {
    const num = parseInt(amount, 10)
    if (!num || num <= 0 || !reason.trim()) return

    setSubmitting(true)
    try {
      await addTransaction(type, num, reason.trim(), session?.username ?? 'parent')
      setFeedback({ type, amount: num })
      setReason('')
      setTimeout(() => setFeedback(null), 2500)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
        <PointsDisplay points={points.currentPoints} />
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border space-y-4">
        <h2 className="font-semibold text-gray-900">Add or Remove Points</h2>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            min="1"
            max="9999"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <input
            type="text"
            placeholder="e.g. Tidied bedroom"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {/* Quick-select reasons */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {QUICK_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full transition-colors"
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => submit('earn')}
            disabled={submitting || !reason.trim() || !amount}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            + Earn Points
          </button>
          <button
            onClick={() => submit('lose')}
            disabled={submitting || !reason.trim() || !amount}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            - Lose Points
          </button>
        </div>

        {/* Success feedback */}
        {feedback && (
          <div className={`text-center text-sm font-semibold py-2 rounded-lg ${
            feedback.type === 'earn' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {feedback.type === 'earn' ? '+' : '-'}{feedback.amount} points recorded!
          </div>
        )}
      </div>
    </div>
  )
}
