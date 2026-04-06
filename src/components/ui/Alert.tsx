import React from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

type AlertVariant = 'error' | 'success' | 'info' | 'warning'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  className?: string
  icon?: boolean
}

export function Alert({ 
  variant = 'info', 
  title, 
  children, 
  className = '',
  icon = true
}: AlertProps) {
  const styles = {
    error: 'bg-red-50 text-red-700 border-red-100',
    success: 'bg-green-50 text-green-700 border-green-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    warning: 'bg-orange-50 text-orange-700 border-orange-100'
  }

  const icons = {
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    success: <CheckCircle className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 flex-shrink-0" />
  }

  return (
    <div className={`p-4 rounded-xl flex items-start gap-3 border ${styles[variant]} ${className}`} role="alert">
      {icon && icons[variant]}
      <div className="flex flex-col gap-1">
        {title && <span className="font-bold text-sm leading-tight">{title}</span>}
        <div className="text-sm font-medium leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
