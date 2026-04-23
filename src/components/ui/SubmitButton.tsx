'use client'

import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  children: React.ReactNode
  formAction: (payload: FormData) => void
  pendingText?: string
  className?: string
}

export function SubmitButton({ 
  children, 
  formAction, 
  pendingText = 'Ingresando...',
  className = ''
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      formAction={formAction}
      disabled={pending}
      className={`mt-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl px-4 py-3 transition-all flex items-center justify-center gap-2 ${
        pending ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98]'
      } ${className}`}
    >
      {pending ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{pendingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
