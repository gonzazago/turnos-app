'use client'

import { useState } from 'react'
import { createEventType } from './actions'
import { AvailabilitySettings, AvailabilityDay } from '../components/AvailabilitySettings'
import { CreditCard, Percent, DollarSign, Plus, X } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/Modal'

const DEFAULT_SCHEDULE: AvailabilityDay[] = [
  { day_of_week: 1, enabled: true, start_time: '09:00', end_time: '17:00' },
  { day_of_week: 2, enabled: true, start_time: '09:00', end_time: '17:00' },
  { day_of_week: 3, enabled: true, start_time: '09:00', end_time: '17:00' },
  { day_of_week: 4, enabled: true, start_time: '09:00', end_time: '17:00' },
  { day_of_week: 5, enabled: true, start_time: '09:00', end_time: '17:00' },
  { day_of_week: 6, enabled: false, start_time: '09:00', end_time: '17:00' },
  { day_of_week: 0, enabled: false, start_time: '09:00', end_time: '17:00' },
]

export function NewEventForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [schedule, setSchedule] = useState<AvailabilityDay[]>(DEFAULT_SCHEDULE)
  
  const [requiresDeposit, setRequiresDeposit] = useState(false)
  const [totalPrice, setTotalPrice] = useState('0')
  const [depositPercentage, setDepositPercentage] = useState('20')

  const depositAmount = (parseFloat(totalPrice || '0') * parseFloat(depositPercentage || '0') / 100).toFixed(2)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const availability = schedule
      .filter(d => d.enabled)
      .map(d => ({
        day_of_week: d.day_of_week,
        start_time: d.start_time,
        end_time: d.end_time
      }))
    
    try {
      const res = await createEventType(formData, availability)
      if (res?.error) {
        setError(res.error)
      } else {
        setIsOpen(false)
        setSchedule(DEFAULT_SCHEDULE)
        setRequiresDeposit(false)
        setTotalPrice('0')
        setDepositPercentage('20')
      }
    } catch (err) {
      setError('Ocurrió un error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-end mb-6">
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 flex items-center gap-2 active:scale-[0.98]"
      >
        <Plus className="w-5 h-5" />
        Nuevo Tipo de Evento
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Nuevo Tipo de Evento"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-sm font-semibold text-slate-700">Nombre del Evento</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required 
              placeholder="Ej. Consultoría 30 min"
              className="border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="duration_mins" className="text-sm font-semibold text-slate-700">Duración (minutos)</label>
            <input 
              type="number" 
              id="duration_mins" 
              name="duration_mins" 
              required 
              defaultValue={30}
              min="1"
              className="border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-semibold text-slate-700">Descripción (Opcional)</label>
            <textarea 
              id="description" 
              name="description" 
              rows={3}
              placeholder="Detalles sobre qué se hablará en esta reunión."
              className="border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <AvailabilitySettings schedule={schedule} setSchedule={setSchedule} />

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-slate-900">Configuración de Seña</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="requiresDeposit"
                  checked={requiresDeposit}
                  onChange={(e) => setRequiresDeposit(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {requiresDeposit && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-col gap-2">
                  <label htmlFor="totalPrice" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    Precio Total
                  </label>
                  <input 
                    type="number" 
                    id="totalPrice" 
                    name="totalPrice" 
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    required={requiresDeposit}
                    min="0"
                    step="0.01"
                    className="border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="depositPercentage" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-slate-400" />
                    Porcentaje de Seña
                  </label>
                  <input 
                    type="number" 
                    id="depositPercentage" 
                    name="depositPercentage" 
                    value={depositPercentage}
                    onChange={(e) => setDepositPercentage(e.target.value)}
                    required={requiresDeposit}
                    min="1"
                    max="100"
                    className="border border-slate-300 rounded-xl px-4 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="sm:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-800 font-medium">
                    Los clientes deberán pagar <span className="font-bold">${depositAmount}</span> para confirmar la reserva.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? <Spinner size="sm" color="white" /> : null}
              {loading ? 'Guardando...' : 'Guardar Evento'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
