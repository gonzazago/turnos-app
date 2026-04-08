'use client'

import { useState, useRef, useEffect } from 'react'
import { updateProfile, disconnectPaymentAccount } from './actions'
import { UploadCloud, CheckCircle, AlertCircle, Link2Off, Calendar, Lock, Trash2, Plus } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Spinner } from '@/components/Spinner'
import { resizeImageFile } from '@/utils/imageResize'
import { hasProAccess, hasUltraAccess, PlanType } from '@/utils/planGuard'

export function SettingsForm({ profile }: { profile: any }) {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('Perfil actualizado correctamente.')
  
  const plan: PlanType = profile.plan_type || 'free';
  const canPro = hasProAccess(plan);
  const canUltra = hasUltraAccess(plan);
  
  const [logoPreview, setLogoPreview] = useState(profile.logo_url)
  const fileRef = useRef<HTMLInputElement>(null)

  const [refundRules, setRefundRules] = useState<any[]>(profile.refund_rules || [])

  const addRefundRule = () => {
    setRefundRules([...refundRules, { hoursBefore: 24, percentage: 50 }])
  }

  const removeRefundRule = (index: number) => {
    setRefundRules(refundRules.filter((_, i) => i !== index))
  }

  const updateRefundRule = (index: number, field: string, value: number) => {
    const newRules = [...refundRules]
    newRules[index] = { ...newRules[index], [field]: value }
    setRefundRules(newRules)
  }

  const handleDisconnect = async (provider: string) => {
    const providerName = provider === 'mercadopago' ? 'Mercado Pago' : 'Google Calendar'
    const message = provider === 'mercadopago' 
      ? '¿Estás seguro de que deseas desvincular tu cuenta de Mercado Pago? No podrás cobrar señas en tus eventos hasta que la vuelvas a conectar.'
      : '¿Estás seguro de que deseas desvincular tu cuenta de Google Calendar? Los eventos ya no se sincronizarán y tus horarios ocupados no se bloquearán.'

    if (!confirm(message)) {
      return
    }

    setLoading(true)
    try {
      const res = await disconnectPaymentAccount(provider)
      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setSuccessMessage(`Cuenta de ${providerName} desvinculada.`)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError('Error al desvincular la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchParams.get('success') === 'mp_connected') {
      setSuccess(true)
      setSuccessMessage('Cuenta de Mercado Pago conectada exitosamente.')
      setTimeout(() => setSuccess(false), 5000)
    }
    if (searchParams.get('success') === 'google_connected') {
      setSuccess(true)
      setSuccessMessage('Cuenta de Google Calendar conectada exitosamente.')
      setTimeout(() => setSuccess(false), 5000)
    }
    if (searchParams.get('error')) {
      const errCode = searchParams.get('error')
      let msg = 'Ocurrió un error.'
      if (errCode === 'mp_auth_failed') msg = 'No se pudo autorizar con Mercado Pago.'
      else if (errCode === 'mp_exchange_failed') msg = 'Error al verificar las credenciales con Mercado Pago.'
      else if (errCode === 'mp_internal_error') msg = 'Error interno al conectar Mercado Pago.'
      else if (errCode === 'google_auth_failed') msg = 'No se pudo autorizar con Google.'
      else if (errCode === 'google_db_save_failed') msg = 'Error al guardar las credenciales de Google.'
      else if (errCode === 'google_internal_error') msg = 'Error interno al conectar Google Calendar.'
      setError(msg)
    }
  }, [searchParams])

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
    
    try {
      const formEl = e.currentTarget
      const formData = new FormData(formEl)
      
      const logoFile = formData.get('logo') as File | null
      const bannerFile = formData.get('banner') as File | null
      const faviconFile = formData.get('favicon') as File | null

      if (logoFile && logoFile.size > 0 && logoFile.name) {
        const resized = await resizeImageFile(logoFile, 500, 500)
        formData.set('logo', resized, resized.name)
      }
      if (bannerFile && bannerFile.size > 0 && bannerFile.name) {
        const resized = await resizeImageFile(bannerFile, 1200, 600)
        formData.set('banner', resized, resized.name)
      }
      if (faviconFile && faviconFile.size > 0 && faviconFile.name) {
        const resized = await resizeImageFile(faviconFile, 128, 128, 'image/png')
        formData.set('favicon', resized, resized.name)
      }

      const palette = {
        primary: formData.get('brandColor'),
        secondary: formData.get('brandSecondaryColor') || '#1e40af'
      }
      formData.set('brandPalette', JSON.stringify(palette))
      formData.set('refundRules', JSON.stringify(refundRules))

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
          <span className="text-sm font-medium">{successMessage}</span>
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
            className="border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
              className="border border-slate-300 rounded-r-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all w-full flex-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="brandColor" className="text-sm font-semibold text-slate-700">Color Primario</label>
            <div className="flex items-center gap-4">
              <input 
                type="color" 
                id="brandColor" 
                name="brandColor" 
                defaultValue={profile.brand_color || profile.brand_palette?.primary || '#3b82f6'} 
                className="w-12 h-12 rounded cursor-pointer border-none p-0"
              />
              <span className="text-sm text-slate-500">Color principal.</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
               <label htmlFor="brandSecondaryColor" className="text-sm font-semibold text-slate-700">Color Secundario</label>
               {!canPro && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">Pro</span>}
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="color" 
                id="brandSecondaryColor" 
                name="brandSecondaryColor" 
                disabled={!canPro}
                defaultValue={profile.brand_palette?.secondary || '#1e40af'} 
                className="w-12 h-12 rounded cursor-pointer border-none p-0 disabled:opacity-50"
              />
              <span className="text-sm text-slate-500">Acentos y hover.</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
             <label htmlFor="fontFamily" className="text-sm font-semibold text-slate-700">Tipografía de la Página</label>
             {!canPro && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">Pro</span>}
          </div>
          <select 
            id="fontFamily" 
            name="fontFamily" 
            disabled={!canPro}
            defaultValue={profile.font_family || 'Inter'}
            className="border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="Inter">Inter (Elegante y moderna)</option>
            <option value="Roboto">Roboto (Clásica y legible)</option>
            <option value="Outfit">Outfit (Geométrica y llamativa)</option>
            <option value="Playfair Display">Playfair Display (Sobria y editorial)</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Imágenes y Branding</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Logo o Avatar</label>
            <input type="file" name="logo" accept="image/*" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-slate-900" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
               <label className="text-sm font-semibold text-slate-700">Favicon</label>
               {!canUltra && <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">Ultra White-Label</span>}
            </div>
            <input disabled={!canUltra} type="file" name="favicon" accept="image/*" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900" />
            <p className="text-xs text-slate-500">Icono de la pestaña del navegador.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-slate-700">Banner Superior (Hero)</label>
            {!canPro && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">Pro</span>}
          </div>
          <input disabled={!canPro} type="file" name="banner" accept="image/*" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900" />
          <p className="text-xs text-slate-500">Imagen de portada que se mostrará arriba del perfil. Formato horizontal.</p>
        </div>

        <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <label htmlFor="customSuccessMsg" className="text-sm font-semibold text-slate-700">Mensaje de Éxito Post-Pago</label>
            {!canUltra && <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">Ultra White-Label</span>}
          </div>
          <textarea 
            id="customSuccessMsg" 
            name="customSuccessMsg" 
            disabled={!canUltra}
            placeholder={canUltra ? "¡Gracias por tu reserva! Nos vemos pronto." : "Disponible en plan Ultra"}
            defaultValue={profile.custom_success_msg || ''} 
            className="border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none h-20 disabled:bg-slate-50 disabled:text-slate-400"
          ></textarea>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label htmlFor="customEmailBody" className="text-sm font-semibold text-slate-700">Mensaje Adicional para el Email</label>
            {!canUltra && <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">Ultra White-Label</span>}
          </div>
          <textarea 
            id="customEmailBody" 
            name="customEmailBody" 
            disabled={!canUltra}
            placeholder={canUltra ? "Recuerda traer a la sesión los siguientes documentos..." : "Disponible en plan Ultra"}
            defaultValue={profile.custom_email_body || ''} 
            className="border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none h-20 disabled:bg-slate-50 disabled:text-slate-400"
          ></textarea>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Políticas de Reembolso
              </h3>
              <p className="text-slate-500 text-sm mt-1">Define cuánto se le devuelve al cliente según el tiempo de cancelación.</p>
            </div>

            <div className="flex flex-col gap-3">
              {refundRules.map((rule, index) => (
                <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-left-2">
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Más de</span>
                    <input 
                      type="number" 
                      value={rule.hoursBefore} 
                      onChange={(e) => updateRefundRule(index, 'hoursBefore', parseInt(e.target.value) || 0)}
                      className="w-16 border border-slate-300 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-500">hs antes:</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <input 
                      type="number" 
                      value={rule.percentage} 
                      onChange={(e) => updateRefundRule(index, 'percentage', parseInt(e.target.value) || 0)}
                      className="w-16 border border-slate-300 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-500">% reembolso</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeRefundRule(index)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addRefundRule}
                className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all group"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">Agregar regla de reembolso</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <img src="https://http2.mlstatic.com/frontend-assets/ui-navigation/5.19.1/mercadopago/logo__large.png" alt="Mercado Pago" className="h-5" />
                Configuración de Pagos
              </h3>
              <p className="text-slate-500 text-sm mt-1">Conecta tu cuenta de Mercado Pago para cobrar señas por tus eventos.</p>
            </div>
            
            {profile.payment_accounts?.some((pa: any) => pa.provider === 'mercadopago' && pa.is_active) ? (
              <div className="flex items-center gap-2">
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-green-200">
                  <CheckCircle className="w-4 h-4" />
                  Conectado
                </div>
                <button
                  type="button"
                  onClick={() => handleDisconnect('mercadopago')}
                  disabled={loading}
                  className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center min-w-[40px]"
                  title="Desvincular cuenta"
                >
                  {loading ? <Spinner size="sm" /> : <Link2Off className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <a 
                href="/api/auth/mercadopago/authorize"
                className="bg-[#009EE3] hover:bg-[#008ACA] text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] text-sm whitespace-nowrap text-center"
              >
                Conectar Mercado Pago
              </a>
            )}
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Google Calendar
              </h3>
              <p className="text-slate-500 text-sm mt-1">Sincroniza tus eventos y evita que agenden en horarios ocupados de tu calendario personal.</p>
            </div>
            
            {profile.google_calendar_connected ? (
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-blue-200">
                  <CheckCircle className="w-4 h-4" />
                  Google Calendar Conectado
                </div>
                <button
                  type="button"
                  onClick={() => handleDisconnect('google')}
                  disabled={loading}
                  className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center min-w-[40px]"
                  title="Desvincular Google Calendar"
                >
                  {loading ? <Spinner size="sm" /> : <Link2Off className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <a 
                href="/api/auth/google/authorize"
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] text-sm whitespace-nowrap text-center flex items-center gap-2"
              >
                <img src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" alt="Google" className="h-4" />
                Conectar Google Calendar
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-200 flex justify-end">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-600/20 disabled:opacity-70 flex items-center gap-2"
        >
          {loading ? <Spinner size="sm" color="white" /> : null}
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  )
}
