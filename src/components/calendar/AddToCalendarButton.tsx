'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown, Download, Mail } from 'lucide-react'
import { 
  getGoogleCalendarUrl, 
  getOutlookCalendarUrl, 
  downloadIcsFile, 
  CalendarEvent 
} from '@/utils/calendar-links'

interface AddToCalendarButtonProps {
  event: CalendarEvent
}

export function AddToCalendarButton({ event }: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const options = [
    {
      label: 'Google Calendar',
      icon: <Mail className="w-4 h-4" />,
      onClick: () => {
        window.open(getGoogleCalendarUrl(event), '_blank')
        setIsOpen(false)
      }
    },
    {
      label: 'Outlook',
      icon: <Mail className="w-4 h-4" />,
      onClick: () => {
        window.open(getOutlookCalendarUrl(event), '_blank')
        setIsOpen(false)
      }
    },
    {
      label: 'Apple / Otros (.ics)',
      icon: <Download className="w-4 h-4" />,
      onClick: () => {
        downloadIcsFile(event)
        setIsOpen(false)
      }
    }
  ]

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
      >
        <Calendar className="w-5 h-5" />
        <span>Agendar en mi calendario</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-56 rounded-2xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-[120] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.label}
                onClick={option.onClick}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  {option.icon}
                </div>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
