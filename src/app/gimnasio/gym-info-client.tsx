'use client';

import { useState, useEffect, useRef } from 'react';
import { gymsAPI, GymWithStats, GymUpdateData, WorkspaceType } from '@/lib/api';
import Image from 'next/image';
import {
  Building2,
  Edit3,
  Check,
  X,
  RefreshCw,
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Globe,
  AlertTriangle,
  Sparkles,
  Trophy,
  Shield,
  Clock,
  Activity,
  TrendingUp,
  Zap,
  Star,
  Target,
  Award,
  Upload,
  Trash2,
  ImagePlus,
  Loader2
} from 'lucide-react';
import StripeConnectCard from '@/components/StripeConnectCard';
import { useTerminology } from '@/hooks/useTerminology';

export default function GymInfoClient() {
  const terminology = useTerminology();

  // Validación defensiva para asegurar que sean strings
  const workspace = typeof terminology.workspace === 'string' ? terminology.workspace : 'gimnasio';
  const userPlural = typeof terminology.userPlural === 'string' ? terminology.userPlural : 'miembros';
  const userSingular = typeof terminology.userSingular === 'string' ? terminology.userSingular : 'miembro';

  const [gymInfo, setGymInfo] = useState<GymWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [editData, setEditData] = useState<GymUpdateData>({});

  // Estados para upload de logo
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setLogoPreview(null);
    setError(null);
  };

  // Handler para selección de archivo de logo
  const handleLogoFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !gymInfo) return;

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato de archivo no válido. Use JPG, PNG o WEBP.');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Subir archivo
    setIsUploadingLogo(true);
    setError(null);

    try {
      const result = await gymsAPI.uploadGymLogo(gymInfo.id, file);

      // Actualizar gymInfo con la nueva URL del logo
      setGymInfo(prev => prev ? { ...prev, logo_url: result.logo_url } : null);
      setEditData(prev => ({ ...prev, logo_url: result.logo_url }));
      setLogoPreview(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el logo');
      setLogoPreview(null);
    } finally {
      setIsUploadingLogo(false);
      // Limpiar el input para permitir seleccionar el mismo archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handler para eliminar logo
  const handleDeleteLogo = async () => {
    if (!gymInfo || !gymInfo.logo_url) return;

    if (!confirm('¿Estás seguro de que quieres eliminar el logo?')) return;

    setIsUploadingLogo(true);
    setError(null);

    try {
      await gymsAPI.deleteGymLogo(gymInfo.id);

      // Actualizar gymInfo
      setGymInfo(prev => prev ? { ...prev, logo_url: null } : null);
      setEditData(prev => ({ ...prev, logo_url: '' }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  useEffect(() => {
    fetchGymInfo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center space-y-6">
          {/* Animated spinner with gradient */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-purple-600 animate-spin"></div>
          </div>

          {/* Skeleton cards */}
          <div className="space-y-4">
            <div className="h-4 w-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-lg mx-auto"></div>
            <div className="h-3 w-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-lg mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !gymInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
        <div className="max-w-md w-full">
          {/* Error card with modern design */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-red-100 p-8 transform transition-all hover:scale-105">
            <div className="text-center space-y-6">
              {/* Error icon with pulse animation */}
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar datos</h3>
                <p className="text-gray-600">{error}</p>
              </div>

              <button
                onClick={fetchGymInfo}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-red-500/50 active:scale-95"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reintentar
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-12">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 pb-32">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          {/* Logo and Title Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Logo with glassmorphism effect */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative w-24 h-24 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 flex items-center justify-center shadow-2xl">
                  {gymInfo?.logo_url ? (
                    <Image
                      src={gymInfo.logo_url}
                      alt="Logo"
                      width={80}
                      height={80}
                      className="rounded-xl object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-white" />
                  )}
                </div>
              </div>

              {/* Title and Status */}
              <div className="text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">
                  {gymInfo?.name || workspace.charAt(0).toUpperCase() + workspace.slice(1)}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-lg text-white/90 font-medium">
                    {workspace.charAt(0).toUpperCase() + workspace.slice(1)}
                  </span>
                  <div className="relative">
                    {gymInfo?.is_active ? (
                      <span className="group inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/20 backdrop-blur-sm border border-green-300/50 text-green-100 rounded-full text-sm font-semibold transition-all hover:bg-green-500/30">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                        </span>
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/20 backdrop-blur-sm border border-red-300/50 text-red-100 rounded-full text-sm font-semibold">
                        <span className="relative flex h-2 w-2">
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                        </span>
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="group relative overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:bg-white/30 hover:shadow-lg active:scale-95"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </span>
                  </button>
                  <button
                    onClick={fetchGymInfo}
                    className="group relative overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:bg-white/30 hover:shadow-lg active:scale-95"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                      Actualizar
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="group relative overflow-hidden bg-green-500 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      {isSaving ? 'Guardando...' : 'Guardar'}
                    </span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="group relative overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:bg-white/30 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Cancelar
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 group">
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-4 shadow-lg transition-all hover:shadow-xl">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-semibold text-red-800 mb-1">Error</h5>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {gymInfo && (
          <div className="space-y-6">
            {/* Stats Grid - Modern Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Members */}
              <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100 shadow-lg transition-all hover:shadow-xl hover:scale-105 hover:border-indigo-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/50 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{gymInfo.members_count}</div>
                  <div className="text-sm text-gray-600 font-medium">{userPlural.charAt(0).toUpperCase() + userPlural.slice(1)}</div>
                </div>
              </div>

              {/* Trainers */}
              <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100 shadow-lg transition-all hover:shadow-xl hover:scale-105 hover:border-green-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-full"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/50 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{gymInfo.trainers_count}</div>
                  <div className="text-sm text-gray-600 font-medium">Entrenadores</div>
                </div>
              </div>

              {/* Admins */}
              <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 shadow-lg transition-all hover:shadow-xl hover:scale-105 hover:border-purple-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{gymInfo.admins_count}</div>
                  <div className="text-sm text-gray-600 font-medium">Administradores</div>
                </div>
              </div>

              {/* Events */}
              <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-amber-100 shadow-lg transition-all hover:shadow-xl hover:scale-105 hover:border-amber-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/50 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{gymInfo.events_count}</div>
                  <div className="text-sm text-gray-600 font-medium">Eventos</div>
                </div>
              </div>

              {/* Classes */}
              <div className="group relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-pink-100 shadow-lg transition-all hover:shadow-xl hover:scale-105 hover:border-pink-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500/10 to-transparent rounded-bl-full"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-pink-500/50 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{gymInfo.classes_count}</div>
                  <div className="text-sm text-gray-600 font-medium">Clases</div>
                </div>
              </div>
            </div>

            {/* Basic Information Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Información Básica</h2>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Star className="w-4 h-4 text-indigo-500" />
                      Nombre del {workspace.charAt(0).toUpperCase() + workspace.slice(1)}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Nombre del gimnasio"
                      />
                    ) : (
                      <p className="text-lg font-semibold text-gray-900 px-4 py-3 bg-gray-50 rounded-xl">{gymInfo.name}</p>
                    )}
                  </div>

                  {/* Subdomain */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-purple-500" />
                      Subdominio
                    </label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
                      <code className="text-lg font-mono font-semibold text-purple-700">{gymInfo.subdomain}</code>
                      <Zap className="w-4 h-4 text-purple-500 ml-auto" />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-green-500" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="email@ejemplo.com"
                      />
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-900 font-medium">{gymInfo.email || 'No especificado'}</span>
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      Teléfono
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="+1 234 567 8900"
                      />
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-900 font-medium">{gymInfo.phone || 'No especificado'}</span>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      Dirección
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.address || ''}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder="Dirección completa del gimnasio"
                      />
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-900 font-medium">{gymInfo.address || 'No especificada'}</span>
                      </div>
                    )}
                  </div>

                  {/* Logo Upload */}
                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <ImagePlus className="w-4 h-4 text-indigo-500" />
                      Logo del {workspace.charAt(0).toUpperCase() + workspace.slice(1)}
                    </label>

                    <div className="flex items-start gap-6">
                      {/* Preview del logo actual */}
                      <div className="flex-shrink-0">
                        <div className="relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                          {isUploadingLogo ? (
                            <div className="flex flex-col items-center justify-center">
                              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                              <span className="text-xs text-gray-500 mt-1">Subiendo...</span>
                            </div>
                          ) : logoPreview ? (
                            <Image
                              src={logoPreview}
                              alt="Preview"
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          ) : gymInfo.logo_url ? (
                            <Image
                              src={gymInfo.logo_url}
                              alt="Logo actual"
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Building2 className="w-10 h-10 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {/* Input oculto para selección de archivo */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleLogoFileSelect}
                            className="hidden"
                            disabled={isUploadingLogo}
                          />

                          {/* Botón para subir nuevo logo */}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingLogo}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                          >
                            <Upload className="w-4 h-4" />
                            {gymInfo.logo_url ? 'Cambiar logo' : 'Subir logo'}
                          </button>

                          {/* Botón para eliminar logo */}
                          {gymInfo.logo_url && (
                            <button
                              type="button"
                              onClick={handleDeleteLogo}
                              disabled={isUploadingLogo}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          )}
                        </div>

                        <p className="text-xs text-gray-500">
                          Formatos: JPG, PNG, WEBP. Tamaño máximo: 5MB
                        </p>

                        {gymInfo.logo_url && (
                          <p className="text-xs text-gray-400 break-all">
                            URL actual: {gymInfo.logo_url}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      Descripción
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editData.description || ''}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                        placeholder="Descripción del gimnasio..."
                      />
                    ) : (
                      <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-xl whitespace-pre-wrap min-h-[100px]">
                        {gymInfo.description || 'No especificada'}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-green-500" />
                      Estado
                    </label>
                    {isEditing ? (
                      <div className="flex gap-4 px-4 py-3">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="is_active"
                            checked={editData.is_active === true}
                            onChange={() => setEditData({ ...editData, is_active: true })}
                            className="w-5 h-5 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">Activo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="is_active"
                            checked={editData.is_active === false}
                            onChange={() => setEditData({ ...editData, is_active: false })}
                            className="w-5 h-5 text-red-600 focus:ring-red-500 border-gray-300"
                          />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">Inactivo</span>
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {gymInfo.is_active ? (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-green-500/50">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold shadow-lg shadow-red-500/50">
                            <X className="w-4 h-4" />
                            Inactivo
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Trainer Section */}
            {gymInfo.type === WorkspaceType.PERSONAL_TRAINER && (
              <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-2xl border border-green-300 overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                </div>

                <div className="relative px-8 py-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white drop-shadow-lg">Información de Entrenador Personal</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Client Capacity */}
                    {gymInfo.max_clients && (
                      <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
                        <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Capacidad de Clientes
                        </label>
                        <div className="flex items-baseline gap-2 mb-4">
                          <div className="text-5xl font-bold text-white drop-shadow-lg">
                            {gymInfo.active_clients_count || 0}
                          </div>
                          <div className="text-2xl font-semibold text-white/80">
                            / {gymInfo.max_clients}
                          </div>
                        </div>

                        {/* Progress bar with gradient */}
                        <div className="relative w-full bg-white/20 rounded-full h-4 overflow-hidden shadow-inner">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-white via-green-100 to-white rounded-full transition-all duration-500 shadow-lg"
                            style={{ width: `${Math.min(100, ((gymInfo.active_clients_count || 0) / gymInfo.max_clients) * 100)}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent animate-shimmer"></div>
                          </div>
                        </div>

                        <div className="mt-3 text-sm font-semibold text-white/90">
                          {Math.round(((gymInfo.active_clients_count || 0) / gymInfo.max_clients) * 100)}% de capacidad utilizada
                        </div>
                      </div>
                    )}

                    {/* Specialties */}
                    {gymInfo.trainer_specialties && gymInfo.trainer_specialties.length > 0 && (
                      <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
                        <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          Especialidades
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {gymInfo.trainer_specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="group inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-xl text-sm font-semibold transition-all hover:bg-white/30 hover:scale-105 shadow-lg"
                            >
                              <Star className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {gymInfo.trainer_certifications && gymInfo.trainer_certifications.length > 0 && (
                      <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl p-6">
                        <label className="block text-sm font-semibold text-white/90 mb-4 flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          Certificaciones
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {gymInfo.trainer_certifications.map((cert, index) => (
                            <div
                              key={index}
                              className="group bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-green-200 shadow-lg transition-all hover:shadow-2xl hover:scale-105"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                  <Trophy className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-gray-900 text-lg mb-1">{cert.name}</p>
                                  <p className="text-sm text-gray-600 font-medium mb-2">{cert.institution}</p>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-gray-400" />
                                    <p className="text-xs font-semibold text-gray-500">Año: {cert.year}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* System Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Información del Sistema</h2>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-600">ID del Gimnasio</label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                      <code className="text-sm font-mono text-gray-900 font-semibold">{gymInfo.id}</code>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-600 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      Fecha de Creación
                    </label>
                    <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <p className="text-gray-900 font-medium">
                        {new Date(gymInfo.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      Última Actualización
                    </label>
                    <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <p className="text-gray-900 font-medium">
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
              </div>
            </div>

            {/* Stripe Connect Configuration */}
            <StripeConnectCard />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
