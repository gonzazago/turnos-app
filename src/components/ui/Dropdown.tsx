'use client'

import React, { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Option {
  label: string
  value: string | number
}

interface DropdownProps {
  label?: string
  options: Option[]
  value: string | number
  onChange: (value: any) => void
  placeholder?: string
  className?: string
  containerClassName?: string
  name?: string
  disabled?: boolean
}

export function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  className,
  containerClassName,
  name,
  disabled,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const labelId = useId()

  const selectedOption = options.find((opt) => opt.value === value)

  // Refined useEffect for click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (val: string | number) => {
    onChange(val)
    setIsOpen(false)
  }

  return (
    <div className={cn('flex flex-col gap-2', containerClassName)} ref={dropdownRef}>
      {name && <input type="hidden" name={name} value={value} />}
      {label && (
        <label 
          id={labelId}
          className="text-sm font-bold text-slate-700 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? labelId : undefined}
          className={cn(
            'w-full flex items-center justify-between bg-white border border-slate-300 rounded-2xl py-3.5 px-4 text-left text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all hover:border-slate-400',
            isOpen && 'ring-2 ring-blue-500 border-blue-500',
            disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-50',
            className
          )}
        >
          <span className={cn(!selectedOption && 'text-slate-400')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn('w-5 h-5 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </button>

        {isOpen && (
          <div 
            className="absolute z-[110] mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            role="listbox"
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors',
                    option.value === value && 'bg-blue-50 text-blue-700 font-bold'
                  )}
                >
                  {option.label}
                  {option.value === value && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
