'use client'

import { useState, useEffect } from 'react'
import { eventsAPI } from '@/lib/api'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function CategoriesClient() {
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

  useEffect(() => {
    loadCategories()
  }, [])

  if (loading) {
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

      {/* Botón Nueva categoría */}
      <div className="flex justify-end">
        <button
          onClick={() => { setShowCreateModal(true); setError(null) }}
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 shadow-sm"
        >
          Nueva categoría
        </button>
      </div>

      {/* Grid de categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Categorías por defecto */}
        {baseCategories.map(def => (
          <div key={`enum-${def.value}`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start space-x-4 hover:shadow-md transition-shadow duration-200 opacity-90">
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
          <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start space-x-4 hover:shadow-md transition-shadow duration-200 relative">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{backgroundColor: cat.color || '#6b7280'}}>
              {cat.icon || '🏷️'}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
              <p className="text-sm text-gray-500">{cat.description}</p>
              {!cat.is_active && <span className="inline-block mt-1 text-xs text-red-600">Inactiva</span>}
            </div>
            {/* Botones de acción */}
            <div className="flex flex-col gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); openEditModal(cat); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Editar categoría"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); confirmDeleteCategory(cat) }}
                className="text-red-400 hover:text-red-600 transition-colors"
                title="Eliminar categoría"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5-3h4a2 2 0 012 2v1H8V5a2 2 0 012-2z"></path>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal crear categoría */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
            <h3 className="text-xl font-semibold mb-6">Crear categoría</h3>
            <div className="space-y-4">
              <input 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Nombre" 
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <input 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Descripción" 
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <input 
                value={formData.color} 
                onChange={e => setFormData({ ...formData, color: e.target.value })} 
                placeholder="Color (hex)" 
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <input 
                value={formData.icon} 
                onChange={e => setFormData({ ...formData, icon: e.target.value })} 
                placeholder="Icono" 
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <label className="flex items-center space-x-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={formData.is_active} 
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                /> 
                <span>Activa</span>
              </label>
            </div>
            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreate} 
                disabled={saving} 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl disabled:opacity-50 transition-colors"
              >
                {saving ? 'Guardando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar categoría */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
            <h3 className="text-xl font-semibold mb-6">Editar categoría</h3>
            <div className="space-y-4">
              <input 
                value={editFormData.name} 
                onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} 
                placeholder="Nombre" 
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <input 
                value={editFormData.description} 
                onChange={e => setEditFormData({ ...editFormData, description: e.target.value })} 
                placeholder="Descripción" 
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <input 
                value={editFormData.color} 
                onChange={e => setEditFormData({ ...editFormData, color: e.target.value })} 
                placeholder="Color (hex)" 
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <input 
                value={editFormData.icon} 
                onChange={e => setEditFormData({ ...editFormData, icon: e.target.value })} 
                placeholder="Icono" 
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              <label className="flex items-center space-x-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={editFormData.is_active} 
                  onChange={e => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                /> 
                <span>Activa</span>
              </label>
            </div>
            <div className="mt-8 flex justify-end space-x-3">
              <button 
                onClick={() => setShowEditModal(false)} 
                className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleUpdate} 
                disabled={updating} 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl disabled:opacity-50 transition-colors"
              >
                {updating ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmación eliminar */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
            <h3 className="text-xl font-semibold mb-4 text-red-600">Eliminar categoría</h3>
            <p className="text-sm text-gray-700 mb-6">
              ¿Seguro que deseas eliminar la categoría "<span className='font-semibold'>{deleteTarget.name}</span>"? 
              Si está en uso por clases, se marcará como inactiva en lugar de eliminarse.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => { setShowDeleteModal(false); setDeleteTarget(null) }} 
                className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={executeDeleteCategory} 
                disabled={updating} 
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl disabled:opacity-50 transition-colors"
              >
                {updating ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 