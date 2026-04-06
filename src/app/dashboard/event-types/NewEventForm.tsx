'use client'

import { useState, useActionState } from 'react'
import { createEventType } from './actions'
import { AvailabilitySettings, AvailabilityDay } from '../components/AvailabilitySettings'
import { CreditCard, Percent, DollarSign, Plus } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'

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
  const [isOpen, setIsOpen] = useState(false)
  const [schedule, setSchedule] = useState<AvailabilityDay[]>(DEFAULT_SCHEDULE)
  
  const [requiresDeposit, setRequiresDeposit] = useState(false)
  const [totalPrice, setTotalPrice] = useState('0')
  const [depositPercentage, setDepositPercentage] = useState('20')

  // Example of using useActionState (React 19) for form handling
  const [state, formAction, isPending] = useActionState(
    async (_prevState: any, formData: FormData) => {
      const availability = schedule
        .filter(d => d.enabled)
        .map(d => ({
          day_of_week: d.day_of_week,
          start_time: d.start_time,
          end_time: d.end_time
        }))
      
      try {
        const res = await createEventType(formData, availability)
        if (res?.error) return { error: res.error, success: false }
        
        // Success: signal success to the component
        return { success: true, error: null }
      } catch (err) {
        return { error: 'Ocurrió un error inesperado.', success: false }
      }
    },
    { error: null, success: false }
  )

  // Handle success side effects (closing modal and resetting)
  if (state.success && isOpen) {
    setIsOpen(false)
    setSchedule(DEFAULT_SCHEDULE)
    setRequiresDeposit(false)
    setTotalPrice('0')
    setDepositPercentage('20')
    // Note: In a real app we might need to reset the action state 
    // or handle this via useEffect to avoid state updates during render
  }

  const depositAmount = (parseFloat(totalPrice || '0') * parseFloat(depositPercentage || '0') / 100).toFixed(2)

  return (
    <div className="flex justify-end mb-6">
      <Button 
        onClick={() => setIsOpen(true)}
        leftIcon={<Plus className="w-5 h-5" />}
        size="lg"
      >
        Nuevo Tipo de Evento
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Nuevo Tipo de Evento"
        size="lg"
      >
        <form action={formAction} className="flex flex-col gap-6">
          {state.error && <Alert variant="error">{state.error}</Alert>}

          <Input 
            label="Nombre del Evento"
            id="title" 
            name="title" 
            required 
            placeholder="Ej. Consultoría 30 min"
          />

          <Input 
            label="Duración (minutos)"
            type="number" 
            id="duration_mins" 
            name="duration_mins" 
            required 
            defaultValue={30}
            min="1"
          />

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
              <Toggle 
                name="requiresDeposit"
                checked={requiresDeposit}
                onChange={setRequiresDeposit}
              />
            </div>

            {requiresDeposit && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                <Input 
                  label="Precio Total"
                  type="number" 
                  id="totalPrice" 
                  name="totalPrice" 
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(e.target.value)}
                  required={requiresDeposit}
                  min="0"
                  step="0.01"
                  leftIcon={<DollarSign className="w-4 h-4 text-slate-400" />}
                />

                <Input 
                  label="Porcentaje de Seña"
                  type="number" 
                  id="depositPercentage" 
                  name="depositPercentage" 
                  value={depositPercentage}
                  onChange={(e) => setDepositPercentage(e.target.value)}
                  required={requiresDeposit}
                  min="1"
                  max="100"
                  leftIcon={<Percent className="w-4 h-4 text-slate-400" />}
                />

                <div className="sm:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-800 font-medium">
                    Los clientes deberán pagar <span className="font-bold">${depositAmount}</span> para confirmar la reserva.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)} type="button">
              Cancelar
            </Button>
            <Button type="submit" isLoading={isPending}>
              Guardar Evento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function Toggle({ name, checked, onChange }: { name: string, checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer" 
      />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  )
}
