'use client'

import React, { useState, useEffect } from 'react'
import { createPackage, updatePackage } from './actions'
import { Dropdown } from '@/components/ui/Dropdown'
import { Plus, Trash2, Calendar, Clock, Pencil, X } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/ui/Button'

interface PackageFormModalProps {
  eventTypes: { id: string, title: string }[] | null
  packageToEdit?: any
}

const DAYS = [
  { id: 1, label: 'Lu' },
  { id: 2, label: 'Ma' },
  { id: 3, label: 'Mi' },
  { id: 4, label: 'Ju' },
  { id: 5, label: 'Vi' },
  { id: 6, label: 'Sa' },
  { id: 0, label: 'Do' },
]

export function PackageFormModal({ eventTypes, packageToEdit }: PackageFormModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [eventTypeId, setEventTypeId] = useState('none')
  const [schedulingType, setSchedulingType] = useState<'libre' | 'fijo'>('libre')
  const [variants, setVariants] = useState([{ id: 'v-' + Date.now(), session_count: 10, price: 1000 }])
  const [allowedDays, setAllowedDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [frequencyPerWeek, setFrequencyPerWeek] = useState(1)

  const isEditMode = !!packageToEdit

  useEffect(() => {
    if (packageToEdit && isOpen) {
      setEventTypeId(packageToEdit.event_type_id || 'none')
      setSchedulingType(packageToEdit.scheduling_type)
      setVariants(packageToEdit.variants?.map((v: any, i: number) => ({ ...v, id: 'v-' + i })) || [{ id: 'v-' + Date.now(), session_count: 10, price: 1000 }])
      setAllowedDays(packageToEdit.allowed_days || [1, 2, 3, 4, 5])
      setFrequencyPerWeek(packageToEdit.frequency_per_week || 1)
    }
  }, [packageToEdit, isOpen])

  const eventTypeOptions = [
    { label: 'Cualquier evento (Global)', value: 'none' },
    ...(eventTypes || []).map(ev => ({ label: ev.title, value: ev.id }))
  ]

  const addVariant = () => {
    setVariants([...variants, { id: 'v-' + Date.now(), session_count: 10, price: 1000 }])
  }

  const updateVariant = (id: string, field: string, value: number) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v))
  }

  const removeVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(variants.filter(v => v.id !== id))
    }
  }

  const toggleDay = (dayId: number) => {
    if (allowedDays.includes(dayId)) {
      setAllowedDays(allowedDays.filter(d => d !== dayId))
    } else {
      setAllowedDays([...allowedDays, dayId])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('variants', JSON.stringify(variants.map(({ session_count, price }) => ({ session_count, price }))))
    formData.append('allowedDays', JSON.stringify(allowedDays))
    formData.append('eventTypeId', eventTypeId)
    
    const res = isEditMode 
      ? await updatePackage(packageToEdit.id, formData)
      : await createPackage(formData)
      
    setLoading(false)
    if (res?.error) {
      alert(res.error)
    } else {
      setIsOpen(false)
      // Reset if creating
      if (!isEditMode) {
        setEventTypeId('none')
        setSchedulingType('libre')
        setVariants([{ id: 'v-' + Date.now(), session_count: 10, price: 1000 }])
      }
    }
  }

  return (
    <>
      {isEditMode ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors group"
          title="Editar Paquete"
        >
          <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      ) : (
        <Button 
          onClick={() => setIsOpen(true)}
          leftIcon={<Plus className="w-5 h-5" />}
        >
          Nuevo Paquete
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={isEditMode ? "Editar Paquete de Sesiones" : "Nuevo Paquete de Sesiones"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">Nombre Comercial</label>
            <input 
              type="text" 
              name="name" 
              required 
              defaultValue={packageToEdit?.name}
              placeholder="Ej: Bono de Kinesiología"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 placeholder:text-slate-400" 
            />
          </div>

          <Dropdown 
            label="Tipo de Evento Asociado"
            value={eventTypeId}
            onChange={setEventTypeId}
            options={eventTypeOptions}
          />

          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-slate-700">Modalidad de Uso</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`flex items-start gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${schedulingType === 'libre' ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" name="schedulingType" value="libre" checked={schedulingType === 'libre'} onChange={() => setSchedulingType('libre')} className="mt-1" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">Créditos Libres</p>
                  <p className="text-[10px] leading-tight text-slate-500 mt-1 uppercase font-bold tracking-wider">Flexibilidad total</p>
                  <p className="text-xs text-slate-500 mt-1">El cliente usa sus sesiones libremente a lo largo del tiempo.</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${schedulingType === 'fijo' ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" name="schedulingType" value="fijo" checked={schedulingType === 'fijo'} onChange={() => setSchedulingType('fijo')} className="mt-1" />
                <div>
                  <p className="font-bold text-slate-900 text-sm">Agendamiento Fijo</p>
                  <p className="text-[10px] leading-tight text-blue-600 mt-1 uppercase font-bold tracking-wider">Recurrente</p>
                  <p className="text-xs text-slate-500 mt-1">El sistema reserva automáticamente todos los turnos según la frecuencia elegida.</p>
                </div>
              </label>
            </div>
          </div>

          {schedulingType === 'fijo' && (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Frecuencia Semanal</label>
                    <div className="flex items-center gap-3">
                       <input 
                          type="number" 
                          name="frequencyPerWeek" 
                          min="1" 
                          max="7" 
                          value={frequencyPerWeek}
                          onChange={(e) => setFrequencyPerWeek(parseInt(e.target.value))}
                          className="w-20 border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 font-bold"
                       />
                       <span className="text-sm text-slate-600 font-medium">sesiones por semana</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Días de Atención</label>
                    <div className="flex flex-wrap gap-2">
                       {DAYS.map((day) => (
                         <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleDay(day.id)}
                            className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${allowedDays.includes(day.id) ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300'}`}
                         >
                           {day.label}
                         </button>
                       ))}
                    </div>
                  </div>
               </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700">Variantes de Sesiones y Precios</label>
              <button 
                type="button" 
                onClick={addVariant}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar variante
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {variants.map((variant) => (
                <div key={variant.id} className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100 group">
                  <div className="flex-1 flex items-center gap-2">
                    <input 
                      type="number" 
                      value={variant.session_count} 
                      onChange={(e) => updateVariant(variant.id, 'session_count', parseInt(e.target.value) || 0)}
                      className="w-16 border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Sesiones</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-slate-400 font-bold">$</span>
                    <input 
                      type="number" 
                      value={variant.price} 
                      onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-24 border border-slate-300 rounded-lg px-2 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeVariant(variant.id)}
                    disabled={variants.length === 1}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4">
             <Button variant="ghost" type="button" onClick={() => setIsOpen(false)}>Cancelar</Button>
             <Button type="submit" isLoading={loading}>
                {isEditMode ? "Guardar Cambios" : "Crear Paquete"}
             </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
