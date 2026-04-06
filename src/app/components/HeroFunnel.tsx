'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles } from 'lucide-react'

export function HeroFunnel() {
  const [slug, setSlug] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!slug.trim()) return
    
    // Process slug: lowercase and hyphenate
    const safeSlug = slug.toLowerCase().trim().replace(/[^a-z0-9]/g, '-')
    router.push(`/register?slug=${safeSlug}`)
  }

  return (
    <div className="mt-10 flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <form 
        onSubmit={handleSubmit}
        className="relative group w-full"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 bg-white rounded-2xl border border-slate-200 shadow-xl">
          <div className="flex items-center flex-1 min-w-0 px-4 py-3 sm:py-0">
            <span className="text-slate-400 font-medium whitespace-nowrap">turnos.app/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="tu-nombre"
              className="w-full bg-transparent border-none focus:ring-0 text-slate-900 font-bold placeholder:text-slate-300 placeholder:font-normal"
              required
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 sm:py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20"
          >
            Reclamar mi enlace
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
      
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
              <img 
                src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                alt="User" 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <span>Únete a +2,000 profesionales hoy</span>
        <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
      </div>
    </div>
  )
}
