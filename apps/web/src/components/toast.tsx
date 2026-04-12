'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  duration?: number
}

export function Toast({ message, type, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  if (!isVisible) return null

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500'

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform`}>
      <div className="flex items-center">
        <span className="mr-2">{type === 'success' ? '✓' : '✕'}</span>
        <span>{message}</span>
      </div>
    </div>
  )
}
