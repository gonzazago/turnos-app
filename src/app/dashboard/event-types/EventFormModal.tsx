'use client'

import { useState, useActionState, useEffect } from 'react'
import { createEventType, updateEventType } from './actions'
import { AvailabilitySettings, AvailabilityDay } from '../components/AvailabilitySettings'
import { CreditCard, Percent, DollarSign, Plus, Pencil } from 'lucide-react'
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

interface EventFormModalProps {
  eventToEdit?: any
}

export function EventFormModal({ eventToEdit }: EventFormModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [schedule, setSchedule] = useState<AvailabilityDay[]>(DEFAULT_SCHEDULE)
  
  const [requiresDeposit, setRequiresDeposit] = useState(false)
  const [totalPrice, setTotalPrice] = useState('0')
  const [depositPercentage, setDepositPercentage] = useState('20')

  const isEditMode = !!eventToEdit

  // Initialize form with event data if editing
  useEffect(() => {
    if (eventToEdit && isOpen) {
      setRequiresDeposit(eventToEdit.requires_deposit)
      setTotalPrice(eventToEdit.total_price?.toString() || '0')
      setDepositPercentage(eventToEdit.deposit_percentage?.toString() || '20')
      
      if (eventToEdit.availability) {
        const newSchedule = DEFAULT_SCHEDULE.map(day => {
          const found = eventToEdit.availability.find((a: any) => a.day_of_week === day.day_of_week)
          if (found) {
            return {
              ...day,
              enabled: true,
              start_time: found.start_time.substring(0, 5),
              end_time: found.end_time.substring(0, 5)
            }
          }
          return { ...day, enabled: false }
        })
        setSchedule(newSchedule)
      }
    } else if (!isOpen && !isEditMode) {
      // Reset when closing creation modal
      setSchedule(DEFAULT_SCHEDULE)
      setRequiresDeposit(false)
      setTotalPrice('0')
      setDepositPercentage('20')
    }
  }, [eventToEdit, isOpen, isEditMode])

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
        const res = isEditMode 
          ? await updateEventType(eventToEdit.id, formData, availability)
          : await createEventType(formData, availability)
          
        if (res?.error) return { error: res.error, success: false }
        
        return { success: true, error: null }
      } catch (err) {
        return { error: 'Ocurrió un error inesperado.', success: false }
      }
    },
    { error: null, success: false }
  )

  // Handle success side effects (closing modal)
  useEffect(() => {
    if (state.success && isOpen) {
      setIsOpen(false)
    }
  }, [state.success, isOpen])

  const depositAmount = (parseFloat(totalPrice || '0') * parseFloat(depositPercentage || '0') / 100).toFixed(2)

  return (
    <>
      {isEditMode ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="text-slate-400 hover:text-blue-500 transition-colors p-2 rounded-lg hover:bg-slate-100 opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Editar evento"
        >
          <Pencil className="w-5 h-5" />
        </button>
      ) : (
        <div className="flex justify-end mb-6">
          <Button 
            onClick={() => setIsOpen(true)}
            leftIcon={<Plus className="w-5 h-5" />}
            size="lg"
          >
            Nuevo Tipo de Evento
          </Button>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={isEditMode ? "Editar Tipo de Evento" : "Nuevo Tipo de Evento"}
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
            defaultValue={eventToEdit?.title}
          />

          <Input 
            label="Duración (minutos)"
            type="number" 
            id="duration_mins" 
            name="duration_mins" 
            required 
            defaultValue={eventToEdit?.duration_mins || 30}
            min="1"
          />

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-semibold text-slate-700">Descripción (Opcional)</label>
            <textarea 
              id="description" 
              name="description" 
              rows={3}
              placeholder="Detalles sobre qué se hablará en esta reunión."
              defaultValue={eventToEdit?.description}
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
              {isEditMode ? "Guardar Cambios" : "Guardar Evento"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
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
