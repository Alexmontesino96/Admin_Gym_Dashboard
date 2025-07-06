'use client'

import { useState } from 'react'
import { eventsAPI } from '@/lib/api'

export default function AplicarPlantillaPage(){
  const [form, setForm] = useState({start_date:'', end_date:'', overwrite:false})
  const [processing,setProcessing] = useState(false)
  const [message,setMessage] = useState<string|null>(null)
  const isValid = form.start_date && form.end_date && form.end_date >= form.start_date

  const handleSubmit = async()=>{
    if(!isValid) return
    try{
      setProcessing(true)
      await eventsAPI.applyGymHoursDefaults(form.start_date, form.end_date, form.overwrite)
      setMessage('Plantilla aplicada correctamente')
    }catch(err:any){
      console.error(err)
      setMessage('Error al aplicar plantilla')
    }finally{setProcessing(false)}
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Aplicar plantilla a un rango</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Fecha inicio</label>
          <input type="date" value={form.start_date} onChange={e=>setForm({...form, start_date:e.target.value})} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Fecha fin</label>
          <input type="date" value={form.end_date} onChange={e=>setForm({...form, end_date:e.target.value})} className="w-full border px-3 py-2 rounded" />
        </div>
        <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={form.overwrite} onChange={e=>setForm({...form, overwrite:e.target.checked})}/> <span>Sobrescribir excepciones existentes</span></label>
      </div>
      {message && <p className="mt-4 text-sm text-center text-gray-600">{message}</p>}
      <div className="mt-6 text-right">
        <button onClick={handleSubmit} disabled={processing||!isValid} className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">
          {processing? 'Procesando…':'Aplicar'}
        </button>
      </div>
    </div>
  )
} 