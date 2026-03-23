'use client'

import { useEffect, useState } from 'react'
import RewardCard from '@/components/RewardCard'
import { subscribeToRewards, createReward, updateReward, deleteReward } from '@/lib/firestore'
import { Reward } from '@/types'

interface FormState {
  name: string
  description: string
  cost: string
}

const EMPTY_FORM: FormState = { name: '', description: '', cost: '50' }

export default function ParentRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [editing, setEditing] = useState<Reward | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    return subscribeToRewards(setRewards)
  }, [])

  function startEdit(reward: Reward) {
    setEditing(reward)
    setForm({ name: reward.name, description: reward.description, cost: String(reward.cost) })
    setShowForm(true)
  }

  function cancelForm() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cost = parseInt(form.cost, 10)
    if (!form.name.trim() || !cost || cost <= 0) return

    setSubmitting(true)
    try {
      if (editing) {
        await updateReward(editing.id, { name: form.name.trim(), description: form.description.trim(), cost })
      } else {
        await createReward(form.name.trim(), form.description.trim(), cost)
      }
      cancelForm()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this reward?')) return
    await deleteReward(id)
  }

  async function handleToggle(id: string, available: boolean) {
    await updateReward(id, { available })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Rewards</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + New Reward
          </button>
        )}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <h2 className="font-semibold text-gray-900 mb-4">
            {editing ? 'Edit Reward' : 'New Reward'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                required
                type="text"
                placeholder="e.g. 1 hour Roblox"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Extra details..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost (points)</label>
              <input
                required
                type="number"
                min="1"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                {submitting ? 'Saving...' : editing ? 'Save Changes' : 'Create Reward'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rewards list */}
      {rewards.length === 0 ? (
        <div className="text-center text-gray-400 py-12 text-sm">
          No rewards yet. Add one above.
        </div>
      ) : (
        <div className="grid gap-3">
          {rewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              mode="parent"
              onEdit={startEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
