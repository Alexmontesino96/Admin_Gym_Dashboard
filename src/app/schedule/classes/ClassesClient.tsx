'use client'

import { useState, useEffect } from 'react'
import { eventsAPI } from '@/lib/api'
import { CheckCircleIcon, XCircleIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function ClassesClient() {
  const [categories, setCategories] = useState<any[]>([])
  const [classesList, setClassesList] = useState<any[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  // Modal creación de clase
  const [showCreateClassModal, setShowCreateClassModal] = useState(false)
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

  // Notificación de éxito
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [notificationColor, setNotificationColor] = useState<'green' | 'red'>('green')

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

  const loadCategories = async () => {
    try {
      const data = await eventsAPI.getCategories()
      setCategories(data)
    } catch (err: any) {
      console.error('Error cargando categorías:', err)
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
        data = await eventsAPI.getClasses(true)
        const cid = parseInt(categoryFilter.split(':')[1])
        data = data.filter(c => c.category_id === cid)
      } else if (difficultyFilter !== 'all') {
        data = await eventsAPI.getClassesByDifficulty(difficultyFilter as any)
      } else {
        data = await eventsAPI.getClasses(true)
      }

      if (difficultyFilter !== 'all') {
        data = data.filter(c => c.difficulty_level === difficultyFilter)
      }
      setClassesList(data)
    } catch (err) {
      console.error('Error al cargar clases:', err)
    } finally {
      setLoadingClasses(false)
    }
  }

  const handleCreateClass = async () => {
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
      if (!payload.description) delete payload.description
      if (!payload.category_id) delete payload.category_id
      if (payload.category_id) {
        delete payload.category_enum
      } else {
        if (!payload.category_enum) payload.category_enum = 'other'
      }

      const newClass = await eventsAPI.createClass(payload)
      setClassesList(prev => [newClass, ...prev])

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
    if (!editClassData.name.trim()) { setError('El nombre es obligatorio'); return }
    if (editClassData.duration <= 0 || editClassData.max_capacity <= 0) { setError('Duración y capacidad deben ser mayores a 0'); return }

    try {
      setUpdatingClass(true)
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
      await eventsAPI.deleteClass(deleteClassTarget.id)
      setClassesList(prev => prev.filter(c => c.id !== deleteClassTarget.id))

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

  useEffect(() => {
    loadCategories()
    loadClasses()
  }, [])

  useEffect(() => {
    loadClasses()
  }, [categoryFilter, difficultyFilter])

  if (loadingClasses) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      {/* Error */}
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

      {/* Filtros y botón crear */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Categoría:</label>
              <select 
                value={categoryFilter} 
                onChange={e => setCategoryFilter(e.target.value)} 
                className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                {baseCategories.map(c => (
                  <option key={`enum:${c.value}`} value={`enum:${c.value}`}>{c.label}</option>
                ))}
                {categories.length > 0 && (
                  <optgroup label="Personalizadas">
                    {categories.map(cat => (
                      <option key={`custom:${cat.id}`} value={`custom:${cat.id}`}>{cat.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Dificultad:</label>
              <select 
                value={difficultyFilter} 
                onChange={e => setDifficultyFilter(e.target.value)} 
                className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedia</option>
                <option value="advanced">Avanzada</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => { setShowCreateClassModal(true); setError(null); if (categories.length === 0) loadCategories() }}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 shadow-sm"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva clase
          </button>
        </div>
      </div>

      {/* Grid de clases */}
      {classesList.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clases disponibles</h3>
          <p className="text-gray-500 mb-6">Comienza creando tu primera clase</p>
          <button
            onClick={() => setShowCreateClassModal(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Crear primera clase
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classesList.map(cls => (
            <div key={cls.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate" title={cls.name}>{cls.name}</h3>
                {!cls.is_active && <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">Inactiva</span>}
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[60px]">{cls.description || 'Sin descripción'}</p>
              
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium">Duración:</span>
                  <span>{cls.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Capacidad:</span>
                  <span>{cls.max_capacity} personas</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Dificultad:</span>
                  <span className="capitalize">{cls.difficulty_level}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => openEditClassModal(cls)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Editar clase"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => confirmDeleteClass(cls)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                  title="Eliminar clase"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5-3h4a2 2 0 012 2v1H8V5a2 2 0 012-2z"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear clase */}
      {showCreateClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-6">Crear clase</h3>
            <div className="space-y-4">
              <input 
                value={classFormData.name} 
                onChange={e => setClassFormData({ ...classFormData, name: e.target.value })} 
                placeholder="Nombre de la clase" 
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <textarea 
                value={classFormData.description} 
                onChange={e => setClassFormData({ ...classFormData, description: e.target.value })} 
                placeholder="Descripción (opcional)" 
                rows={3}
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
                  <input 
                    type="number" 
                    value={classFormData.duration} 
                    onChange={e => setClassFormData({ ...classFormData, duration: parseInt(e.target.value) || 0 })} 
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad máx.</label>
                  <input 
                    type="number" 
                    value={classFormData.max_capacity} 
                    onChange={e => setClassFormData({ ...classFormData, max_capacity: parseInt(e.target.value) || 0 })} 
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dificultad</label>
                <select 
                  value={classFormData.difficulty_level} 
                  onChange={e => setClassFormData({ ...classFormData, difficulty_level: e.target.value as any })} 
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedia</option>
                  <option value="advanced">Avanzada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select 
                  value={classFormData.category_id ? `custom:${classFormData.category_id}` : `enum:${classFormData.category_enum}`} 
                  onChange={e => {
                    if (e.target.value.startsWith('custom:')) {
                      setClassFormData({ ...classFormData, category_id: parseInt(e.target.value.split(':')[1]), category_enum: 'other' })
                    } else {
                      setClassFormData({ ...classFormData, category_enum: e.target.value.split(':')[1], category_id: undefined })
                    }
                  }} 
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {baseCategories.map(c => (
                    <option key={`enum:${c.value}`} value={`enum:${c.value}`}>{c.label}</option>
                  ))}
                  {categories.length > 0 && (
                    <optgroup label="Personalizadas">
                      {categories.map(cat => (
                        <option key={`custom:${cat.id}`} value={`custom:${cat.id}`}>{cat.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>
            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => setShowCreateClassModal(false)} 
                className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateClass} 
                disabled={savingClass} 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl disabled:opacity-50 transition-colors"
              >
                {savingClass ? 'Creando...' : 'Crear clase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar clase */}
      {showEditClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-6">Editar clase</h3>
            <div className="space-y-4">
              <input 
                value={editClassData.name} 
                onChange={e => setEditClassData({ ...editClassData, name: e.target.value })} 
                placeholder="Nombre de la clase" 
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <textarea 
                value={editClassData.description} 
                onChange={e => setEditClassData({ ...editClassData, description: e.target.value })} 
                placeholder="Descripción (opcional)" 
                rows={3}
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
                  <input 
                    type="number" 
                    value={editClassData.duration} 
                    onChange={e => setEditClassData({ ...editClassData, duration: parseInt(e.target.value) || 0 })} 
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad máx.</label>
                  <input 
                    type="number" 
                    value={editClassData.max_capacity} 
                    onChange={e => setEditClassData({ ...editClassData, max_capacity: parseInt(e.target.value) || 0 })} 
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dificultad</label>
                <select 
                  value={editClassData.difficulty_level} 
                  onChange={e => setEditClassData({ ...editClassData, difficulty_level: e.target.value as any })} 
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedia</option>
                  <option value="advanced">Avanzada</option>
                </select>
              </div>
              <label className="flex items-center space-x-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={editClassData.is_active} 
                  onChange={e => setEditClassData({ ...editClassData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                /> 
                <span>Clase activa</span>
              </label>
            </div>
            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => setShowEditClassModal(false)} 
                className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleUpdateClass} 
                disabled={updatingClass} 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl disabled:opacity-50 transition-colors"
              >
                {updatingClass ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmación eliminar */}
      {showDeleteClassModal && deleteClassTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
            <h3 className="text-xl font-semibold mb-4 text-red-600">Eliminar clase</h3>
            <p className="text-sm text-gray-700 mb-6">
              ¿Seguro que deseas eliminar la clase "<span className='font-semibold'>{deleteClassTarget.name}</span>"?
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => { setShowDeleteClassModal(false); setDeleteClassTarget(null) }} 
                className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={executeDeleteClass} 
                disabled={updatingClass} 
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl disabled:opacity-50 transition-colors"
              >
                {updatingClass ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 