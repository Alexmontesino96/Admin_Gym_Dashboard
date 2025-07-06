'use client'

import { useEffect, useState } from 'react'
import { eventsAPI } from '@/lib/api'
import { PencilSquareIcon } from '@heroicons/react/24/outline'

interface GymHour {
  day_of_week: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

const days = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

export default function WeeklyTemplateClient(){
  const [hours,setHours]=useState<GymHour[]>([])
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState<string|null>(null)

  useEffect(()=>{const load=async()=>{try{setLoading(true);const data=await eventsAPI.getGymHoursRegular();setHours(data)}catch(e){console.error(e);setError('Error cargando horario') }finally{setLoading(false)}};load()},[])

  // Export modal
  const [showExport,setShowExport]=useState(false)
  const [form,setForm]=useState({start_date:'',end_date:'',overwrite:false})
  const [processing,setProcessing]=useState(false)
  const [successMsg,setSuccessMsg]=useState<string|null>(null)
  const isValid = form.start_date && form.end_date && form.end_date>=form.start_date
  const handleExport=async()=>{
    if(!isValid) return
    try{setProcessing(true);await eventsAPI.applyGymHoursDefaults(form.start_date,form.end_date,form.overwrite);setShowExport(false);setSuccessMsg('Plantilla exportada correctamente');setTimeout(()=>setSuccessMsg(null),4000)}catch(e){console.error(e)}finally{setProcessing(false)}
  }

  // Edición horario día
  const [showEdit,setShowEdit]=useState(false)
  const [editInfo,setEditInfo]=useState<GymHour|null>(null)
  const [editForm,setEditForm]=useState<{open_time:string, close_time:string, is_closed:boolean}>({open_time:'09:00',close_time:'21:00',is_closed:false})
  const [saving,setSaving]=useState(false)
  const openEdit=(info:GymHour)=>{
    setEditInfo(info)
    setEditForm({
      open_time: info.open_time?.slice(0,5)||'09:00',
      close_time: info.close_time?.slice(0,5)||'21:00',
      is_closed: info.is_closed
    })
    setShowEdit(true)
  }
  const handleSave=async()=>{
    if(!editInfo) return
    try{
      setSaving(true)
      const payload:any={is_closed:editForm.is_closed}
      if(!editForm.is_closed){payload.open_time=editForm.open_time;payload.close_time=editForm.close_time}
      await eventsAPI.updateGymHoursByDay(editInfo.day_of_week,payload)
      // refresh hours
      const data=await eventsAPI.getGymHoursRegular();setHours(data)
      setShowEdit(false)
    }catch(e){console.error(e)}finally{setSaving(false)}
  }

  return (
    <div className="flex h-full">
      {/* Calendario */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white sticky top-0 z-10">
          <h1 className="text-2xl font-bold">Plantilla semanal (horario de apertura)</h1>
          <div className="flex gap-3">
            <button onClick={()=>setShowExport(true)} className="px-4 py-2 border rounded-lg text-sm bg-white shadow">Exportar a rango…</button>
          </div>
        </div>

        {/* Tabla */}
        {loading? (
          <p className="p-6 text-gray-500">Cargando horario…</p>
        ) : error? (
          <p className="p-6 text-red-500">{error}</p>
        ) : (
          <div className="w-full px-2">
            <div className="rounded-lg overflow-hidden border border-gray-200 shadow">
              <table className="w-full bg-white">
                <thead className="bg-gray-50">
                  <tr className="text-gray-700">
                    <th className="px-4 py-2 text-left text-sm font-semibold">Día</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Apertura</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Cierre</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Estado</th>
                    <th className="px-4 py-2 text-sm font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((d,idx)=>{
                    const info = hours.find(h=>h.day_of_week===idx)
                    const closed = info?.is_closed || !info
                    return (
                      <tr key={idx} className="border-t even:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium">{d}</td>
                        <td className="px-4 py-2 text-sm">{closed? '—' : info?.open_time?.slice(0,5)}</td>
                        <td className="px-4 py-2 text-sm">{closed? '—' : info?.close_time?.slice(0,5)}</td>
                        <td className="px-4 py-2 text-sm">{closed? <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">Cerrado</span> : <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">Abierto</span>}</td>
                        <td className="px-4 py-2 text-sm text-right">
                          <button onClick={()=> info && openEdit(info)} className="text-gray-500 hover:text-blue-600"><PencilSquareIcon className="w-4 h-4"/></button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal exportar */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Exportar plantilla al rango</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-700 block mb-1">Fecha inicio</label>
                <input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="text-sm text-gray-700 block mb-1">Fecha fin</label>
                <input type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} className="w-full border px-3 py-2 rounded" />
              </div>
              <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={form.overwrite} onChange={e=>setForm({...form,overwrite:e.target.checked})}/> <span>Sobrescribir excepciones existentes</span></label>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={()=>setShowExport(false)} className="px-4 py-2 text-sm rounded border">Cancelar</button>
              <button onClick={handleExport} disabled={!isValid||processing} className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">{processing? 'Procesando…':'Exportar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar día */}
      {showEdit && editInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Editar horario – {days[editInfo.day_of_week]}</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={editForm.is_closed} onChange={e=>setEditForm({...editForm,is_closed:e.target.checked})}/> <span>Día cerrado</span></label>
              {!editForm.is_closed && (
                <div className="flex gap-3">
                  <div className="flex-1"><label className="text-xs text-gray-600">Apertura</label><input type="time" value={editForm.open_time} onChange={e=>setEditForm({...editForm,open_time:e.target.value})} className="w-full border px-2 py-1 rounded" /></div>
                  <div className="flex-1"><label className="text-xs text-gray-600">Cierre</label><input type="time" value={editForm.close_time} onChange={e=>setEditForm({...editForm,close_time:e.target.value})} className="w-full border px-2 py-1 rounded" /></div>
                </div>)}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={()=>setShowEdit(false)} className="px-4 py-2 text-sm rounded border">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">{saving? 'Guardando…':'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="fixed top-20 right-6 z-50">
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg text-sm shadow">
            {successMsg}
          </div>
        </div>
      )}
    </div>
  )
} 