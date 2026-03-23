'use client'

import { Reward } from '@/types'

interface ParentProps {
  reward: Reward
  mode: 'parent'
  onEdit: (reward: Reward) => void
  onDelete: (id: string) => void
  onToggle: (id: string, available: boolean) => void
}

interface ChildProps {
  reward: Reward
  mode: 'child'
  currentPoints: number
  onClaim: (reward: Reward) => void
}

type Props = ParentProps | ChildProps

export default function RewardCard(props: Props) {
  const { reward } = props
  const canAfford = props.mode === 'child' ? props.currentPoints >= reward.cost : true

  return (
    <div className={`bg-white rounded-xl border p-4 flex flex-col gap-3 transition-opacity ${!reward.available ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">{reward.name}</h3>
          {reward.description && (
            <p className="text-sm text-gray-500 mt-0.5">{reward.description}</p>
          )}
        </div>
        <div className="shrink-0 bg-indigo-100 text-indigo-700 font-bold text-sm px-2.5 py-1 rounded-full">
          {reward.cost} pts
        </div>
      </div>

      {props.mode === 'parent' && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => props.onToggle(reward.id, !reward.available)}
            className="flex-1 text-sm border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50 transition-colors"
          >
            {reward.available ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={() => props.onEdit(reward)}
            className="flex-1 text-sm border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => props.onDelete(reward.id)}
            className="flex-1 text-sm border border-red-200 text-red-600 rounded-lg py-1.5 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      )}

      {props.mode === 'child' && reward.available && (
        <button
          onClick={() => props.onClaim(reward)}
          disabled={!canAfford}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
        >
          {canAfford ? 'Claim reward' : `Need ${reward.cost - props.currentPoints} more pts`}
        </button>
      )}

      {props.mode === 'child' && !reward.available && (
        <div className="text-center text-sm text-gray-400">Not available</div>
      )}
    </div>
  )
}
