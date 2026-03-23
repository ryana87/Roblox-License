export type Role = 'parent' | 'child'

export interface PointsConfig {
  currentPoints: number
  totalEarned: number
  lastUpdated: Date
}

export interface Transaction {
  id: string
  type: 'earn' | 'lose' | 'spend'
  amount: number
  reason: string
  createdBy: string
  createdAt: Date
}

export interface Reward {
  id: string
  name: string
  description: string
  cost: number
  available: boolean
  createdAt: Date
}

export interface Claim {
  id: string
  rewardId: string
  rewardName: string
  claimedAt: Date
  status: 'pending' | 'approved' | 'rejected'
  pointsSpent: number
}
