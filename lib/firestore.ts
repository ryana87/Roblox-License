import {
  doc,
  collection,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
  Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import { PointsConfig, Transaction, Reward, Claim } from '@/types'

// ─── Points ──────────────────────────────────────────────────────────────────

const POINTS_DOC = doc(db, 'config', 'points')

export async function getPoints(): Promise<PointsConfig> {
  const snap = await getDoc(POINTS_DOC)
  if (!snap.exists()) {
    // Bootstrap the document on first run
    return { currentPoints: 0, totalEarned: 0, lastUpdated: new Date() }
  }
  const d = snap.data()
  return {
    currentPoints: d.currentPoints ?? 0,
    totalEarned: d.totalEarned ?? 0,
    lastUpdated: d.lastUpdated?.toDate() ?? new Date(),
  }
}

export function subscribeToPoints(
  callback: (points: PointsConfig) => void
): Unsubscribe {
  return onSnapshot(POINTS_DOC, (snap) => {
    if (!snap.exists()) {
      callback({ currentPoints: 0, totalEarned: 0, lastUpdated: new Date() })
      return
    }
    const d = snap.data()
    callback({
      currentPoints: d.currentPoints ?? 0,
      totalEarned: d.totalEarned ?? 0,
      lastUpdated: d.lastUpdated?.toDate() ?? new Date(),
    })
  })
}

// ─── Transactions ─────────────────────────────────────────────────────────────

const txCol = () => collection(db, 'transactions')

/**
 * Add/remove points atomically: writes a transaction record AND updates the
 * points balance in a single Firestore transaction so they never drift apart.
 */
export async function addTransaction(
  type: 'earn' | 'lose',
  amount: number,
  reason: string,
  createdBy: string
): Promise<void> {
  await runTransaction(db, async (tx) => {
    const pointsSnap = await tx.get(POINTS_DOC)
    const current = pointsSnap.exists() ? (pointsSnap.data().currentPoints ?? 0) : 0
    const totalEarned = pointsSnap.exists() ? (pointsSnap.data().totalEarned ?? 0) : 0

    const delta = type === 'earn' ? amount : -amount
    const newBalance = Math.max(0, current + delta)
    const newTotalEarned = type === 'earn' ? totalEarned + amount : totalEarned

    tx.set(POINTS_DOC, {
      currentPoints: newBalance,
      totalEarned: newTotalEarned,
      lastUpdated: serverTimestamp(),
    })

    const txRef = doc(txCol())
    tx.set(txRef, {
      type,
      amount,
      reason,
      createdBy,
      createdAt: serverTimestamp(),
    })
  })
}

export function subscribeToTransactions(
  callback: (transactions: Transaction[]) => void,
  maxItems = 50
): Unsubscribe {
  const q = query(txCol(), orderBy('createdAt', 'desc'), limit(maxItems))
  return onSnapshot(q, (snap) => {
    const items: Transaction[] = snap.docs.map((d) => ({
      id: d.id,
      type: d.data().type,
      amount: d.data().amount,
      reason: d.data().reason,
      createdBy: d.data().createdBy,
      createdAt: d.data().createdAt?.toDate() ?? new Date(),
    }))
    callback(items)
  })
}

// ─── Rewards ──────────────────────────────────────────────────────────────────

const rewardsCol = () => collection(db, 'rewards')

export async function getRewards(): Promise<Reward[]> {
  const snap = await getDocs(rewardsCol())
  return snap.docs.map((d) => ({
    id: d.id,
    name: d.data().name,
    description: d.data().description,
    cost: d.data().cost,
    available: d.data().available,
    createdAt: d.data().createdAt?.toDate() ?? new Date(),
  }))
}

export function subscribeToRewards(
  callback: (rewards: Reward[]) => void
): Unsubscribe {
  const q = query(rewardsCol(), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const items: Reward[] = snap.docs.map((d) => ({
      id: d.id,
      name: d.data().name,
      description: d.data().description,
      cost: d.data().cost,
      available: d.data().available,
      createdAt: d.data().createdAt?.toDate() ?? new Date(),
    }))
    callback(items)
  })
}

export async function createReward(
  name: string,
  description: string,
  cost: number
): Promise<void> {
  await addDoc(rewardsCol(), {
    name,
    description,
    cost,
    available: true,
    createdAt: serverTimestamp(),
  })
}

export async function updateReward(
  id: string,
  updates: Partial<Pick<Reward, 'name' | 'description' | 'cost' | 'available'>>
): Promise<void> {
  await updateDoc(doc(db, 'rewards', id), updates)
}

export async function deleteReward(id: string): Promise<void> {
  await deleteDoc(doc(db, 'rewards', id))
}

// ─── Claims ───────────────────────────────────────────────────────────────────

const claimsCol = () => collection(db, 'claims')

/**
 * Child claims a reward: deducts points atomically and writes a pending claim.
 */
export async function claimReward(
  reward: Reward,
  claimedBy: string
): Promise<void> {
  await runTransaction(db, async (tx) => {
    const pointsSnap = await tx.get(POINTS_DOC)
    const current = pointsSnap.exists() ? (pointsSnap.data().currentPoints ?? 0) : 0

    if (current < reward.cost) {
      throw new Error('Not enough points')
    }

    tx.set(POINTS_DOC, {
      currentPoints: current - reward.cost,
      totalEarned: pointsSnap.data()?.totalEarned ?? 0,
      lastUpdated: serverTimestamp(),
    })

    const claimRef = doc(claimsCol())
    tx.set(claimRef, {
      rewardId: reward.id,
      rewardName: reward.name,
      claimedBy,
      claimedAt: serverTimestamp(),
      status: 'pending',
      pointsSpent: reward.cost,
    })

    // Also write a 'spend' transaction for the history log
    const txRef = doc(txCol())
    tx.set(txRef, {
      type: 'spend',
      amount: reward.cost,
      reason: `Claimed reward: ${reward.name}`,
      createdBy: claimedBy,
      createdAt: serverTimestamp(),
    })
  })
}

export function subscribeToClaims(
  callback: (claims: Claim[]) => void
): Unsubscribe {
  const q = query(claimsCol(), orderBy('claimedAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const items: Claim[] = snap.docs.map((d) => ({
      id: d.id,
      rewardId: d.data().rewardId,
      rewardName: d.data().rewardName,
      claimedAt: d.data().claimedAt?.toDate() ?? new Date(),
      status: d.data().status,
      pointsSpent: d.data().pointsSpent,
    }))
    callback(items)
  })
}

export async function updateClaimStatus(
  claimId: string,
  status: 'approved' | 'rejected'
): Promise<void> {
  await updateDoc(doc(db, 'claims', claimId), { status })
}
