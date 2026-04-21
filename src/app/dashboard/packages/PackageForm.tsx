'use client'

import React, { useState } from 'react'
import { createPackage } from './actions'
import { Dropdown } from '@/components/ui/Dropdown'
import { Package } from 'lucide-react'

interface PackageFormProps {
  eventTypes: { id: string, title: string }[] | null
}

export function PackageForm({ eventTypes }: PackageFormProps) {
  const [eventTypeId, setEventTypeId] = useState('none')

  const eventTypeOptions = [
    { label: 'Cualquier evento (Global)', value: 'none' },
    ...(eventTypes || []).map(ev => ({ label: ev.title, value: ev.id }))
  ]

  return (
    <form action={createPackage as any} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Nuevo Paquete</h2>
      
      <label className="text-sm font-bold text-slate-700 mb-2">Nombre Comercial</label>
      <input 
        type="text" 
        name="name" 
        required 
        placeholder="Ej: Promo 4 Sesiones Terapia"
        className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 placeholder:text-slate-400" 
      />

      <Dropdown 
        label="Tipo de Evento Asociado"
        name="eventTypeId"
        value={eventTypeId}
        onChange={setEventTypeId}
        options={eventTypeOptions}
        containerClassName="mb-4"
      />

      <label className="text-sm font-bold text-slate-700 mb-2">Modalidad de Uso</label>
      <div className="flex flex-col gap-3 mb-4">
        <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
          <input type="radio" name="schedulingType" value="libre" defaultChecked className="mt-1" />
          <div>
            <p className="font-bold text-slate-900 text-sm">Créditos Libres</p>
            <p className="text-xs text-slate-500">Paga y usa sus N sesiones libremente a lo largo del tiempo ingresando al calendario.</p>
          </div>
        </label>
        <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
          <input type="radio" name="schedulingType" value="fijo" className="mt-1" />
          <div>
            <p className="font-bold text-slate-900 text-sm">Agendamiento Recurrente (Fijo)</p>
            <p className="text-xs text-slate-500">El cliente elige un primer día/hora, y el sistema agendará automáticamente semanas seguidas en ese slot.</p>
          </div>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-bold text-slate-700 mb-2 block">Total Sesiones</label>
          <input 
            type="number" 
            name="sessionCount" 
            min="2"
            max="50"
            required 
            defaultValue="4"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900" 
          />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-700 mb-2 block">Precio Total ($)</label>
          <input 
            type="number" 
            name="totalPrice" 
            min="1"
            step="0.01"
            required 
            placeholder="0.00"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-600 outline-none text-slate-900" 
          />
        </div>
      </div>

      <button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-colors">
        Crear Promoción
      </button>
    </form>
  )
}
