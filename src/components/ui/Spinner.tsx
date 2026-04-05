'use client'

import React from 'react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'white' | 'blue' | 'slate'
}

export function Spinner({ size = 'md', color = 'blue' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  }

  const colorClasses = {
    white: 'border-white/30 border-t-white',
    blue: 'border-blue-100 border-t-blue-600',
    slate: 'border-slate-200 border-t-slate-600',
  }

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`} />
  )
}

export function FullPageLoading() {
  return (
    <div className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-slate-600 font-bold animate-pulse">Cargando...</p>
    </div>
  )
}
