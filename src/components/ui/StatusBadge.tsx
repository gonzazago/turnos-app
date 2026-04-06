import React from 'react'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

type StatusType = 'error' | 'success' | 'info' | 'warning'

interface StatusBadgeProps {
  type: StatusType
  children: React.ReactNode
  className?: string
}

export function StatusBadge({ type, children, className = '' }: StatusBadgeProps) {
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-100',
    success: 'bg-green-50 text-green-700 border-green-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    warning: 'bg-orange-50 text-orange-700 border-orange-100'
  }

  const icons = {
    error: <AlertCircle className="w-3 h-3" />,
    success: <CheckCircle className="w-3 h-3" />,
    info: <Info className="w-3 h-3" />,
    warning: <AlertCircle className="w-3 h-3" />
  }

  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${styles[type]} ${className}`}>
      {icons[type]}
      {children}
    </span>
  )
}
