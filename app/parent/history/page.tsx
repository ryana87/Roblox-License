'use client'

import { useEffect, useState } from 'react'
import TransactionList from '@/components/TransactionList'
import { subscribeToTransactions } from '@/lib/firestore'
import { Transaction } from '@/types'

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    return subscribeToTransactions(setTransactions, 100)
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Transaction History</h1>
      <div className="bg-white rounded-2xl p-5 shadow-sm border">
        <TransactionList transactions={transactions} />
      </div>
    </div>
  )
}
