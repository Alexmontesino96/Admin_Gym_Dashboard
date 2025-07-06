'use client'

import { useState, useEffect } from 'react'
import { eventsAPI } from '@/lib/api'
import { CalendarDaysIcon, PlusIcon, ClockIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function SpecialDaysClient(){
  const [specialDays,setSpecialDays]=useState<any[]>([])
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState<string|null>(null)
  const [showForm,setShowForm]=useState(false)
  const [formData,setFormData]=useState({
    date:'',
    is_closed:false,
    open_time:'',
    close_time:'',
    description:''
  })
  const [formLoading,setFormLoading]=useState(false)
  const [formError,setFormError]=useState<string|null>(null)
  const [showToast, setShowToast] = useState(false)

  const loadSpecialDays=async()=>{
    try{
      setLoading(true)
      setError(null)
      const data=await eventsAPI.getSpecialDays({upcoming_only:true,limit:50})
      setSpecialDays(data)
    }catch(e:any){
      console.error('Error cargando días especiales:', e)
      setError('Error al cargar días especiales')
      setSpecialDays([])
    }finally{setLoading(false)}
  }

  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)

    try{
      // Validaciones
      if(!formData.date){
        setFormError('La fecha es requerida')
        return
      }

      if(!formData.is_closed){
        if(!formData.open_time || !formData.close_time){
          setFormError('Los horarios son requeridos cuando el día está abierto')
          return
        }
        if(formData.open_time >= formData.close_time){
          setFormError('La hora de cierre debe ser posterior a la de apertura')
          return
        }
      }

      const payload:any={
        date:formData.date,
        is_closed:formData.is_closed
      }

      if(!formData.is_closed){
        payload.open_time=formData.open_time
        payload.close_time=formData.close_time
      }

      if(formData.description.trim()){
        payload.description=formData.description.trim()
      }

      await eventsAPI.createSpecialDay(payload)
      
      // Resetear formulario y recargar datos
      setFormData({date:'',is_closed:false,open_time:'',close_time:'',description:''})
      setShowForm(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      await loadSpecialDays()
      
    }catch(e:any){
      console.error('Error creando día especial:', e)
      if(e.message?.includes('409')){
        setFormError('Ya existe un día especial para esta fecha. Use la opción de sobrescribir si desea reemplazarlo.')
      }else{
        setFormError(e.message||'Error al crear día especial')
      }
    }finally{
      setFormLoading(false)
    }
  }

  const resetForm=()=>{
    setFormData({date:'',is_closed:false,open_time:'',close_time:'',description:''})
    setFormError(null)
    setShowForm(false)
  }

  useEffect(()=>{loadSpecialDays()},[])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Error global */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="flex justify-end">
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 shadow-sm"
        >
          {showForm ? (
            <>
              <XMarkIcon className="w-5 h-5 mr-2" />
              Cancelar
            </>
          ) : (
            <>
              <PlusIcon className="w-5 h-5 mr-2" />
              Añadir día especial
            </>
          )}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Crear día especial</h2>
            
            {formError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{formError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e)=>setFormData({...formData,date:e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_closed}
                    onChange={(e)=>setFormData({...formData,is_closed:e.target.checked,open_time:'',close_time:''})}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">Día cerrado</span>
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  Marca esta opción si el gimnasio permanecerá cerrado todo el día
                </p>
              </div>

              {!formData.is_closed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="open_time" className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de apertura
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        id="open_time"
                        value={formData.open_time}
                        onChange={(e)=>setFormData({...formData,open_time:e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={!formData.is_closed}
                      />
                      <ClockIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="close_time" className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de cierre
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        id="close_time"
                        value={formData.close_time}
                        onChange={(e)=>setFormData({...formData,close_time:e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={!formData.is_closed}
                      />
                      <ClockIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción <span className="text-gray-400">(opcional)</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e)=>setFormData({...formData,description:e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Ej: Día festivo, evento especial, mantenimiento, etc."
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading} 
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl disabled:opacity-50 transition-colors duration-200 shadow-sm"
                >
                  {formLoading ? 'Creando...' : 'Crear día especial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de días especiales */}
      {specialDays.filter(day => !day.description?.includes('Aplicado desde plantilla')).length === 0 && !error ? (
        <div className="text-center py-12">
          <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay días especiales</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza añadiendo tu primer día especial.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {specialDays
            .filter(day => !day.description?.includes('Aplicado desde plantilla'))
            .map(day => {
            const date = new Date(day.date)
            const isToday = date.toDateString() === new Date().toDateString()
            const isPast = date < new Date() && !isToday
            
            return (
              <div 
                key={day.id} 
                className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 overflow-hidden ${
                  isToday 
                    ? 'border-blue-200 ring-2 ring-blue-100' 
                    : isPast 
                    ? 'border-gray-200 opacity-75' 
                    : 'border-gray-100 hover:shadow-md'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {date.toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {date.toLocaleDateString('es-ES', { year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {isToday && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Hoy
                        </span>
                      )}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        day.is_closed 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {day.is_closed ? 'Cerrado' : 'Abierto'}
                      </span>
                    </div>
                  </div>

                  {!day.is_closed && (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <span>
                          {day.open_time?.slice(0, 5) || '—'} - {day.close_time?.slice(0, 5) || '—'}
                        </span>
                      </div>
                    </div>
                  )}

                  {day.description && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{day.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Toast de éxito */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-sm font-medium text-green-800">
              Día especial creado exitosamente
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 