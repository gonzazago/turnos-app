import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  containerClassName?: string
  leftIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, containerClassName = '', leftIcon, ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-2 ${containerClassName}`}>
        {label && (
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            {...props}
            className={`w-full border rounded-xl py-3 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
              leftIcon ? 'pl-11 pr-4' : 'px-4'
            } ${
              error ? 'border-red-500 bg-red-50' : 'border-slate-300'
            } ${props.className || ''}`}
          />
        </div>
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
