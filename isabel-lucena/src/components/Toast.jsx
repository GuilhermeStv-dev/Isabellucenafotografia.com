import { useState, useEffect } from 'react'
import { Check, AlertCircle, X } from 'lucide-react'

export function Toast({ message, type = 'success', duration = 4000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = {
    success: 'bg-green-500/20 border-green-500/50',
    error: 'bg-red-500/20 border-red-500/50',
    info: 'bg-gold/20 border-gold/50'
  }[type]

  const textColor = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-gold'
  }[type]

  const Icon = {
    success: Check,
    error: AlertCircle,
    info: AlertCircle
  }[type]

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border ${bgColor} backdrop-blur-sm`}>
      <Icon size={20} className={textColor} />
      <p className={`font-body text-sm ${textColor}`}>{message}</p>
      <button
        onClick={onClose}
        className={`ml-2 ${textColor} hover:opacity-70 transition-opacity`}
      >
        <X size={16} />
      </button>
    </div>
  )
}

export default Toast
