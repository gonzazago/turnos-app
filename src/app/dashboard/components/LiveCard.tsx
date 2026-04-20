import React from 'react'
import { Calendar, Clock, Globe, Shield } from 'lucide-react'

interface LiveCardProps {
  fullName: string
  brandColor: string
  logoUrl?: string
  fontFamily?: string
}

export function LiveCard({
  fullName,
  brandColor,
  logoUrl,
  fontFamily = 'Inter'
}: LiveCardProps) {
  return (
    <div 
      data-testid="live-card"
      className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 scale-75 origin-top transform-gpu"
      style={{ fontFamily }}
    >
      {/* Mini Banner */}
      <div className="h-16 w-full" style={{ backgroundColor: brandColor }}></div>
      
      <div className="p-6 -mt-10">
        {/* Profile Pic/Logo */}
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg p-1">
            <div className="w-full h-full bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-300 font-bold text-2xl">
                  {fullName.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-1">{fullName}</h3>
        <p className="text-xs text-slate-500 mb-6 flex items-center gap-1">
          <Globe className="w-3 h-3" /> Booking Page Preview
        </p>

        {/* Dummy Event Item */}
        <div className="border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Consulta Inicial</div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" /> 30 min
              </div>
            </div>
          </div>
          <div 
            className="text-[10px] font-bold px-3 py-1 rounded-lg"
            style={{ backgroundColor: brandColor, color: '#fff' }}
          >
            Reservar
          </div>
        </div>

        <div className="mt-6 flex justify-center">
           <div className="flex items-center gap-1 text-[8px] text-slate-400">
             <Shield className="w-2 h-2" /> Powered by turnos.app
           </div>
        </div>
      </div>
    </div>
  )
}
