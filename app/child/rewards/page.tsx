'use client'

import { useEffect, useState } from 'react'
import RewardCard from '@/components/RewardCard'
import PointsDisplay from '@/components/PointsDisplay'
import { subscribeToRewards, subscribeToPoints, claimReward } from '@/lib/firestore'
import { useAuth } from '@/lib/AuthContext'
import { Reward, PointsConfig } from '@/types'

export default function ChildRewardsPage() {
  const { session } = useAuth()
  const [rewards, setRewards] = useState<Reward[]>([])
  const [points, setPoints] = useState<PointsConfig>({ currentPoints: 0, totalEarned: 0, lastUpdated: new Date() })
  const [claiming, setClaiming] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    const unsub1 = subscribeToRewards(setRewards)
    const unsub2 = subscribeToPoints(setPoints)
    return () => { unsub1(); unsub2() }
  }, [])

  async function handleClaim(reward: Reward) {
    if (claiming) return
    setClaiming(true)
    setFeedback(null)
    try {
      await claimReward(reward, session?.username ?? 'child')
      setFeedback(`You claimed "${reward.name}"! Waiting for approval.`)
      setTimeout(() => setFeedback(null), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setFeedback(msg === 'Not enough points' ? "You don't have enough points for that." : 'Could not claim reward. Try again.')
      setTimeout(() => setFeedback(null), 3000)
    } finally {
      setClaiming(false)
    }
  }

  const availableRewards = rewards.filter((r) => r.available)

  return (
    <div className="space-y-5">
      {/* Points balance */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">Your balance</span>
        <PointsDisplay points={points.currentPoints} size="sm" />
      </div>

      {feedback && (
        <div className="bg-indigo-50 text-indigo-800 text-sm font-medium px-4 py-3 rounded-xl">
          {feedback}
        </div>
      )}

      <h1 className="text-xl font-bold text-gray-900">Available Rewards</h1>

      {availableRewards.length === 0 ? (
        <div className="text-center text-gray-400 py-12 text-sm">
          No rewards available right now. Check back later!
        </div>
      ) : (
        <div className="grid gap-3">
          {availableRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              mode="child"
              currentPoints={points.currentPoints}
              onClaim={handleClaim}
            />
          ))}
        </div>
      )}
    </div>
  )
}
