'use client'

import { useState } from 'react'
import { eventsAPI } from '@/lib/api'

export default function ConsultaHorarioPage(){
  const [dateStr,setDateStr]=useState('')
  const [dateInfo,setDateInfo]=useState<any|null>(null)
  const [loading,setLoading]=useState(false)

  const handleFetch=async()=>{
    if(!dateStr) return
    try{setLoading(true); const data=await eventsAPI.getGymHoursByDate(dateStr); setDateInfo(data)}catch(e){console.error(e); setDateInfo(null)} finally{setLoading(false)}
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Consultar horario por fecha</h2>
      <div className="flex items-center gap-2 mb-4">
        <input type="date" value={dateStr} onChange={e=>setDateStr(e.target.value)} className="border px-3 py-2 rounded flex-1" />
        <button onClick={handleFetch} disabled={!dateStr} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded disabled:opacity-50">Ver</button>
      </div>
      {loading? <p className="text-sm text-gray-500">Cargando…</p> : dateInfo && (
        <div className="text-sm text-gray-700 space-y-1">
          <p><span className="font-medium">Estado:</span> {dateInfo.effective_hours.is_closed? 'Cerrado':'Abierto'} {dateInfo.is_special? '(especial)':''}</p>
          {!dateInfo.effective_hours.is_closed && (
            <p><span className="font-medium">Horario:</span> {dateInfo.effective_hours.open_time?.slice(0,5)} - {dateInfo.effective_hours.close_time?.slice(0,5)}</p>
          )}
          {dateInfo.special_hours && <p className="text-xs text-gray-500">{dateInfo.special_hours.description}</p>}
        </div>
      )}
    </div>
  )
} 