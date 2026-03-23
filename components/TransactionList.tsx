import { Transaction } from '@/types'

interface Props {
  transactions: Transaction[]
}

const typeConfig = {
  earn: { label: 'Earned', color: 'text-green-600', bg: 'bg-green-50', sign: '+' },
  lose: { label: 'Lost', color: 'text-red-600', bg: 'bg-red-50', sign: '-' },
  spend: { label: 'Spent', color: 'text-orange-600', bg: 'bg-orange-50', sign: '-' },
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export default function TransactionList({ transactions }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8 text-sm">
        No transactions yet
      </div>
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {transactions.map((tx) => {
        const cfg = typeConfig[tx.type]
        return (
          <li key={tx.id} className="flex items-center justify-between py-3 px-1">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
              <span className="text-sm text-gray-700">{tx.reason}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-sm font-bold ${cfg.color}`}>
                {cfg.sign}{tx.amount}
              </span>
              <span className="text-xs text-gray-400">{timeAgo(tx.createdAt)}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
