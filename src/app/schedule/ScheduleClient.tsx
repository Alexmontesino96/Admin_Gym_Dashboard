'use client'

import React, { useState, useEffect } from 'react'
import { eventsAPI } from '@/lib/api'
import { getUsersAPI } from '@/lib/api'
import { CalendarIcon, ClockIcon, MapPinIcon, UserGroupIcon, CheckCircleIcon, XCircleIcon, UserIcon, ChevronLeftIcon, ChevronRightIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function ScheduleClient() {
  const [activeTab, setActiveTab] = useState<'blank' | 'categories' | 'classes' | 'sessions' | 'gymhours'>('blank')
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal creación
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', color: '', icon: '', is_active: true })
  const [saving, setSaving] = useState(false)
  // Notificación de éxito
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [notificationColor, setNotificationColor] = useState<'green' | 'red'>('green')

  // Estados para edición
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const [editFormData, setEditFormData] = useState({ name: '', description: '', color: '', icon: '', is_active: true })
  const [updating, setUpdating] = useState(false)

  // Modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)

  // Clases
  const [classesList, setClassesList] = useState<any[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all') // valores: 'all', 'enum:cardio', 'custom:12'
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')

  // Modal creación de clase
  const [showCreateClassModal, setShowCreateClassModal] = useState(false)
  const baseCategories = [
    { value: 'cardio', label: 'Cardio', icon: '🏃‍♂️', color: '#ef4444' },
    { value: 'strength', label: 'Fuerza', icon: '💪', color: '#4f46e5' },
    { value: 'flexibility', label: 'Flexibilidad', icon: '🤸‍♂️', color: '#f59e0b' },
    { value: 'hiit', label: 'HIIT', icon: '⚡️', color: '#ec4899' },
    { value: 'yoga', label: 'Yoga', icon: '🧘‍♂️', color: '#10b981' },
    { value: 'pilates', label: 'Pilates', icon: '🧘‍♀️', color: '#8b5cf6' },
    { value: 'functional', label: 'Funcional', icon: '🏋️‍♂️', color: '#0ea5e9' },
    { value: 'other', label: 'Otra', icon: '🏷️', color: '#6b7280' },
  ]

  const [classFormData, setClassFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    max_capacity: 20,
    difficulty_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    category_enum: 'other',
    category_id: undefined as number | undefined,
    is_active: true,
  })
  const [savingClass, setSavingClass] = useState(false)

  // Estados edición clase
  const [showEditClassModal, setShowEditClassModal] = useState(false)
  const [editingClass, setEditingClass] = useState<any | null>(null)
  const [editClassData, setEditClassData] = useState({
    name: '',
    description: '',
    duration: 60,
    max_capacity: 20,
    difficulty_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    category_enum: 'other',
    category_id: undefined as number | undefined,
    is_active: true,
  })
  const [updatingClass, setUpdatingClass] = useState(false)

  // Eliminar clase
  const [showDeleteClassModal, setShowDeleteClassModal] = useState(false)
  const [deleteClassTarget, setDeleteClassTarget] = useState<any | null>(null)

  // Sesiones
  const [sessionsList, setSessionsList] = useState<any[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [rangeStart,setRangeStart]=useState<Date|null>(null)
  const [rangeEnd,setRangeEnd]=useState<Date|null>(null)

  // Selector de semanas
  const [weeks, setWeeks] = useState<Date[]>([])
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0)
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(-1) // -1 = todos dentro de semana

  // edición sesión
  const [showEditSessionModal,setShowEditSessionModal]=useState(false)
  const [editSession,setEditSession]=useState<any|null>(null)
  const [savingEdit,setSavingEdit]=useState(false)
  // Eliminar sesión
  const [showDeleteSessionModal,setShowDeleteSessionModal]=useState(false)
  const [deleteSessionTarget,setDeleteSessionTarget]=useState<any|null>(null)
  const [deletingSession,setDeletingSession]=useState(false)
  // Cancelar sesión
  const [showCancelSessionModal,setShowCancelSessionModal]=useState(false)
  const [cancelSessionTarget,setCancelSessionTarget]=useState<any|null>(null)
  const [cancellingSession,setCancellingSession]=useState(false)

  // Horarios
  const [gymHours,setGymHours]=useState<any[]>([])
  const [loadingHours,setLoadingHours]=useState(false)
  const loadGymHours=async()=>{try{setLoadingHours(true);const data=await eventsAPI.getGymHoursRegular();setGymHours(data);}catch(e){console.error(e);}finally{setLoadingHours(false)}}

  // Horario por día
  const [selectedHoursDayIdx,setSelectedHoursDayIdx]=useState<number>(-1) // -1 = todos los días
  const loadGymHoursByDay=async(day:number)=>{
    try{
      setLoadingHours(true)
      const data=await eventsAPI.getGymHoursByDay(day)
      setGymHours(data ? [data] : [])
    }catch(e){console.error(e)}finally{setLoadingHours(false)}
  }

  const generateWeeks = (baseDate: Date, count: number = 8) => {
    const monday = new Date(baseDate)
    monday.setDate(monday.getDate() - ((monday.getDay()+6)%7)) // Lunes europeo
    monday.setHours(0,0,0,0) // Normalizar a medianoche
    const arr:Date[] = []
    for (let i=0; i<count; i++){
      const d = new Date(monday)
      d.setDate(monday.getDate()+i*7)
      d.setHours(0,0,0,0)
      arr.push(d)
    }
    return arr
  }

  const daysShort = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

  // Crear sesión
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false)
  const [sessionFormData, setSessionFormData] = useState({
    class_id: undefined as number | undefined,
    trainer_id: undefined as number | undefined,
    start_time: '',
    end_time: '' as string | '', // opcional
    room: '',
    status: 'scheduled' as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
    is_recurring: false,
    recurrence_pattern: '',
    override_capacity: '' as string | number ,
    override_enabled: false,
    notes: '',
  })
  const [savingSession, setSavingSession] = useState(false)
  const [trainers, setTrainers] = useState<any[]>([])
  const [loadingTrainers, setLoadingTrainers] = useState(false)

  // Detalle sesión
  const [showSessionDetailModal, setShowSessionDetailModal] = useState(false)
  const [detailSession, setDetailSession] = useState<any | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailRenderJSX, setDetailRenderJSX] = useState<React.ReactElement | null>(null)

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await eventsAPI.getCategories()
      setCategories(data)
    } catch (err: any) {
      setError('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  const loadClasses = async () => {
    try {
      setLoadingClasses(true)
      let data: any[] = []
      if (categoryFilter.startsWith('enum:')) {
        const enumVal = categoryFilter.split(':')[1]
        data = await eventsAPI.getClassesByCategory(enumVal)
      } else if (categoryFilter.startsWith('custom:')) {
        // no endpoint, filtrar local tras obtener todas
        data = await eventsAPI.getClasses(true)
        const cid = parseInt(categoryFilter.split(':')[1])
        data = data.filter(c=>c.category_id===cid)
      } else if (difficultyFilter !== 'all') {
        data = await eventsAPI.getClassesByDifficulty(difficultyFilter as any)
      } else {
        data = await eventsAPI.getClasses(true)
      }

      // aplicar filtro de dificultad restante en frontend si ambos filtros activos y categoría custom
      if (difficultyFilter !== 'all') {
        data = data.filter(c => c.difficulty_level === difficultyFilter)
      }
      setClassesList(data)
    } catch (err) {
      console.error('Error al cargar clases:', err)
      // No mostrar modal global; minimal handling.
    } finally {
      setLoadingClasses(false)
    }
  }

  const formatYMD=(d:Date)=>d.toISOString().slice(0,10)

  const fetchSessionsInRange=async(start:Date,end:Date)=>{
    try{
      setLoadingSessions(true)
      console.log('[DEBUG] Solicitando sesiones', formatYMD(start), '->', formatYMD(end))
      const data=await eventsAPI.getSessionsByDateRangeWithTimezone(formatYMD(start),formatYMD(end),{limit:500})
      console.log('[DEBUG] Sesiones recibidas:', data.length)
      setSessionsList(data)
      setRangeStart(start); setRangeEnd(end)
      if(data.length>0 && weeks.length===0){
        setWeeks(generateWeeks(start))
        setSelectedWeekIdx(0); setSelectedDayIdx(-1)
      }
      if(trainers.length===0) loadTrainers()
    }catch(err){console.error('Error cargando sesiones:',err)}
    finally{setLoadingSessions(false)}
  }

  const ensureWeekInRange=async(weekDate:Date)=>{
    if(!rangeStart||!rangeEnd||weekDate<rangeStart||weekDate>rangeEnd){
      const newStart=new Date(weekDate)
      newStart.setDate(newStart.getDate()-14)
      const newEnd=new Date(weekDate)
      newEnd.setDate(newEnd.getDate()+30)
      await fetchSessionsInRange(newStart,newEnd)
    }
  }

  const loadSessions = async () => {
    try {
      setLoadingSessions(true)
      const data = await eventsAPI.getSessions()
      setSessionsList(data)
      if (data.length>0 && weeks.length===0){
        setWeeks(generateWeeks(new Date(data[0].session? data[0].session.start_time : data[0].start_time)))
        setSelectedWeekIdx(0)
        setSelectedDayIdx(-1)
      }
      if (trainers.length === 0) {
        await loadTrainers()
      }
    } catch (err) {
      console.error('Error cargando sesiones:', err)
    } finally {
      setLoadingSessions(false)
    }
  }

  const loadTrainers = async () => {
    try {
      setLoadingTrainers(true)
      const data = await getUsersAPI.getGymPublicParticipants({ role: 'TRAINER' })
      setTrainers(data)
    } catch (err) {
      console.error('Error cargando entrenadores', err)
    } finally {
      setLoadingTrainers(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    try {
      setSaving(true)
      await eventsAPI.createCategory(formData)
      setNotificationColor('green')
      setSuccessMessage('Categoría creada exitosamente')
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
        setSuccessMessage('')
      }, 4000)
      setShowCreateModal(false)
      setFormData({ name: '', description: '', color: '', icon: '', is_active: true })
      loadCategories()
    } catch (err: any) {
      setError('Error creando categoría')
    } finally {
      setSaving(false)
    }
  }

  // Abrir modal de edición
  const openEditModal = (cat: any) => {
    setEditingCategory(cat)
    setEditFormData({
      name: cat.name || '',
      description: cat.description || '',
      color: cat.color || '',
      icon: cat.icon || '',
      is_active: cat.is_active,
    })
    setError(null)
    setShowEditModal(true)
  }

  // Guardar cambios de categoría
  const handleUpdate = async () => {
    if (!editingCategory) return

    if (!editFormData.name.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    try {
      setUpdating(true)

      // Solo enviar campos que cambian
      const changed: any = {}
      if (editFormData.name !== editingCategory.name) changed.name = editFormData.name
      if (editFormData.description !== editingCategory.description) changed.description = editFormData.description
      if (editFormData.color !== editingCategory.color) changed.color = editFormData.color
      if (editFormData.icon !== editingCategory.icon) changed.icon = editFormData.icon
      if (editFormData.is_active !== editingCategory.is_active) changed.is_active = editFormData.is_active

      if (Object.keys(changed).length === 0) {
        setShowEditModal(false)
        return
      }

      const updatedCat = await eventsAPI.updateCategory(editingCategory.id, changed)

      // Actualizar lista
      setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c))

      // Notificación de éxito
      setNotificationColor('green')
      setSuccessMessage('Categoría actualizada exitosamente')
      setShowSuccessMessage(true)
      setTimeout(() => { setShowSuccessMessage(false); setSuccessMessage('') }, 4000)

      setShowEditModal(false)
    } catch (err: any) {
      console.error('Error actualizando categoría:', err)
      setError('Error actualizando categoría')
    } finally {
      setUpdating(false)
    }
  }

  // Iniciar flujo de eliminación: abrir modal
  const confirmDeleteCategory = (cat: any) => {
    setDeleteTarget(cat)
    setShowDeleteModal(true)
  }

  // Ejecutar eliminación tras confirmación
  const executeDeleteCategory = async () => {
    if (!deleteTarget) return
    try {
      setUpdating(true)
      await eventsAPI.deleteCategory(deleteTarget.id)
      // Refrescar lista
      loadCategories()
      // Notificación
      setNotificationColor('red')
      setSuccessMessage('Categoría eliminada/desactivada exitosamente')
      setShowSuccessMessage(true)
      setTimeout(() => { setShowSuccessMessage(false); setSuccessMessage('') }, 4000)
    } catch (err: any) {
      console.error('Error eliminando categoría:', err)
      setError('Error eliminando categoría')
    } finally {
      setUpdating(false)
      setShowDeleteModal(false)
      setDeleteTarget(null)
    }
  }

  const handleCreateClass = async () => {
    // Validaciones
    if (!classFormData.name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    if (classFormData.duration <= 0 || classFormData.max_capacity <= 0) {
      setError('Duración y capacidad deben ser mayores a 0')
      return
    }
    try {
      setSavingClass(true)
      const payload: any = { ...classFormData }
      // limpiar campos opcionales
      if (!payload.description) delete payload.description
      if (!payload.category_id) delete payload.category_id
      if (payload.category_id) {
        delete payload.category_enum
      } else {
        // sin categoría personalizada, aseguramos enum
        if (!payload.category_enum) payload.category_enum = 'other'
      }

      const newClass = await eventsAPI.createClass(payload)
      setClassesList(prev => [newClass, ...prev])

      // Notificación éxito
      setNotificationColor('green')
      setSuccessMessage('Clase creada exitosamente')
      setShowSuccessMessage(true)
      setTimeout(() => { setShowSuccessMessage(false); setSuccessMessage('') }, 4000)

      setShowCreateClassModal(false)
      setClassFormData({ name: '', description: '', duration: 60, max_capacity: 20, difficulty_level: 'beginner', category_enum: 'other', category_id: undefined, is_active: true })
    } catch (err: any) {
      console.error('Error creando clase:', err)
      setError('Error creando clase')
    } finally {
      setSavingClass(false)
    }
  }

  // Abrir modal edición clase
  const openEditClassModal = (cls: any) => {
    setEditingClass(cls)
    setEditClassData({
      name: cls.name,
      description: cls.description || '',
      duration: cls.duration,
      max_capacity: cls.max_capacity,
      difficulty_level: cls.difficulty_level,
      category_enum: cls.category_enum || 'other',
      category_id: cls.category_id || undefined,
      is_active: cls.is_active,
    })
    setShowEditClassModal(true)
    setError(null)
  }

  const handleUpdateClass = async () => {
    if (!editingClass) return
    // Validaciones
    if (!editClassData.name.trim()) { setError('El nombre es obligatorio'); return }
    if (editClassData.duration <= 0 || editClassData.max_capacity <= 0) { setError('Duración y capacidad deben ser mayores a 0'); return }

    try {
      setUpdatingClass(true)
      // preparar payload con campos cambiados
      const changed: any = {}
      if (editClassData.name !== editingClass.name) changed.name = editClassData.name
      if (editClassData.description !== (editingClass.description || '')) changed.description = editClassData.description
      if (editClassData.duration !== editingClass.duration) changed.duration = editClassData.duration
      if (editClassData.max_capacity !== editingClass.max_capacity) changed.max_capacity = editClassData.max_capacity
      if (editClassData.difficulty_level !== editingClass.difficulty_level) changed.difficulty_level = editClassData.difficulty_level
      if ((editClassData.category_id || null) !== (editingClass.category_id || null)) {
        if (editClassData.category_id) {
          changed.category_id = editClassData.category_id
          changed.category_enum = undefined
        } else {
          changed.category_enum = editClassData.category_enum
          changed.category_id = undefined
        }
      }
      if (editClassData.is_active !== editingClass.is_active) changed.is_active = editClassData.is_active

      if (Object.keys(changed).length === 0) { setShowEditClassModal(false); return }

      const updated = await eventsAPI.updateClass(editingClass.id, changed)

      // actualizar lista
      setClassesList(prev => prev.map(c => c.id === updated.id ? updated : c))

      setNotificationColor('green')
      setSuccessMessage('Clase actualizada exitosamente')
      setShowSuccessMessage(true)
      setTimeout(() => { setShowSuccessMessage(false); setSuccessMessage('') }, 4000)

      setShowEditClassModal(false)
    } catch (err: any) {
      console.error('Error actualizando clase:', err)
      setError('Error actualizando clase')
    } finally {
      setUpdatingClass(false)
    }
  }

  const confirmDeleteClass = (cls: any) => {
    setDeleteClassTarget(cls)
    setShowDeleteClassModal(true)
  }

  const executeDeleteClass = async () => {
    if (!deleteClassTarget) return
    try {
      setUpdatingClass(true)
      const res = await eventsAPI.deleteClass(deleteClassTarget.id)
      // actualizar lista
      setClassesList(prev => prev.filter(c => c.id !== deleteClassTarget.id))

      // Notificación roja
      setNotificationColor('red')
      setSuccessMessage('Clase eliminada/desactivada exitosamente')
      setShowSuccessMessage(true)
      setTimeout(() => { setShowSuccessMessage(false); setSuccessMessage('') }, 4000)

    } catch (err: any) {
      console.error('Error eliminando clase:', err)
      setError('Error eliminando clase')
    } finally {
      setUpdatingClass(false)
      setShowDeleteClassModal(false)
      setDeleteClassTarget(null)
    }
  }

  const handleCreateSession = async () => {
    if (!sessionFormData.class_id || !sessionFormData.trainer_id || !sessionFormData.start_time) {
      setError('Clase, entrenador y hora de inicio son obligatorios');
      return;
    }
    try {
      setSavingSession(true);
      const toApiDate = (val:string)=>{
        if(val.endsWith('Z')) return val
        if(val.length===16) return `${val}:00Z`
        if(val.length===19) return `${val}Z`
        return val
      }

      const payload: any = {
        class_id: sessionFormData.class_id,
        trainer_id: sessionFormData.trainer_id,
        start_time: toApiDate(sessionFormData.start_time),
        status: sessionFormData.status,
      };

      if(sessionFormData.end_time){ payload.end_time = toApiDate(sessionFormData.end_time) }
      if(sessionFormData.room) payload.room = sessionFormData.room
      if(sessionFormData.is_recurring!==undefined) payload.is_recurring = sessionFormData.is_recurring
      if(sessionFormData.recurrence_pattern) payload.recurrence_pattern = sessionFormData.recurrence_pattern
      if(sessionFormData.override_enabled && sessionFormData.override_capacity!==''){ payload.override_capacity = Number(sessionFormData.override_capacity) }
      if(sessionFormData.notes) payload.notes = sessionFormData.notes

      const newSes = await eventsAPI.createSession(payload);
      setSessionsList(prev => [newSes, ...prev]);
      setNotificationColor('green');
      setSuccessMessage('Sesión creada exitosamente');
      setShowSuccessMessage(true);
      setTimeout(()=>{setShowSuccessMessage(false);setSuccessMessage('')},4000);
      setShowCreateSessionModal(false);
      setSessionFormData({ class_id: undefined, trainer_id: undefined, start_time: '', end_time:'', room: '', status:'scheduled', is_recurring:false, recurrence_pattern:'', override_capacity:'', override_enabled:false, notes:'' });
    } catch(err:any){
      console.error('Error creando sesión',err);
      setNotificationColor('red')
      setSuccessMessage(`Error creando sesión: ${err?.message||''}`)
      setShowSuccessMessage(true)
      setTimeout(()=>{setShowSuccessMessage(false);setSuccessMessage('')},4000)
    } finally { setSavingSession(false); }
  }

  useEffect(() => {
    if (activeTab === 'categories' && categories.length === 0) {
      loadCategories()
    }
    if (activeTab === 'classes') {
      loadClasses()
    }
    if (activeTab === 'sessions') {
      const start=new Date(); start.setDate(start.getDate()-14); start.setHours(0,0,0,0)
      const end=new Date(); end.setDate(end.getDate()+30); end.setHours(0,0,0,0)
      fetchSessionsInRange(start,end)
    }
    if(activeTab==='gymhours') { setSelectedHoursDayIdx(-1); loadGymHours() }
  }, [activeTab])

  // Seleccionar semana/día actuales cuando se cargan las semanas
  useEffect(()=>{
    if(activeTab!=='sessions' || weeks.length===0) return
    const today=new Date(); today.setHours(0,0,0,0)
    // Obtener lunes de esta semana
    const monday=new Date(today); monday.setDate(today.getDate()-((today.getDay()+6)%7))
    monday.setHours(0,0,0,0)

    let idx=weeks.findIndex(w=>w.getTime()===monday.getTime())
    let wkArr=[...weeks]
    if(idx===-1){
      // si hoy es antes del primer elemento, añade al frente; si después, al final
      while(monday<wkArr[0]){
        const nw=new Date(wkArr[0]); nw.setDate(nw.getDate()-7); nw.setHours(0,0,0,0);
        wkArr=[nw,...wkArr]
      }
      while(monday>wkArr[wkArr.length-1]){
        const nw=new Date(wkArr[wkArr.length-1]); nw.setDate(nw.getDate()+7); nw.setHours(0,0,0,0);
        wkArr=[...wkArr,nw]
      }
      idx=wkArr.findIndex(w=>w.getTime()===monday.getTime())
      setWeeks(wkArr)
    }
    setSelectedWeekIdx(idx)
    const dayIdx=(today.getDay()+6)%7
    setSelectedDayIdx(dayIdx)
  },[weeks,activeTab])

  // Actualizar cuando cambia filtro
  useEffect(()=>{
    if (activeTab==='classes') loadClasses()
  }, [categoryFilter, difficultyFilter])

  // Cargar entrenadores al abrir modal creación de sesión
  useEffect(()=>{
    if (showCreateSessionModal && trainers.length===0) {
      loadTrainers();
    }
  }, [showCreateSessionModal])

  const getTrainerName = (id:number)=>{
    const t = trainers.find(tr=>tr.id===id)
    if (!t) return `Entrenador ID ${id}`
    return `${t.first_name || ''} ${t.last_name || ''}`.trim() || `Entrenador ID ${id}`
  }

  const calcDurationMinutes = (ses: any, clsFallback?: any): number => {
    if (ses.end_time && ses.start_time) {
      const diff = (new Date(ses.end_time).getTime() - new Date(ses.start_time).getTime()) / 60000
      if (!isNaN(diff) && diff > 0) return Math.round(diff)
    }
    // Fallback a duración de la clase asociada si existe
    const cls = clsFallback || classesList.find(c => c.id === ses.class_id) || ses.class || ses.class_definition
    if (cls && cls.duration) return cls.duration
    return 0
  }

  const getCategoryLabel = (cls: any): string => {
    if (!cls) return ''
    if (cls.category_id) {
      const cat = categories.find(c => c.id === cls.category_id)
      return cat ? cat.name : 'Personalizada'
    }
    const std = baseCategories.find(b => b.value === cls.category_enum)
    return std ? std.label : cls.category_enum
  }

  const buildDetailJSX = (detail:any): React.ReactElement => {
    const cls:any = detail.class_info || detail.class || detail.class_definition || classesList.find((c:any)=>c.id===detail.session?.class_id)
    const ses:any = detail.session || detail
    const registered = detail.registered_count ?? 0
    const capacity = ses.override_capacity || cls?.max_capacity || 0
    const percent = capacity ? Math.min(100, Math.round((registered / capacity) * 100)) : 0
    const statusBadge = ses.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : ses.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'

    const start = new Date(ses.start_time_local || ses.start_time)
    const end = (ses.end_time_local || ses.end_time) ? new Date(ses.end_time_local || ses.end_time) : null
    const timeRange = `${start.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})}${end ? ' - '+end.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true}) : ''}`

    return (
      <div className="space-y-6 text-sm text-gray-700">
        {/* Sesión */}
        <section>
          <h4 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-2"><CalendarIcon className="w-5 h-5"/> Sesión</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-gray-500">Fecha:</span><span>{new Date(ses.start_time).toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short'})}</span>
            <span className="text-gray-500">Hora:</span><span>{timeRange}</span>
            <span className="text-gray-500">Duración:</span><span>{calcDurationMinutes(ses, cls)} min</span>
            <span className="text-gray-500">Sala:</span><span>{ses.room || '—'}</span>
            <span className="text-gray-500">Entrenador:</span><span>{getTrainerName(ses.trainer_id)}</span>
            <span className="text-gray-500">Estado:</span><span className={`inline-block px-2 py-0.5 rounded-full text-xs ${statusBadge}`}>{ses.status}</span>
          </div>
        </section>

        {/* Clase */}
        <section>
          <h4 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-2"><ClockIcon className="w-5 h-5"/> Clase</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-gray-500">Nombre:</span><span>{cls?.name || detail.class_name || '—'}</span>
            {cls && (<><span className="text-gray-500">Categoría:</span><span>{cls.custom_category ? cls.custom_category.name : getCategoryLabel(cls)}</span>
            <span className="text-gray-500">Dificultad:</span><span>{cls.difficulty_level}</span>
            <span className="text-gray-500">Capacidad máx.:</span><span>{capacity}</span>
            <span className="text-gray-500 col-span-2">Descripción:</span><span className="col-span-2">{cls.description || '—'}</span></>)}
          </div>
        </section>

        {/* Cupos */}
        {capacity>0 && (<section>
          <h4 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-2"><UserGroupIcon className="w-5 h-5"/> Cupos</h4>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div style={{width: `${percent}%`}} className={`h-full ${percent===100? 'bg-red-500' : 'bg-green-500'}`}></div>
            </div>
            <span>{registered}/{capacity}</span>
          </div>
          <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
            {detail.is_full ? <><XCircleIcon className="w-4 h-4 text-red-500"/> <span>Sesión llena</span></> : <><CheckCircleIcon className="w-4 h-4 text-green-500"/> <span>Espacios disponibles</span></>}
          </div>
        </section>)}

        {/* Notas */}
        {ses.notes && (
          <section>
            <h4 className="flex items-center gap-2 text-base font-semibold text-gray-900 mb-2"><MapPinIcon className="w-5 h-5"/> Notas</h4>
            <p className="whitespace-pre-wrap text-gray-700 text-sm">{ses.notes}</p>
          </section>
        )}
      </div>
    )
  }

  const openSessionDetail = (item: any) => {
    setShowSessionDetailModal(true)
    setLoadingDetail(false)
    setDetailSession(item)
    setDetailRenderJSX(buildDetailJSX(item))
    setEditSession(null)
    if (categories.length === 0) loadCategories()
  }

  const formatWeekLabel = (start:Date)=>{
    const end = new Date(start)
    end.setDate(start.getDate()+6)
    const opts:{day:'numeric',month:'short'} = {day:'numeric',month:'short'} as any
    return `${start.toLocaleDateString('en-GB',opts)} - ${end.toLocaleDateString('en-GB',opts)}`
  }

  const filteredSessions = sessionsList.filter(it=>{
    const s = it.session ?? it
    const start = new Date(s.start_time)
    if (weeks.length===0) return true
    const weekStart = weeks[selectedWeekIdx]
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate()+7)
    // weekStart y weekEnd ya están a 00:00
    if (!(start>=weekStart && start<weekEnd)) return false
    if (selectedDayIdx===-1) return true
    const dayIndex = (start.getDay()+6)%7 // Monday=0
    return dayIndex===selectedDayIdx
  })

  const formatDateTimeLocal = (d:Date)=>{
    const offset = d.getTimezoneOffset()
    const local = new Date(d.getTime() - offset*60000)
    return local.toISOString().slice(0,16)
  }

  const openCreateSessionModalFn = () => {
    // definir fecha basada en selector
    let dt = new Date()
    if (selectedDayIdx>-1 && weeks.length>selectedWeekIdx){
      const base = new Date(weeks[selectedWeekIdx])
      base.setDate(base.getDate()+selectedDayIdx)
      base.setHours(14,0,0,0) // 2:00 PM por defecto
      dt = base
    }
    setSessionFormData({
      class_id: undefined,
      trainer_id: undefined,
      start_time: formatDateTimeLocal(dt),
      end_time: '',
      room: '',
      status: 'scheduled',
      is_recurring: false,
      recurrence_pattern: '',
      override_capacity: '',
      override_enabled: false,
      notes: '',
    })
    setShowCreateSessionModal(true)
    setError(null)
    if (classesList.length === 0) loadClasses()
    if (trainers.length === 0) loadTrainers()
  }

  // Edición horario
  const [showEditHoursModal,setShowEditHoursModal]=useState(false)
  const [editHoursData,setEditHoursData]=useState<any|null>(null)
  const [hoursFormData,setHoursFormData]=useState<{open_time:string, close_time:string, is_closed:boolean}>({open_time:'',close_time:'',is_closed:false})
  const [savingHours,setSavingHours]=useState(false)

  const openEditHoursModal=(h:any)=>{
    setEditHoursData(h)
    setHoursFormData({
      open_time:h.open_time? h.open_time.slice(0,5):'09:00',
      close_time:h.close_time? h.close_time.slice(0,5):'21:00',
      is_closed:h.is_closed
    })
    setShowEditHoursModal(true)
  }

  const handleSaveHours=async()=>{
    if(!editHoursData) return
    try{
      setSavingHours(true)
      const payload: any = { is_closed: hoursFormData.is_closed }
      if(!hoursFormData.is_closed){
        payload.open_time = hoursFormData.open_time
        payload.close_time = hoursFormData.close_time
      }
      await eventsAPI.updateGymHoursByDay(editHoursData.day_of_week, payload)
      setShowEditHoursModal(false)
      setEditHoursData(null)
      await loadGymHours()
    }catch(e){console.error('Error actualizando horario',e)}
    finally{setSavingHours(false)}
  }

  // Consulta de horario por fecha
  const [selectedDateStr,setSelectedDateStr]=useState('')
  const [dateInfo,setDateInfo]=useState<any|null>(null)
  const [loadingDateInfo,setLoadingDateInfo]=useState(false)

  const fetchDateInfo=async(dateStr:string)=>{
    try{
      setLoadingDateInfo(true)
      const data=await eventsAPI.getGymHoursByDate(dateStr)
      setDateInfo(data)
    }catch(e){console.error(e);setDateInfo(null)}
    finally{setLoadingDateInfo(false)}
  }

  // Aplicar plantilla a rango
  const [showApplyDefaultsModal,setShowApplyDefaultsModal]=useState(false)
  const [rangeForm,setRangeForm]=useState({start_date:'',end_date:'',overwrite:false})
  const [applyingDefaults,setApplyingDefaults]=useState(false)
  const isRangeValid = rangeForm.start_date && rangeForm.end_date && rangeForm.end_date >= rangeForm.start_date

  const handleApplyDefaults=async()=>{
    if(!rangeForm.start_date||!rangeForm.end_date) return
    try{
      setApplyingDefaults(true)
      await eventsAPI.applyGymHoursDefaults(rangeForm.start_date,rangeForm.end_date,rangeForm.overwrite)
      setShowApplyDefaultsModal(false)
      await loadGymHours()
    }catch(e){console.error('Error aplicando plantilla',e)}
    finally{setApplyingDefaults(false)}
  }

  return (
    <div className="space-y-6">
      {/* Navegación de pestañas */}
      <div className="bg-white rounded-lg shadow">
        <nav className="flex space-x-8 px-6">
                  <button
            onClick={() => setActiveTab('blank')}
            className={`py-4 text-sm font-medium border-b-2 ${
              activeTab === 'blank' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-4 text-sm font-medium border-b-2 ${
              activeTab === 'categories' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Categorías
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`py-4 text-sm font-medium border-b-2 ${
              activeTab === 'classes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Clases
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-4 text-sm font-medium border-b-2 ${
              activeTab === 'sessions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sesiones
          </button>
          <Link
            href="/schedule/horarios"
            className="py-4 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
          >
            Horarios
          </Link>
        </nav>
      </div>

      {/* Notificación de éxito */}
      {showSuccessMessage && (
        <div className={`fixed top-20 right-4 z-50 max-w-sm w-full ${notificationColor === 'green' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} border rounded-lg p-4 shadow-lg`}>
          <div className="flex items-center">
            {notificationColor === 'green' ? (
              <CheckCircleIcon className="h-5 w-5 mr-3" />
            ) : (
              <XCircleIcon className="h-5 w-5 mr-3" />
            )}
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div>
          {loading ? (
            <div className="text-center text-gray-500">Cargando categorías...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => { setShowCreateModal(true); setError(null) }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow"
              >
                Nueva categoría
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Categorías por defecto */}
            {baseCategories.map(def => (
              <div key={`enum-${def.value}`} className="bg-white rounded-lg shadow p-4 flex items-start space-x-4 hover:bg-gray-50 relative opacity-90">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{backgroundColor:def.color}}>
                  <span className="text-2xl">{def.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{def.label}</h3>
                  <p className="text-sm text-gray-500">Categoría estándar</p>
                </div>
              </div>
            ))}

            {/* Categorías personalizadas */}
            {categories.map(cat => (
              <div key={cat.id} className="bg-white rounded-lg shadow p-4 flex items-start space-x-4 hover:bg-gray-50 relative">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{backgroundColor: cat.color || '#6b7280'}}>
                  {cat.icon || '🏷️'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
                  <p className="text-sm text-gray-500">{cat.description}</p>
                  {!cat.is_active && <span className="inline-block mt-1 text-xs text-red-600">Inactiva</span>}
                </div>
                {/* Icono eliminar */}
                <button
                  onClick={(e) => { e.stopPropagation(); confirmDeleteCategory(cat) }}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Eliminar categoría"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5-3h4a2 2 0 012 2v1H8V5a2 2 0 012-2z"></path>
                  </svg>
                </button>
                {/* Icono editar */}
                <button
                  onClick={(e) => { e.stopPropagation(); openEditModal(cat); }}
                  className="absolute bottom-2 right-2 text-gray-400 hover:text-gray-600"
                  title="Editar categoría"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'classes' && (
        <div>
          {/* Filtros clases */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Categoría estándar */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700 whitespace-nowrap">Categoría:</label>
              <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} className="border px-2 py-1 rounded text-sm">
                <option value="all">Todas</option>
                {baseCategories.map(c=> (<option key={`enum:${c.value}`} value={`enum:${c.value}`}>{c.label}</option>))}
                {categories.length>0 && (<optgroup label="Personalizadas">{categories.map(cat=>(<option key={`custom:${cat.id}`} value={`custom:${cat.id}`}>{cat.name}</option>))}</optgroup>)}
              </select>
            </div>

            {/* Dificultad */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700 whitespace-nowrap">Dificultad:</label>
              <select value={difficultyFilter} onChange={e=>setDifficultyFilter(e.target.value)} className="border px-2 py-1 rounded text-sm">
                <option value="all">Todas</option>
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedia</option>
                <option value="advanced">Avanzada</option>
              </select>
            </div>
          </div>
          {/* Botón Nueva clase */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { setShowCreateClassModal(true); setError(null); if (categories.length === 0) loadCategories() }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow"
            >
              Nueva clase
            </button>
          </div>

          {loadingClasses ? (
            <div className="text-center text-gray-500">Cargando clases...</div>
          ) : classesList.length === 0 ? (
            <p className="text-center text-gray-500">No hay clases disponibles</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classesList.map(cls => (
                <div key={cls.id} className="bg-white rounded-lg shadow p-4 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 truncate" title={cls.name}>{cls.name}</h3>
                    {!cls.is_active && <span className="text-xs text-red-600">Inactiva</span>}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-3 min-h-[48px]">{cls.description || 'Sin descripción'}</p>
                  <div className="text-sm text-gray-700 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Duración: {cls.duration} min</span>
                    <span>Capacidad Máx: {cls.max_capacity}</span>
                  </div>
                  <div className="text-xs text-gray-400">Dificultad: {cls.difficulty_level}</div>
                  {/* Icono eliminar clase */}
                  <button onClick={(e)=>{e.stopPropagation();confirmDeleteClass(cls)}} className="absolute top-2 right-2 text-red-500 hover:text-red-700" title="Eliminar clase">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5-3h4a2 2 0 012 2v1H8V5a2 2 0 012-2z"></path></svg>
                  </button>
                  {/* Icono editar clase */}
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditClassModal(cls) }}
                    className="absolute bottom-2 right-2 text-gray-400 hover:text-gray-600"
                    title="Editar clase"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sessions' && (
        <div>
          {/* Selector semanas */}
          <div className="flex justify-center items-center gap-4 mt-2 mb-3">
            <button onClick={()=>{
              if(selectedWeekIdx===0){
                const first=weeks[0];
                const nw=new Date(first); nw.setDate(first.getDate()-7); nw.setHours(0,0,0,0);
                setWeeks(prev=>[nw,...prev]);
              } else {
                setSelectedWeekIdx(prev=>prev-1);
              }
            }} className="p-1"><ChevronLeftIcon className="w-5 h-5"/></button>
            {weeks.slice(selectedWeekIdx,selectedWeekIdx+3).map((w,idx)=>{
              const isActive = idx===0
              return <button key={idx+selectedWeekIdx} onClick={()=>setSelectedWeekIdx(idx+selectedWeekIdx)} className={`px-4 py-1 rounded-full text-base font-medium ${isActive? 'border-b-2 border-blue-600 text-blue-600':'text-gray-600 hover:text-blue-600'}`}>{formatWeekLabel(w)}</button>
            })}
            <button onClick={()=>{
              if(selectedWeekIdx>=weeks.length-1){
                const last=weeks[weeks.length-1];
                const nw=new Date(last); nw.setDate(last.getDate()+7); nw.setHours(0,0,0,0);
                setWeeks(prev=>[...prev,nw]);
                setSelectedWeekIdx(prev=>prev+1);
              } else {
                setSelectedWeekIdx(prev=>prev+1);
              }
            }} className="p-1"><ChevronRightIcon className="w-5 h-5"/></button>
          </div>

          {/* Selector diario */}
          {weeks.length>0 && (
            <div className="flex justify-center items-center gap-2 mb-6">
              <button onClick={()=>setSelectedDayIdx(-1)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedDayIdx===-1? 'bg-blue-600 text-white':'text-gray-600 hover:text-blue-600'}`}>Todos</button>
              {daysShort.map((d,idx)=>{
                const isActive = idx===selectedDayIdx
                return <button key={d} onClick={()=>setSelectedDayIdx(idx)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${isActive? 'bg-blue-600 text-white':'text-gray-600 hover:text-blue-600'}`}>{d}</button>
              })}
            </div>)}

          {/* Botón Nueva sesión */}
          <div className="flex justify-end mb-4 -mt-4">
            <button onClick={openCreateSessionModalFn} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow">Nueva sesión</button>
          </div>

          {loadingSessions ? (
            <div className="text-center text-gray-500">Cargando sesiones...</div>
          ) : sessionsList.length === 0 ? (
            <p className="text-center text-gray-500">No hay sesiones próximas</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSessions.map(item=>{
                // Compatibilidad con nuevo formato { session, class_info }
                const s = item.session ?? item
                const c = item.class_info ?? undefined
                const start = new Date(s.start_time_local || s.start_time)
                const end = (s.end_time_local || s.end_time) ? new Date(s.end_time_local || s.end_time) : null
                const timeRange = `${start.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})}${end ? ' - '+end.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true}) : ''}`
                const statusCls = s.status==='scheduled'? 'bg-blue-100 text-blue-800' : s.status==='completed'? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                return (
                  <div key={s.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-5 flex flex-col gap-3 relative">
                    {/* icono editar */}
                    <button onClick={()=>{
                      const ses = item.session ?? item
                      setEditSession(ses)
                      if (classesList.length === 0) loadClasses()
                      if (trainers.length === 0) loadTrainers()
                      setShowEditSessionModal(true)
                    }} className="absolute bottom-2 right-10 text-gray-400 hover:text-gray-600"><PencilIcon className="w-4 h-4"/></button>
                    {/* icono cancelar */}
                    <button onClick={()=>{
                      const ses = item.session ?? item
                      setCancelSessionTarget(ses)
                      setShowCancelSessionModal(true)
                    }} className="absolute bottom-2 right-16 text-yellow-500 hover:text-yellow-600"><ExclamationTriangleIcon className="w-4 h-4"/></button>
                    {/* icono eliminar */}
                    <button onClick={()=>{
                      const ses = item.session ?? item
                      setDeleteSessionTarget(ses)
                      setShowDeleteSessionModal(true)
                    }} className="absolute bottom-2 right-2 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-gray-900 truncate" title={c?.name || item.class_name || 'Clase'}>{c?.name || item.class_name || 'Clase'}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCls}`}>{s.status}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4"/>
                      <span>{start.toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short'})}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4"/>
                      <span>{timeRange} · {calcDurationMinutes(s,c)} min</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <UserIcon className="w-4 h-4"/>
                      <span>{getTrainerName(s.trainer_id)}</span>
                    </div>
                    {/* Cupos */}
                    {c && (()=>{
                        const registered = item.registered_count ?? s.current_participants ?? 0
                        const capacity = s.override_capacity || c.max_capacity || 0
                        const percent = capacity ? Math.min(100, Math.round((registered/capacity)*100)) : 0
                        const isFull = item.is_full ?? (capacity && registered>=capacity)
                        return (
                          <section className="text-xs text-gray-600 mt-1 w-full">
                            <div className="flex items-center gap-1 font-medium mb-0.5"><UserGroupIcon className="w-4 h-4"/> Cupos</div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div style={{width:`${percent}%`}} className={`h-full ${isFull? 'bg-red-500':'bg-green-500'}`}></div>
                              </div>
                              <span>{registered}/{capacity}</span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500">
                              {isFull ? <XCircleIcon className="w-3 h-3 text-red-500"/> : <CheckCircleIcon className="w-3 h-3 text-green-500"/>}
                              <span>{isFull ? 'Sesión llena' : 'Espacios disponibles'}</span>
                            </div>
                          </section>
                        )
                      })()}
                    <button onClick={()=>openSessionDetail(item)} className="mt-auto self-start text-blue-600 hover:underline text-sm">Detalle</button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'gymhours' && (
        <div>
          {/* Selector diario para horario */}
          <div className="flex justify-center items-center gap-2 mb-4">
            <button onClick={()=>{setSelectedHoursDayIdx(-1);loadGymHours();}} className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedHoursDayIdx===-1? 'bg-blue-600 text-white':'text-gray-600 hover:text-blue-600'}`}>Todos</button>
            {daysShort.map((d,idx)=>{
              const isActive = idx===selectedHoursDayIdx
              return <button key={`hours-${idx}`} onClick={()=>{setSelectedHoursDayIdx(idx);loadGymHoursByDay(idx);}} className={`px-2 py-0.5 rounded-full text-xs font-medium ${isActive? 'bg-blue-600 text-white':'text-gray-600 hover:text-blue-600'}`}>{d}</button>
            })}
          </div>

          {loadingHours? <p className="text-center text-gray-500">Cargando horario...</p> : (
            <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Día</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Apertura</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Cierre</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Cerrado</th>
                  <th className="px-4 py-2 text-sm font-semibold text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {gymHours.map((h)=>{
                  const dayNames=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
                  return <tr key={h.id} className="border-t">
                    <td className="px-4 py-2 text-sm">{dayNames[h.day_of_week]??h.day_of_week}</td>
                    <td className="px-4 py-2 text-sm">{h.open_time?.slice(0,5)||'-'}</td>
                    <td className="px-4 py-2 text-sm">{h.close_time?.slice(0,5)||'-'}</td>
                    <td className="px-4 py-2 text-sm">{h.is_closed? <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">Cerrado</span> : <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">Abierto</span>}</td>
                    <td className="px-4 py-2 text-sm text-right">
                      <button onClick={()=>openEditHoursModal(h)} title="Editar" className="text-gray-500 hover:text-blue-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                      </button>
                    </td>
                  </tr>
                })}
              </tbody>
            </table>
          )}

          {/* Consulta por fecha */}
          <div className="mt-6 bg-white rounded-lg shadow p-4 max-w-md mx-auto">
            <h4 className="font-semibold mb-2">Consultar fecha específica</h4>
            <div className="flex items-center gap-2 mb-3">
              <input type="date" value={selectedDateStr} onChange={e=>{setSelectedDateStr(e.target.value);}} className="border px-2 py-1 rounded" />
              <button onClick={()=> selectedDateStr && fetchDateInfo(selectedDateStr)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded disabled:opacity-40" disabled={!selectedDateStr}>Ver</button>
            </div>
            {loadingDateInfo? <p className="text-sm text-gray-500">Consultando…</p> : dateInfo? (
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">Estado:</span> {dateInfo.effective_hours.is_closed? 'Cerrado':'Abierto'} {dateInfo.is_special? '(especial)':''}</p>
                {!dateInfo.effective_hours.is_closed && (
                  <p><span className="font-medium">Horario:</span> {dateInfo.effective_hours.open_time?.slice(0,5)} - {dateInfo.effective_hours.close_time?.slice(0,5)}</p>
                )}
                {dateInfo.special_hours && <p className="text-xs text-gray-500">{dateInfo.special_hours.description}</p>}
              </div>
            ): selectedDateStr && <p className="text-sm text-gray-500">Sin datos</p>}
          </div>

          {/* Acciones rango */}
          <div className="mt-6 text-center">
            <button onClick={()=>setShowApplyDefaultsModal(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow">Aplicar plantilla a rango…</button>
          </div>
        </div>
      )}

      {/* Modal crear categoría */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Crear categoría</h3>
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <div className="space-y-4">
              <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nombre" className="w-full border px-3 py-2 rounded" />
              <input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Descripción" className="w-full border px-3 py-2 rounded" />
              <input value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} placeholder="Color (hex)" className="w-full border px-3 py-2 rounded" />
              <input value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} placeholder="Icono" className="w-full border px-3 py-2 rounded" />
              <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })}/> <span>Activa</span></label>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm rounded border">Cancelar</button>
              <button onClick={handleCreate} disabled={saving} className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">{saving ? 'Guardando...' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar categoría */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Editar categoría</h3>
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <div className="space-y-4">
              <input value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} placeholder="Nombre" className="w-full border px-3 py-2 rounded" />
              <input value={editFormData.description} onChange={e => setEditFormData({ ...editFormData, description: e.target.value })} placeholder="Descripción" className="w-full border px-3 py-2 rounded" />
              <input value={editFormData.color} onChange={e => setEditFormData({ ...editFormData, color: e.target.value })} placeholder="Color (hex)" className="w-full border px-3 py-2 rounded" />
              <input value={editFormData.icon} onChange={e => setEditFormData({ ...editFormData, icon: e.target.value })} placeholder="Icono" className="w-full border px-3 py-2 rounded" />
              <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={editFormData.is_active} onChange={e => setEditFormData({ ...editFormData, is_active: e.target.checked })}/> <span>Activa</span></label>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm rounded border">Cancelar</button>
              <button onClick={() => { if (editingCategory) confirmDeleteCategory(editingCategory) }} disabled={updating} className="px-4 py-2 text-sm rounded bg-red-600 text-white disabled:opacity-50">{updating ? 'Eliminando...' : 'Eliminar'}</button>
              <button onClick={handleUpdate} disabled={updating} className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">{updating ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmación eliminar */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Eliminar categoría</h3>
            <p className="text-sm text-gray-700 mb-6">¿Seguro que deseas eliminar la categoría "<span className='font-semibold'>{deleteTarget.name}</span>"? Si está en uso por clases, se marcará como inactiva en lugar de eliminarse.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null) }} className="px-4 py-2 text-sm rounded border">Cancelar</button>
              <button onClick={executeDeleteCategory} disabled={updating} className="px-4 py-2 text-sm rounded bg-red-600 text-white disabled:opacity-50">{updating ? 'Eliminando...' : 'Eliminar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear clase */}
      {showCreateClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Crear clase</h3>
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <input value={classFormData.name} onChange={e => setClassFormData({ ...classFormData, name: e.target.value })} placeholder="Nombre" className="w-full border px-3 py-2 rounded" />
              <p className="text-xs text-gray-500">Título visible para los usuarios (ej: "Yoga Flow").</p>
              <textarea value={classFormData.description} onChange={e => setClassFormData({ ...classFormData, description: e.target.value })} placeholder="Descripción (opcional)" className="w-full border px-3 py-2 rounded" />
              <p className="text-xs text-gray-500">Breve descripción de la clase (máx. 255 caracteres).</p>
              <div className="flex space-x-3">
                <input type="number" min={1} value={classFormData.duration} onChange={e => setClassFormData({ ...classFormData, duration: parseInt(e.target.value) || 0 })} placeholder="Duración (min)" className="w-1/2 border px-3 py-2 rounded" />
                <input type="number" min={1} value={classFormData.max_capacity} onChange={e => setClassFormData({ ...classFormData, max_capacity: parseInt(e.target.value) || 0 })} placeholder="Capacidad máx" className="w-1/2 border px-3 py-2 rounded" />
              </div>
              <div className="text-xs text-gray-500">
                <span className="w-1/2">Duración total en minutos.</span>
                <span className="w-1/2">Número máximo de participantes.</span>
              </div>
              <select value={classFormData.difficulty_level} onChange={e => setClassFormData({ ...classFormData, difficulty_level: e.target.value as any })} className="w-full border px-3 py-2 rounded">
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
              <p className="text-xs text-gray-500">Nivel de condición física requerido.</p>
              {/* Selector unificado de categoría */}
              <select
                value={classFormData.category_id ? `custom:${classFormData.category_id}` : `enum:${classFormData.category_enum}`}
                onChange={e => {
                  const val = e.target.value
                  if (!val) return
                  const [type, id] = val.split(':')
                  if (type === 'enum') {
                    setClassFormData({ ...classFormData, category_enum: id as any, category_id: undefined })
                  } else {
                    setClassFormData({ ...classFormData, category_id: parseInt(id), category_enum: 'other' })
                  }
                }}
                className="w-full border px-3 py-2 rounded"
              >
                <optgroup label="Categorías estándar">
                  {baseCategories.map(c => (
                    <option key={`enum:${c.value}`} value={`enum:${c.value}`}>{c.label}</option>
                  ))}
                </optgroup>
                {categories.length > 0 && (
                  <optgroup label="Categorías personalizadas">
                    {categories.map(cat => (
                      <option key={`custom:${cat.id}`} value={`custom:${cat.id}`}>{cat.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
              <p className="text-xs text-gray-500">Elige una categoría estándar o una personalizada del gimnasio.</p>
              <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={classFormData.is_active} onChange={e => setClassFormData({ ...classFormData, is_active: e.target.checked })}/> <span>Activa</span></label>
              <p className="text-xs text-gray-500">Si se desmarca, la clase quedará oculta para reservas.</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowCreateClassModal(false)} className="px-4 py-2 text-sm rounded border">Cancelar</button>
              <button onClick={handleCreateClass} disabled={savingClass} className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">{savingClass ? 'Guardando...' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar clase */}
      {showEditClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Editar clase</h3>
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <input value={editClassData.name} onChange={e => setEditClassData({ ...editClassData, name: e.target.value })} placeholder="Nombre" className="w-full border px-3 py-2 rounded" />
              <p className="text-xs text-gray-500">Título visible para los usuarios (ej: "Yoga Flow").</p>
              <textarea value={editClassData.description} onChange={e => setEditClassData({ ...editClassData, description: e.target.value })} placeholder="Descripción (opcional)" className="w-full border px-3 py-2 rounded" />
              <p className="text-xs text-gray-500">Breve descripción de la clase (máx. 255 caracteres).</p>
              <div className="flex space-x-3">
                <input type="number" min={1} value={editClassData.duration} onChange={e => setEditClassData({ ...editClassData, duration: parseInt(e.target.value) || 0 })} placeholder="Duración (min)" className="w-1/2 border px-3 py-2 rounded" />
                <input type="number" min={1} value={editClassData.max_capacity} onChange={e => setEditClassData({ ...editClassData, max_capacity: parseInt(e.target.value) || 0 })} placeholder="Capacidad máx" className="w-1/2 border px-3 py-2 rounded" />
              </div>
              <div className="flex space-x-3 text-xs text-gray-500"><span className="w-1/2">Duración total en minutos.</span><span className="w-1/2">Número máximo de participantes.</span></div>
              <select value={editClassData.difficulty_level} onChange={e => setEditClassData({ ...editClassData, difficulty_level: e.target.value as any })} className="w-full border px-3 py-2 rounded">
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
              <p className="text-xs text-gray-500">Nivel de condición física requerido.</p>
              {/* Categoría unificada */}
              <select
                value={editClassData.category_id ? `custom:${editClassData.category_id}` : `enum:${editClassData.category_enum}`}
                onChange={e => {
                  const val = e.target.value; if (!val) return; const [type,id] = val.split(':'); if (type==='enum'){ setEditClassData({ ...editClassData, category_enum: id as any, category_id: undefined }) } else { setEditClassData({ ...editClassData, category_id: parseInt(id), category_enum: 'other' }) }
                }}
                className="w-full border px-3 py-2 rounded"
              >
                <optgroup label="Categorías estándar">
                  {baseCategories.map(c => <option key={`enum:${c.value}`} value={`enum:${c.value}`}>{c.label}</option>)}
                </optgroup>
                {categories.length>0 && (<optgroup label="Categorías personalizadas">{categories.map(cat => <option key={`custom:${cat.id}`} value={`custom:${cat.id}`}>{cat.name}</option>)}</optgroup>)}
              </select>
              <p className="text-xs text-gray-500">Elige una categoría estándar o una personalizada del gimnasio.</p>
              <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={editClassData.is_active} onChange={e => setEditClassData({ ...editClassData, is_active: e.target.checked })}/> <span>Activa</span></label>
              <p className="text-xs text-gray-500">Si se desmarca, la clase quedará oculta para reservas.</p>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowEditClassModal(false)} className="px-4 py-2 text-sm rounded border">Cancelar</button>
              <button onClick={handleUpdateClass} disabled={updatingClass} className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">{updatingClass ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmación eliminar clase */}
      {showDeleteClassModal && deleteClassTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Eliminar clase</h3>
            <p className="text-sm text-gray-700 mb-6">¿Seguro que deseas eliminar la clase "<span className='font-semibold'>{deleteClassTarget.name}</span>"? Si tiene sesiones programadas, se desactivará en lugar de eliminarse.</p>
            <div className="flex justify-end space-x-3">
              <button onClick={()=>{setShowDeleteClassModal(false);setDeleteClassTarget(null)}} className="px-4 py-2 text-sm rounded border">Cancelar</button>
              <button onClick={executeDeleteClass} disabled={updatingClass} className="px-4 py-2 text-sm rounded bg-red-600 text-white disabled:opacity-50">{updatingClass ? 'Eliminando...' : 'Eliminar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear sesión */}
      {showCreateSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Crear sesión</h3>
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Clase */}
              <select value={sessionFormData.class_id??''} onChange={e=>setSessionFormData({...sessionFormData, class_id: e.target.value? parseInt(e.target.value):undefined})} className="w-full border px-3 py-2 rounded">
                <option value="">Selecciona clase</option>
                {classesList.map(cls=> (<option key={cls.id} value={cls.id}>{cls.name}</option>))}
              </select>
              {/* Seleccionar entrenador */}
              {loadingTrainers ? <p className="text-sm text-gray-500">Cargando entrenadores...</p> : (
                <select value={sessionFormData.trainer_id??''} onChange={e=>setSessionFormData({...sessionFormData, trainer_id: e.target.value? parseInt(e.target.value):undefined})} className="w-full border px-3 py-2 rounded">
                  <option value="">Selecciona entrenador</option>
                  {trainers.map(t=> (
                    <option key={t.id} value={t.id}>{t.first_name || ''} {t.last_name || ''} (ID {t.id})</option>
                  ))}
                </select>) }
              {/* Fecha hora inicio */}
              <label className="block text-xs text-gray-600">Inicio
                <input type="datetime-local" value={sessionFormData.start_time} onChange={e=>setSessionFormData({...sessionFormData, start_time: e.target.value})} className="w-full border px-3 py-2 rounded" />
              </label>

              {/* Checkbox fin personalizado */}
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={!!sessionFormData.end_time} onChange={e=>setSessionFormData({...sessionFormData,end_time:e.target.checked?sessionFormData.start_time:''})}/>
                Establecer hora de fin manualmente
              </label>
              {sessionFormData.end_time && (
                <label className="block text-xs text-gray-600">Fin
                  <input type="datetime-local" value={sessionFormData.end_time} onChange={e=>setSessionFormData({...sessionFormData, end_time:e.target.value})} className="w-full border px-3 py-2 rounded" />
                </label>
              )}

              {/* Capacidad de clase seleccionada */}
              {sessionFormData.class_id && (()=>{
                const sel = classesList.find(c=>c.id===sessionFormData.class_id)
                if(!sel) return null
                return <p className="text-xs text-gray-500">Capacidad de la clase: {sel.max_capacity}</p>
              })()}

              {/* Override capacity */}
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={sessionFormData.override_enabled} onChange={e=>setSessionFormData({...sessionFormData, override_enabled:e.target.checked, override_capacity: e.target.checked? sessionFormData.override_capacity:''})}/> Sobrescribir capacidad
              </label>
              {sessionFormData.override_enabled && (
                <input type="number" min={0} value={sessionFormData.override_capacity} onChange={e=>setSessionFormData({...sessionFormData, override_capacity: e.target.value})} placeholder="Capacidad sobreescrita" className="w-full border px-3 py-2 rounded" />
              )}

              {/* Estado */}
              <select value={sessionFormData.status} onChange={e=>setSessionFormData({...sessionFormData,status:e.target.value as any})} className="w-full border px-3 py-2 rounded">
                <option value="scheduled">Programada</option>
                <option value="in_progress">En curso</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>

              {/* Recurrencia */}
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={sessionFormData.is_recurring} onChange={e=>setSessionFormData({...sessionFormData,is_recurring:e.target.checked})}/> Recurrente
              </label>
              {sessionFormData.is_recurring && (
                <input value={sessionFormData.recurrence_pattern} onChange={e=>setSessionFormData({...sessionFormData,recurrence_pattern:e.target.value})} placeholder="Patrón recurrencia (cron)" className="w-full border px-3 py-2 rounded" />
              )}

              {/* Notas */}
              <textarea value={sessionFormData.notes} onChange={e=>setSessionFormData({...sessionFormData,notes:e.target.value})} placeholder="Notas" className="w-full border px-3 py-2 rounded" />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={()=>setShowCreateSessionModal(false)} className="px-4 py-2 text-sm rounded border">Cancelar</button>
              <button onClick={handleCreateSession} disabled={savingSession} className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">{savingSession?'Guardando...':'Crear'}</button>
            </div>
          </div>
        </div>) }

      {/* Modal detalle sesión */}
      {showSessionDetailModal && detailSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button onClick={()=>setShowSessionDetailModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <h3 className="text-lg font-semibold mb-4">Detalle de sesión</h3>
            {loadingDetail ? <p className="text-sm text-gray-500">Cargando...</p> : detailRenderJSX ?? <p className="text-sm text-red-500">No se pudo cargar el detalle</p>}
            <div className="mt-4 flex justify-end">
              {(()=>{const curSes = detailSession.session ?? detailSession; return (
              <button onClick={()=>{
                setEditSession(curSes);
                if(classesList.length===0) loadClasses();
                if(trainers.length===0) loadTrainers();
                setShowEditSessionModal(true);
              }} className="inline-flex items-center gap-1 text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded">
                <PencilIcon className="w-4 h-4"/> Editar
              </button>
              )})()}
            </div>
          </div>
        </div>
      )}

      {/* Modal editar sesión */}
      {showEditSessionModal && editSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button onClick={()=>setShowEditSessionModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700">✕</button>
            <h3 className="text-lg font-semibold mb-4">Editar sesión</h3>
            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1 text-sm">
              <label className="block text-gray-600 text-xs">Inicio
                <input type="datetime-local" value={editSession.start_time.slice(0,16)} onChange={e=>setEditSession({...editSession,start_time:e.target.value})} className="w-full border px-2 py-1 rounded"/>
              </label>
              <label className="block text-gray-600 text-xs">Fin
                <input type="datetime-local" value={(editSession.end_time||editSession.start_time).slice(0,16)} onChange={e=>setEditSession({...editSession,end_time:e.target.value})} className="w-full border px-2 py-1 rounded"/>
              </label>
              <input value={editSession.room||''} onChange={e=>setEditSession({...editSession,room:e.target.value})} placeholder="Sala (opcional)" className="w-full border px-2 py-1 rounded"/>
              <textarea value={editSession.notes||''} onChange={e=>setEditSession({...editSession,notes:e.target.value})} placeholder="Notas" className="w-full border px-2 py-1 rounded"/>
              <select value={editSession.status} onChange={e=>setEditSession({...editSession,status:e.target.value})} className="w-full border px-2 py-1 rounded">
                <option value="scheduled">Programada</option>
                <option value="in_progress">En curso</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </select>
              <label className="block text-gray-600 text-xs">Clase
                <select value={editSession.class_id} onChange={e=>setEditSession({...editSession,class_id:parseInt(e.target.value)})} className="w-full border px-2 py-1 rounded">
                  {classesList.map(c=>(<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </label>
              <label className="block text-gray-600 text-xs">Entrenador
                <select value={editSession.trainer_id} onChange={e=>setEditSession({...editSession,trainer_id:parseInt(e.target.value)})} className="w-full border px-2 py-1 rounded">
                  {trainers.map(t=>(<option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={editSession.is_recurring||false} onChange={e=>setEditSession({...editSession,is_recurring:e.target.checked})}/> Recurrente
              </label>
              {editSession.is_recurring && (
                <input value={editSession.recurrence_pattern||''} onChange={e=>setEditSession({...editSession,recurrence_pattern:e.target.value})} placeholder="Patrón recurrencia (cron)" className="w-full border px-2 py-1 rounded"/>
              )}
              <input type="number" min={0} value={editSession.override_capacity||''} onChange={e=>setEditSession({...editSession,override_capacity: e.target.value? parseInt(e.target.value):null})} placeholder="Capacidad sobreescrita (opcional)" className="w-full border px-2 py-1 rounded"/>
            </div>
            <div className="mt-5 flex justify-end gap-3 text-sm">
              <button onClick={()=>setShowEditSessionModal(false)} className="px-3 py-1 border rounded">Cancelar</button>
              <button disabled={savingEdit} onClick={async()=>{
                try{
                  setSavingEdit(true)
                  const toApiDate = (val:string|undefined)=>{
                    if(!val) return undefined
                    // Si ya viene con 'Z', asumir correcto
                    if(val.endsWith('Z')) return val
                    // Si falta segundos, añadirlos
                    if(val.length===16){ // YYYY-MM-DDTHH:MM
                      return `${val}:00Z`
                    }
                    // Si tiene segundos pero no Z
                    if(val.length===19){ // YYYY-MM-DDTHH:MM:SS
                      return `${val}Z`
                    }
                    return val
                  }
                  const payload: any = {}
                  if (editSession.class_id !== undefined) payload.class_id = editSession.class_id
                  if (editSession.trainer_id !== undefined) payload.trainer_id = editSession.trainer_id
                  if (editSession.start_time) payload.start_time = toApiDate(editSession.start_time)
                  if (editSession.end_time) payload.end_time = toApiDate(editSession.end_time)
                  if (editSession.room !== undefined) payload.room = editSession.room
                  if (editSession.status) payload.status = editSession.status
                  if (editSession.notes !== undefined) payload.notes = editSession.notes
                  if (editSession.override_capacity !== undefined && editSession.override_capacity !== null) payload.override_capacity = editSession.override_capacity
                  if (editSession.is_recurring !== undefined) payload.is_recurring = editSession.is_recurring
                  if (editSession.recurrence_pattern !== undefined) payload.recurrence_pattern = editSession.recurrence_pattern
                  const updated=await eventsAPI.updateSession(editSession.id||editSession.session?.id,payload)
                  setSessionsList(prev=>prev.map(it=>(it.session?.id||it.id)===updated.id? {...it,session:updated}:it))
                  setShowEditSessionModal(false)
                  if(detailSession){setDetailSession({...detailSession,session:updated});setDetailRenderJSX(buildDetailJSX({...detailSession,session:updated}))}
                  // Notificación de éxito
                  setNotificationColor('green')
                  setSuccessMessage('Sesión actualizada correctamente')
                  setShowSuccessMessage(true)
                  setTimeout(()=>{setShowSuccessMessage(false);setSuccessMessage('')},4000)
                }catch(err){console.error(err)}
                finally{setSavingEdit(false)}
              }} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50">{savingEdit?'Guardando…':'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteSessionModal && deleteSessionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Eliminar sesión</h3>
            <p className="text-sm text-gray-700 mb-6">¿Seguro que deseas eliminar la sesión del <span className="font-semibold">{new Date(deleteSessionTarget.start_time_local || deleteSessionTarget.start_time).toLocaleString('es-ES',{weekday:'long', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</span>?</p>
            <div className="flex justify-end space-x-3 text-sm">
              <button onClick={()=>{setShowDeleteSessionModal(false);setDeleteSessionTarget(null)}} className="px-4 py-2 rounded border">Cancelar</button>
              <button onClick={async()=>{
                if(!deleteSessionTarget) return
                try{
                  setDeletingSession(true)
                  const resp=await eventsAPI.deleteSession(deleteSessionTarget.id)
                  setSessionsList(prev=>prev.filter(it=>(it.session?.id||it.id)!==resp.id))
                  // Notificación de éxito
                  setNotificationColor('green')
                  setSuccessMessage('Sesión eliminada correctamente')
                  setShowSuccessMessage(true)
                  setTimeout(()=>{setShowSuccessMessage(false);setSuccessMessage('')},4000)
                }catch(err){console.error(err)}
                finally{
                  setDeletingSession(false)
                  setShowDeleteSessionModal(false)
                  setDeleteSessionTarget(null)
                }
              }} disabled={deletingSession} className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50">{deletingSession?'Eliminando…':'Eliminar'}</button>
            </div>
          </div>
        </div>
      )}
      {showCancelSessionModal && cancelSessionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-yellow-600">Cancelar sesión</h3>
            <p className="text-sm text-gray-700 mb-6">¿Seguro que deseas cancelar la sesión del <span className='font-semibold'>{new Date(cancelSessionTarget.start_time_local || cancelSessionTarget.start_time).toLocaleString('es-ES',{weekday:'long',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>?</p>
            <div className="flex justify-end space-x-3 text-sm">
              <button onClick={()=>{setShowCancelSessionModal(false);setCancelSessionTarget(null)}} className="px-4 py-2 rounded border">Cerrar</button>
              <button onClick={async()=>{
                if(!cancelSessionTarget) return
                try{
                  setCancellingSession(true)
                  const resp=await eventsAPI.cancelSession(cancelSessionTarget.id)
                  setSessionsList(prev=>prev.map(it=> (it.session?.id||it.id)===resp.id? {...it,session:resp}:it))
                  setNotificationColor('green')
                  setSuccessMessage('Sesión cancelada')
                  setShowSuccessMessage(true)
                  setTimeout(()=>{setShowSuccessMessage(false);setSuccessMessage('')},4000)
                }catch(err){console.error(err)}
                finally{
                  setCancellingSession(false); setShowCancelSessionModal(false); setCancelSessionTarget(null)
                }
              }} disabled={cancellingSession} className="px-4 py-2 rounded bg-yellow-600 text-white disabled:opacity-50">{cancellingSession?'Cancelando…':'Cancelar'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal editar horario */}
      {showEditHoursModal && editHoursData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Editar horario – {daysShort[editHoursData.day_of_week]}</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={hoursFormData.is_closed} onChange={e=>setHoursFormData({...hoursFormData,is_closed:e.target.checked})}/> <span>Día cerrado</span></label>
              {!hoursFormData.is_closed && (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <label className="text-xs text-gray-600">Hora apertura</label>
                      <input type="time" value={hoursFormData.open_time} onChange={e=>setHoursFormData({...hoursFormData,open_time:e.target.value})} className="w-full border px-3 py-2 rounded" />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-600">Hora cierre</label>
                      <input type="time" value={hoursFormData.close_time} onChange={e=>setHoursFormData({...hoursFormData,close_time:e.target.value})} className="w-full border px-3 py-2 rounded" />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={()=>{setShowEditHoursModal(false);setEditHoursData(null)}} className="px-4 py-2 text-sm rounded border">Cancelar</button>
              <button onClick={handleSaveHours} disabled={savingHours} className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">{savingHours? 'Guardando...':'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal aplicar plantilla a rango */}
      {showApplyDefaultsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Aplicar plantilla a rango</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-700 block mb-1">Fecha inicio</label>
                <input type="date" value={rangeForm.start_date} onChange={e=>setRangeForm({...rangeForm,start_date:e.target.value})} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="text-sm text-gray-700 block mb-1">Fecha fin</label>
                <input type="date" value={rangeForm.end_date} onChange={e=>setRangeForm({...rangeForm,end_date:e.target.value})} className="w-full border px-3 py-2 rounded" />
              </div>
              <label className="flex items-center space-x-2 text-sm"><input type="checkbox" checked={rangeForm.overwrite} onChange={e=>setRangeForm({...rangeForm,overwrite:e.target.checked})}/> <span>Sobrescribir existentes</span></label>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={()=>setShowApplyDefaultsModal(false)} className="px-4 py-2 text-sm rounded border">Cancelar</button>
              <button onClick={handleApplyDefaults} disabled={applyingDefaults||!isRangeValid} className="px-4 py-2 text-sm rounded bg-blue-600 text-white disabled:opacity-50">{applyingDefaults? 'Procesando…':'Aplicar'}</button>
              {!isRangeValid && <p className="text-xs text-red-500 mt-2">La fecha fin debe ser posterior o igual a la inicio.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 