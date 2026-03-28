'use client'

import { useState, useRef } from 'react'
import { updateProfile } from './actions'
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react'

export function SettingsForm({ profile }: { profile: any }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [logoPreview, setLogoPreview] = useState(profile.logo_url)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const res = await updateProfile(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al guardar los cambios.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col gap-8 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Perfil Público</h2>
        <p className="text-slate-500 text-sm mt-1">Configura cómo te verán tus clientes al agendar una cita.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-3 border border-green-100">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">Perfil actualizado correctamente.</span>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="fullName" className="text-sm font-semibold text-slate-700">Nombre Completo</label>
          <input 
            type="text" 
            id="fullName" 
            name="fullName" 
            defaultValue={profile.full_name} 
            required 
            className="border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="slug" className="text-sm font-semibold text-slate-700">Enlace Personal</label>
          <div className="flex items-center">
            <span className="bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl px-4 py-2.5 text-slate-500 text-sm">
              turnos.app/
            </span>
            <input 
              type="text" 
              id="slug" 
              name="slug" 
              defaultValue={profile.slug} 
              required 
              className="border border-slate-300 rounded-r-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all w-full flex-1"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="brandColor" className="text-sm font-semibold text-slate-700">Color de Marca</label>
          <div className="flex items-center gap-4">
            <input 
              type="color" 
              id="brandColor" 
              name="brandColor" 
              defaultValue={profile.brand_color || '#3b82f6'} 
              className="w-12 h-12 rounded cursor-pointer border-none p-0"
            />
            <span className="text-sm text-slate-500">El color principal de tu página pública (botones, acentos).</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-700">Logo o Avatar</label>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
               {logoPreview ? (
                 <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                   <UploadCloud className="w-8 h-8 mb-1" />
                 </div>
               )}
            </div>
            <div>
              <input 
                ref={fileRef}
                type="file" 
                name="logo" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange} 
              />
              <button 
                type="button" 
                onClick={() => fileRef.current?.click()}
                className="bg-white border text-sm font-medium border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors"
              >
                Subir nueva imagen
              </button>
              <p className="text-xs text-slate-500 mt-2">Formatos recomendados: JPG, PNG. Máx 2MB.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-200 flex justify-end">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-600/20 disabled:opacity-70 flex items-center gap-2"
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  )
}
