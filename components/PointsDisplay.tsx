'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  points: number
  size?: 'sm' | 'lg'
}

export default function PointsDisplay({ points, size = 'lg' }: Props) {
  const [displayed, setDisplayed] = useState(points)
  const prevRef = useRef(points)

  // Animate count-up/down when points change
  useEffect(() => {
    const start = prevRef.current
    const end = points
    if (start === end) return

    const diff = end - start
    const steps = Math.min(Math.abs(diff), 30)
    const stepSize = diff / steps
    let current = start
    let step = 0

    const interval = setInterval(() => {
      step++
      current += stepSize
      if (step >= steps) {
        setDisplayed(end)
        clearInterval(interval)
      } else {
        setDisplayed(Math.round(current))
      }
    }, 20)

    prevRef.current = end
    return () => clearInterval(interval)
  }, [points])

  if (size === 'sm') {
    return (
      <span className="font-bold text-indigo-600">
        {displayed.toLocaleString()} pts
      </span>
    )
  }

  return (
    <div className="text-center">
      <div className="text-7xl font-black text-indigo-600 tabular-nums leading-none">
        {displayed.toLocaleString()}
      </div>
      <div className="text-lg font-medium text-gray-500 mt-1">points</div>
    </div>
  )
}
