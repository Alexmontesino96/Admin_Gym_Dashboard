'use client';

import { useState, useEffect } from 'react';
import { gymsAPI, GymWithStats, GymUpdateData } from '@/lib/api';
import { 
  BuildingOfficeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CalendarIcon,
  BookOpenIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function GymInfoClient() {
  const [gymInfo, setGymInfo] = useState<GymWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [editData, setEditData] = useState<GymUpdateData>({});

  const fetchGymInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await gymsAPI.getGymInfo();
      setGymInfo(data);
      setEditData({
        name: data.name,
        logo_url: data.logo_url || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        description: data.description || '',
        is_active: data.is_active
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar información del gimnasio');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!gymInfo) return;

    try {
      setSaving(true);
      setError(null);
      
      // Filtrar campos vacíos para enviar solo los que tienen valor
      const dataToSend: GymUpdateData = {};
      if (editData.name?.trim()) dataToSend.name = editData.name.trim();
      if (editData.logo_url?.trim()) dataToSend.logo_url = editData.logo_url.trim();
      if (editData.address?.trim()) dataToSend.address = editData.address.trim();
      if (editData.phone?.trim()) dataToSend.phone = editData.phone.trim();
      if (editData.email?.trim()) dataToSend.email = editData.email.trim();
      if (editData.description?.trim()) dataToSend.description = editData.description.trim();
      if (editData.is_active !== undefined) dataToSend.is_active = editData.is_active;

      const updatedGym = await gymsAPI.updateGymInfo(gymInfo.id, dataToSend);
      setGymInfo(updatedGym);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar información del gimnasio');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (gymInfo) {
      setEditData({
        name: gymInfo.name,
        logo_url: gymInfo.logo_url || '',
        address: gymInfo.address || '',
        phone: gymInfo.phone || '',
        email: gymInfo.email || '',
        description: gymInfo.description || '',
        is_active: gymInfo.is_active
      });
    }
    setIsEditing(false);
    setError(null);
  };

  useEffect(() => {
    fetchGymInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando información del gimnasio...</p>
        </div>
      </div>
    );
  }

  if (error && !gymInfo) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <XMarkIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar datos</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={fetchGymInfo}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <BuildingOfficeIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Información del Gimnasio</h1>
                <p className="text-gray-600">Gestiona los detalles y configuración</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={fetchGymInfo}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    <span>Actualizar</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Cancelar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h5 className="text-sm font-medium text-red-800">Error</h5>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {gymInfo && (
          <>
            {/* Información básica */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Información Básica</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Gimnasio
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre del gimnasio"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{gymInfo.name}</p>
                  )}
                </div>

                {/* Subdominio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subdominio
                  </label>
                  <p className="text-gray-900 py-2 font-mono text-sm bg-gray-50 px-3 rounded-lg">
                    {gymInfo.subdomain}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="email@ejemplo.com"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 py-2">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{gymInfo.email || 'No especificado'}</span>
                    </div>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1 234 567 8900"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 py-2">
                      <PhoneIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{gymInfo.phone || 'No especificado'}</span>
                    </div>
                  )}
                </div>

                {/* Dirección */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.address || ''}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Dirección completa del gimnasio"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 py-2">
                      <MapPinIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{gymInfo.address || 'No especificada'}</span>
                    </div>
                  )}
                </div>

                {/* URL del Logo */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL del Logo
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editData.logo_url || ''}
                      onChange={(e) => setEditData({ ...editData, logo_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://ejemplo.com/logo.png"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 py-2">
                      <GlobeAltIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900 text-sm break-all">{gymInfo.logo_url || 'No especificada'}</span>
                      {gymInfo.logo_url && (
                        <img 
                          src={gymInfo.logo_url} 
                          alt="Logo del gimnasio" 
                          className="w-8 h-8 rounded object-cover border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Descripción */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descripción del gimnasio..."
                    />
                  ) : (
                    <p className="text-gray-900 py-2 whitespace-pre-wrap">
                      {gymInfo.description || 'No especificada'}
                    </p>
                  )}
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  {isEditing ? (
                    <div className="flex items-center space-x-4 py-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="is_active"
                          checked={editData.is_active === true}
                          onChange={() => setEditData({ ...editData, is_active: true })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Activo</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="is_active"
                          checked={editData.is_active === false}
                          onChange={() => setEditData({ ...editData, is_active: false })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Inactivo</span>
                      </label>
                    </div>
                  ) : (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      gymInfo.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {gymInfo.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Estadísticas</h2>
              
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{gymInfo.members_count}</div>
                  <div className="text-sm text-gray-500">Miembros</div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <AcademicCapIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{gymInfo.trainers_count}</div>
                  <div className="text-sm text-gray-500">Entrenadores</div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{gymInfo.admins_count}</div>
                  <div className="text-sm text-gray-500">Administradores</div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CalendarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{gymInfo.events_count}</div>
                  <div className="text-sm text-gray-500">Eventos</div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BookOpenIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{gymInfo.classes_count}</div>
                  <div className="text-sm text-gray-500">Clases</div>
                </div>
              </div>
            </div>

            {/* Información del sistema */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Información del Sistema</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    ID del Gimnasio
                  </label>
                  <p className="text-gray-900">{gymInfo.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Fecha de Creación
                  </label>
                  <p className="text-gray-900">
                    {new Date(gymInfo.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Última Actualización
                  </label>
                  <p className="text-gray-900">
                    {new Date(gymInfo.updated_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
    </div>
  );
} 