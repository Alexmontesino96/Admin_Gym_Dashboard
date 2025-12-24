'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getUsersAPI, GymParticipant, membershipsAPI, MembershipStatus, getSelectedGymId, UserBasicInfo } from '@/lib/api';
import { Listbox, Transition, Dialog } from '@headlessui/react';
import { Fragment } from 'react';
import Image from 'next/image';
import {
  ChevronUpDownIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ArrowPathIcon,
  TrashIcon,
  XMarkIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  UserPlusIcon,
  UsersIcon,
  SparklesIcon,
  CreditCardIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTerminology } from '@/hooks/useTerminology';

// Funciones helper para crear opciones dinámicas
const createRoleOptions = (userSingular: string) => [
  { id: 'all', name: 'Todos los roles', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { id: 'MEMBER', name: userSingular.charAt(0).toUpperCase() + userSingular.slice(1), color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 'TRAINER', name: 'Entrenador', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { id: 'ADMIN', name: 'Administrador', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { id: 'OWNER', name: 'Propietario', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { id: 'SUPER_ADMIN', name: 'Super Admin', color: 'text-red-600', bgColor: 'bg-red-100' }
];

const createRoleChangeOptions = (userSingular: string, workspace: string) => [
  { value: 'MEMBER', name: userSingular.charAt(0).toUpperCase() + userSingular.slice(1), description: `Acceso básico al ${workspace}`, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { value: 'TRAINER', name: 'Entrenador', description: 'Puede gestionar clases y entrenamientos', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  { value: 'ADMIN', name: 'Administrador', description: `Gestión completa del ${workspace}`, color: 'text-purple-600', bgColor: 'bg-purple-50' }
];

// Extend the GymParticipant interface to include membership status
interface GymParticipantWithMembership extends GymParticipant {
  membershipStatus?: MembershipStatus;
}

// Skeleton component para loading
const UsersLoadingSkeleton = () => (
  <div className="space-y-8">
    {/* Header skeleton */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="flex space-x-4">
          <div className="h-12 bg-gray-200 rounded-xl w-32"></div>
          <div className="h-12 bg-gray-200 rounded-xl w-32"></div>
          <div className="h-12 bg-gray-200 rounded-xl w-32"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>

    {/* Controls skeleton */}
    <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-6 animate-pulse">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded-lg w-24"></div>
          ))}
        </div>
        <div className="flex-1">
          <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
        </div>
      </div>
    </div>

    {/* Grid skeleton */}
    <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-8 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white border border-blue-200 rounded-2xl p-6 min-h-[240px]">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function UsersClient() {
  const router = useRouter();
  const { userSingular, userPlural, workspace } = useTerminology();

  // Crear opciones dinámicas basadas en terminología
  const roleOptions = useMemo(() => createRoleOptions(userSingular), [userSingular]);
  const roleChangeOptions = useMemo(() => createRoleChangeOptions(userSingular, workspace), [userSingular, workspace]);

  const [users, setUsers] = useState<GymParticipantWithMembership[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<GymParticipantWithMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [selectedRole, setSelectedRole] = useState(roleOptions[0]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(12);
  
  // Modal
  const [selectedUser, setSelectedUser] = useState<GymParticipantWithMembership | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Cambio de rol
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [selectedNewRole, setSelectedNewRole] = useState<'MEMBER' | 'TRAINER' | 'ADMIN'>('MEMBER');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Añadir usuario
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userIdToAdd, setUserIdToAdd] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Búsqueda por email
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<UserBasicInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUserForAdd, setSelectedUserForAdd] = useState<UserBasicInfo | null>(null);
  const [showConfirmAddUser, setShowConfirmAddUser] = useState(false);

  // Eliminar usuario
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<GymParticipantWithMembership | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  // Notificación para usuario existente
  const [showUserExistsNotification, setShowUserExistsNotification] = useState(false);
  const [userExistsMessage, setUserExistsMessage] = useState('');

  // Verificar si hay gimnasio seleccionado
  const checkGymSelected = useCallback(() => {
    const selectedGymId = getSelectedGymId();
    
    if (!selectedGymId || selectedGymId === 'null' || selectedGymId === 'undefined') {
      console.log('🚨 No gym selected in users page, redirecting...');
      const currentPath = encodeURIComponent(window.location.pathname);
      router.push(`/select-gym?returnTo=${currentPath}`);
      return false;
    }
    
    console.log('✅ Gym selected:', selectedGymId);
    return true;
  }, [router]);

  const getAuthToken = useCallback(async () => {
    try {
      const response = await fetch('/api/token');
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.action === 'logout_required') {
          window.location.href = '/logout';
          return null;
        }
        throw new Error(errorData.error || 'Error obteniendo token');
      }
      const data = await response.json();
      return data.accessToken;
    } catch (error) {
      console.error('Error obteniendo token:', error);
      throw error;
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // VERIFICACIÓN CRÍTICA: Verificar que hay gimnasio seleccionado
      if (!checkGymSelected()) {
        return; // La función ya redirige al usuario
      }

      const token = await getAuthToken();
      if (!token) {
        return; // El usuario será redirigido
      }

      // Participantes básicos (miembros y entrenadores)
      const participants = await getUsersAPI.getGymParticipants();

      // Intentar obtener también usuarios con roles ADMIN / OWNER / SUPER_ADMIN
      let extraUsers: any[] = [];
      try {
        extraUsers = await getUsersAPI.getGymUsers();
      } catch (e) {
        console.warn('No se pudieron obtener usuarios adicionales:', e);
      }

      // Unir listas sin duplicar IDs
      const merged: any[] = [...participants];
      extraUsers.forEach((u: any) => {
        if (!merged.find(p => p.id === u.id)) {
          // Normalizar campos para coincidir con GymParticipant donde sea posible
          merged.push({
            ...u,
            gym_role: u.gym_role || u.role || 'MEMBER',
            phone_number: u.phone || u.phone_number || null,
            is_active: u.is_active ?? true,
          });
        }
      });

      // Obtener información de membresías para cada usuario (con límite de concurrencia)
      const usersWithMemberships = await Promise.all(
        merged.map(async (user) => {
          try {
            const membershipStatus = await membershipsAPI.getUserMembershipStatus(user.id);
            return {
              ...user,
              membershipStatus
            };
          } catch (error) {
            console.warn(`No se pudo obtener estado de membresía para usuario ${user.id}:`, error);
            return {
              ...user,
              membershipStatus: null
            };
          }
        })
      );

      setUsers(usersWithMemberships);
      setFilteredUsers(usersWithMemberships);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      
      // Manejar errores específicos del header X-Gym-ID
      if (err.message && err.message.includes('X-Gym-ID')) {
        console.log('🚨 X-Gym-ID error detected, checking gym selection...');
        if (!checkGymSelected()) {
          return; // Ya redirige al usuario
        }
      }
      
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [checkGymSelected, getAuthToken]);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Aplicar filtros
  useEffect(() => {
    // Filtro automático: excluir usuarios con rol OWNER
    let filtered = users.filter(user => user.gym_role !== 'OWNER');

    // Filtro por rol
    if (selectedRole.id !== 'all') {
      filtered = filtered.filter(user => user.gym_role === selectedRole.id);
    }

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               user.id.toString().includes(searchTerm);
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset página al filtrar
  }, [users, selectedRole, searchTerm]);

  // Paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'MEMBER': return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm';
      case 'TRAINER': return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm';
      case 'ADMIN': return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm';
      case 'OWNER': return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-sm';
      case 'SUPER_ADMIN': return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-sm';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm' 
      : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-sm';
  };

  const getRoleName = (role: string) => {
    const roleOption = roleOptions.find(r => r.id === role);
    return roleOption?.name || role;
  };

  const getDisplayName = (user: GymParticipantWithMembership) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return 'Sin nombre';
  };

  const generateQRCodeURL = (qrCode: string) => {
    // Usar la API de QR Server para generar el código QR
    const size = '200x200';
    const encodedData = encodeURIComponent(qrCode);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodedData}`;
  };

  const openModal = (user: GymParticipantWithMembership) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
    setIsEditingRole(false);
    setIsUpdatingRole(false);
    setShowQRCode(false);
  };

  const handleRoleEdit = (user: GymParticipantWithMembership) => {
    // Solo permitir cambiar a roles permitidos, si es OWNER mantener como ADMIN por defecto
    const allowedRole = user.gym_role === 'OWNER' ? 'ADMIN' : user.gym_role as 'MEMBER' | 'TRAINER' | 'ADMIN';
    setSelectedNewRole(allowedRole);
    setIsEditingRole(true);
  };



  const handleRoleUpdate = useCallback(async () => {
    if (!selectedUser) return;

    try {
      setIsUpdatingRole(true);
      await getUsersAPI.updateUserRole(selectedUser.id, selectedNewRole);
      
      // Actualizar el usuario en la lista local
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, gym_role: selectedNewRole }
          : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers.filter(user => {
        if (selectedRole.id !== 'all' && user.gym_role !== selectedRole.id) return false;
        if (searchTerm) {
          const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
          return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 user.id.toString().includes(searchTerm);
        }
        return true;
      }));

      // Actualizar el usuario seleccionado
      setSelectedUser({ ...selectedUser, gym_role: selectedNewRole });
      setIsEditingRole(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el rol');
    } finally {
      setIsUpdatingRole(false);
    }
  }, [selectedUser, selectedNewRole, users, selectedRole.id, searchTerm]);

  // Función para buscar usuarios por email
  const searchUsersByEmail = useCallback(async (email: string) => {
    if (!email.trim() || email.length < 3) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const result = await getUsersAPI.searchUserByEmail(email);
      // La API devuelve un solo usuario, lo convertimos en array para consistencia
      setSearchResults([result]);
    } catch (error) {
      console.warn('No se encontraron usuarios:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce para la búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchEmail && searchEmail.length >= 3) {
        searchUsersByEmail(searchEmail);
      } else {
        setSearchResults([]);
      }
    }, 500); // 500ms de delay

    return () => clearTimeout(timeoutId);
  }, [searchEmail, searchUsersByEmail]);

  // Funciones para manejar la selección de usuario
  const handleSelectUserForAdd = (user: UserBasicInfo) => {
    setSelectedUserForAdd(user);
    setShowConfirmAddUser(true);
  };

  const handleConfirmAddUser = async () => {
    if (!selectedUserForAdd) return;

    try {
      setIsAddingUser(true);
      const result = await getUsersAPI.addUserToCurrentGym(selectedUserForAdd.id);
      
      // Verificar si es el caso de usuario ya existente
      if (result.message && result.message.includes('ya pertenece')) {
        setUserExistsMessage(result.message);
        setShowUserExistsNotification(true);
        
        setTimeout(() => {
          setShowUserExistsNotification(false);
        }, 5000);
      } else {
        // Usuario añadido exitosamente
        await fetchUsers();
      }
      
      // Limpiar estados
      setSearchEmail('');
      setSearchResults([]);
      setSelectedUserForAdd(null);
      setShowConfirmAddUser(false);
      setIsAddUserModalOpen(false);
      setError(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al añadir usuario');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleCancelAddUser = () => {
    setSelectedUserForAdd(null);
    setShowConfirmAddUser(false);
  };

  // Función para limpiar todos los estados del modal
  const clearAddUserModal = () => {
    setIsAddUserModalOpen(false);
    setError(null);
    setUserIdToAdd('');
    setSearchEmail('');
    setSearchResults([]);
    setSelectedUserForAdd(null);
    setShowConfirmAddUser(false);
  };

  const handleAddUser = async () => {
    if (!userIdToAdd.trim()) return;

    try {
      setIsAddingUser(true);
      const result = await getUsersAPI.addUserToCurrentGym(parseInt(userIdToAdd));
      
      // Verificar si es el caso de usuario ya existente
      if (result.message && result.message.includes('ya pertenece')) {
        // Mostrar notificación específica para usuario existente
        setUserExistsMessage(result.message);
        setShowUserExistsNotification(true);
        
        // Limpiar el modal
        setUserIdToAdd('');
        setIsAddUserModalOpen(false);
        setError(null);
        
        // Auto-ocultar la notificación después de 5 segundos
        setTimeout(() => {
          setShowUserExistsNotification(false);
        }, 5000);
      } else {
        // Usuario añadido exitosamente por primera vez
      await fetchUsers();
      
      // Limpiar el modal
      setUserIdToAdd('');
      setIsAddUserModalOpen(false);
      setError(null);
      
      console.log('Usuario añadido exitosamente:', result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al añadir usuario');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDeleteUser = (user: GymParticipantWithMembership) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeletingUser(true);
      await getUsersAPI.removeUserFromCurrentGym(userToDelete.id);
      
      // Actualizar la lista de usuarios
      await fetchUsers();
      
      // Limpiar el modal
      setUserToDelete(null);
      setIsDeleteModalOpen(false);
      setError(null);
      
      console.log('Usuario eliminado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar usuario');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const clearCache = useCallback(() => {
    // Limpiar localStorage si hay algún cache
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('gym-admin-')) {
          localStorage.removeItem(key);
        }
      });
    }
    fetchUsers();
  }, [fetchUsers]);

  const getMembershipStatusColor = (status?: MembershipStatus) => {
    if (!status) return 'bg-gray-100 text-gray-600';
    
    if (!status.is_active) return 'bg-red-100 text-red-600';
    if (status.days_remaining !== undefined && status.days_remaining !== null && status.days_remaining <= 7) {
      return 'bg-yellow-100 text-yellow-600';
    }
    return 'bg-green-100 text-green-600';
  };

  const getMembershipStatusText = (status?: MembershipStatus) => {
    if (!status) return 'Sin membresía';
    
    if (!status.is_active) return 'Membresía expirada';
    if (status.days_remaining !== undefined && status.days_remaining !== null && status.days_remaining <= 7) {
      return `Expira en ${status.days_remaining} días`;
    }
    return status.plan_name || status.membership_type || 'Membresía activa';
  };

  if (loading) {
    return <UsersLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 border border-red-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XMarkIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar datos</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchUsers}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg"
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
      {/* Header con estadísticas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                <UsersIcon className="h-6 w-6 text-white" />
              </span>
              Gestión de Usuarios
            </h1>
            <p className="text-lg text-gray-600">Administrar {userPlural} y entrenadores del {workspace}</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <UserPlusIcon className="h-5 w-5" />
              <span className="font-semibold">Añadir Usuario</span>
            </button>
            <button
              onClick={clearCache}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <SparklesIcon className="h-5 w-5" />
              <span className="font-semibold">Limpiar Cache</span>
            </button>
            <button
              onClick={fetchUsers}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              <ArrowPathIcon className="h-5 w-5" />
              <span className="font-semibold">Actualizar</span>
            </button>
        </div>
      </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {roleOptions.slice(1, 4).map((role) => {
            const count = users.filter(user => user.gym_role === role.id).length;
            return (
              <div key={role.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-sm transition-shadow duration-200">
                <div className="flex items-center justify-between">
          <div>
                    <p className="text-sm font-medium text-gray-600">{role.name}s</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <div className={`w-8 h-8 ${role.bgColor} rounded-lg flex items-center justify-center`}>
                    <span className={`text-sm ${role.color}`}>
                      {role.id === 'MEMBER' ? '👤' : role.id === 'TRAINER' ? '💪' : '⚙️'}
                  </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-6 hover:shadow-md hover:shadow-blue-100 transition-all duration-200">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Filtros por rol */}
          <div className="flex flex-wrap gap-2">
                    {roleOptions.map((role) => (
              <button
                        key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  selectedRole.id === role.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:from-blue-600 hover:to-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                              {role.name}
              </button>
                    ))}
          </div>

          {/* Búsqueda */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 transition-all duration-200 hover:shadow-sm"
                placeholder="Buscar usuarios por nombre o ID..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de usuarios */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden hover:shadow-md hover:shadow-blue-100 transition-all duration-200">
        {currentUsers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <UserIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-600">Intenta ajustar los filtros de búsqueda o añade nuevos usuarios.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-8">
            {currentUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 hover:scale-105 cursor-pointer group hover:border-blue-300 min-h-[240px] flex flex-col"
                onClick={() => openModal(user)}
              >
                {/* Header con más espacio para el nombre */}
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm leading-5 mb-2 break-words">
                      {getDisplayName(user)}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(user.gym_role)}`}>
                        {getRoleName(user.gym_role)}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(user.is_active)}`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información de membresía */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCardIcon className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium text-gray-600">Plan de Membresía</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getMembershipStatusColor(user.membershipStatus)}`}>
                      {getMembershipStatusText(user.membershipStatus)}
                    </span>
                    {user.membershipStatus && user.membershipStatus.expires_at && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3" />
                        <span>
                          {new Date(user.membershipStatus.expires_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información de contacto */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <EnvelopeIcon className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {user.email || 'Sin email'}
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <PhoneIcon className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {user.phone_number || 'Sin teléfono'}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(user);
                      }}
                      className="flex-1 text-center text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 hover:shadow-md"
                    >
                      Ver perfil
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user);
                      }}
                      className="px-3 py-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-sm"
                      title="Eliminar usuario"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="bg-white rounded-2xl shadow-sm border border-blue-200 px-6 py-4 hover:shadow-md hover:shadow-blue-100 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <UsersIcon className="h-4 w-4 mr-2 text-blue-500" />
              <span className="font-medium">Página {currentPage} de {totalPages}</span>
              <span className="mx-2 text-blue-400">•</span>
              <span className="font-medium">{filteredUsers.length} usuarios</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-500 rounded-lg shadow-sm font-semibold">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Detalles del Usuario
                    </Dialog.Title>
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {selectedUser && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <UserIcon className="h-10 w-10 text-white" />
                        </div>
                        <h4 className="text-xl font-semibold text-gray-900">
                          {getDisplayName(selectedUser)}
                        </h4>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedUser.gym_role)}`}>
                            {getRoleName(selectedUser.gym_role)}
                          </span>
                          <button
                            onClick={() => handleRoleEdit(selectedUser)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Cambiar rol"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Interfaz de cambio de rol */}
                      {isEditingRole && (
                        <div className="border-t border-gray-200 pt-4 mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-3">Cambiar rol del usuario</h5>
                          <div className="space-y-3">
                            {roleChangeOptions.map((option) => (
                              <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                                <input
                                  type="radio"
                                  name="newRole"
                                  value={option.value}
                                  checked={selectedNewRole === option.value}
                                  onChange={(e) => setSelectedNewRole(e.target.value as 'MEMBER' | 'TRAINER' | 'ADMIN')}
                                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">{option.name}</div>
                                  <div className="text-xs text-gray-500">{option.description}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                          <div className="flex space-x-3 mt-4">
                            <button
                              onClick={handleRoleUpdate}
                              disabled={isUpdatingRole || selectedNewRole === selectedUser.gym_role}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
                            >
                              {isUpdatingRole ? 'Actualizando...' : 'Actualizar Rol'}
                            </button>
                            <button
                              onClick={() => setIsEditingRole(false)}
                              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="border-t border-gray-200 pt-4 space-y-4">
                        {/* Información básica */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">ID de Usuario</label>
                            <p className="text-gray-900">{selectedUser.id}</p>
                          </div>
                          {selectedUser.auth0_id && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Auth0 ID</label>
                              <p className="text-gray-900 text-xs font-mono">{selectedUser.auth0_id}</p>
                            </div>
                          )}
                        </div>

                        {/* Información de contacto */}
                        <div className="space-y-3">
                          <h6 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">Información de Contacto</h6>
                          {selectedUser.email && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Email</label>
                              <p className="text-gray-900">{selectedUser.email}</p>
                            </div>
                          )}
                          {selectedUser.phone_number && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Teléfono</label>
                              <p className="text-gray-900">{selectedUser.phone_number}</p>
                            </div>
                          )}
                        </div>

                        {/* Información física */}
                        {(selectedUser.birth_date || selectedUser.height || selectedUser.weight) && (
                          <div className="space-y-3">
                            <h6 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">Información Física</h6>
                            {selectedUser.birth_date && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                                <p className="text-gray-900">{new Date(selectedUser.birth_date).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}</p>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              {selectedUser.height && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Altura</label>
                                  <p className="text-gray-900">{selectedUser.height} ft</p>
                                </div>
                              )}
                              {selectedUser.weight && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Peso</label>
                                  <p className="text-gray-900">{selectedUser.weight} lbs</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Información de suscripción */}
                        {selectedUser.membershipStatus && (
                          <div className="space-y-3">
                            <h6 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1 flex items-center">
                              <CreditCardIcon className="h-4 w-4 mr-2 text-blue-500" />
                              Información de Suscripción
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-500">Plan de Membresía</label>
                                <p className="text-gray-900 font-medium">{selectedUser.membershipStatus.plan_name || selectedUser.membershipStatus.membership_type}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Estado</label>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMembershipStatusColor(selectedUser.membershipStatus)}`}>
                                    {selectedUser.membershipStatus.is_active ? 'Activa' : 'Inactiva'}
                                  </span>
                                  {selectedUser.membershipStatus.can_access && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Puede acceder
                                    </span>
                                  )}
                                </div>
                              </div>
                              {selectedUser.membershipStatus.expires_at && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Fecha de Expiración</label>
                                  <p className="text-gray-900">
                                    {new Date(selectedUser.membershipStatus.expires_at).toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              )}
                              {selectedUser.membershipStatus.days_remaining !== undefined && selectedUser.membershipStatus.days_remaining !== null && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Días Restantes</label>
                                  <p className={`text-gray-900 font-medium ${selectedUser.membershipStatus.days_remaining <= 7 ? 'text-yellow-600' : ''}`}>
                                    {selectedUser.membershipStatus.days_remaining} días
                                  </p>
                                </div>
                              )}
                              <div>
                                <label className="text-sm font-medium text-gray-500">{workspace.charAt(0).toUpperCase() + workspace.slice(1)}</label>
                                <p className="text-gray-900">{selectedUser.membershipStatus.gym_name}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Información del gimnasio */}
                        <div className="space-y-3">
                          <h6 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">Información del Gimnasio</h6>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">Rol en el Sistema</label>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)} mt-1`}>
                                {getRoleName(selectedUser.role)}
                              </span>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">Estado</label>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedUser.is_active)}`}>
                                  {selectedUser.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                                {selectedUser.is_superuser && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Superusuario
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {selectedUser.qr_code && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Código QR</label>
                              <p className="text-gray-900 font-mono text-sm mb-2">{selectedUser.qr_code}</p>
                              <button
                                onClick={() => setShowQRCode(!showQRCode)}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg transition-colors"
                              >
                                {showQRCode ? 'Ocultar QR' : 'Ver QR'}
                              </button>
                              {showQRCode && (
                                <div className="mt-3 text-center">
                                  <Image
                                    src={generateQRCodeURL(selectedUser.qr_code)}
                                    alt={`Código QR: ${selectedUser.qr_code}`}
                                    width={200}
                                    height={200}
                                    className="mx-auto border border-gray-200 rounded-lg"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.setAttribute('style', 'display: block');
                                    }}
                                  />
                                  <p className="text-xs text-gray-500 mt-2 hidden">
                                    Error al cargar el código QR
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Biografía y objetivos */}
                        {(selectedUser.bio || selectedUser.goals || selectedUser.health_conditions) && (
                          <div className="space-y-3">
                            <h6 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">Información Personal</h6>
                            {selectedUser.bio && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Biografía</label>
                                <p className="text-gray-900 text-sm">{selectedUser.bio}</p>
                              </div>
                            )}
                            {selectedUser.goals && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Objetivos</label>
                                <p className="text-gray-900 text-sm">{selectedUser.goals}</p>
                              </div>
                            )}
                            {selectedUser.health_conditions && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">Condiciones de Salud</label>
                                <p className="text-gray-900 text-sm">{selectedUser.health_conditions}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Fechas del sistema */}
                        <div className="space-y-3">
                          <h6 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">Fechas del Sistema</h6>
                          {selectedUser.created_at && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Fecha de registro</label>
                              <p className="text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</p>
                            </div>
                          )}
                          {selectedUser.updated_at && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Última actualización</label>
                              <p className="text-gray-900">{new Date(selectedUser.updated_at).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}</p>
                            </div>
                          )}
                        </div>

                        {/* Imagen de perfil */}
                        {selectedUser.picture && (
                          <div className="space-y-3">
                            <h6 className="text-sm font-semibold text-gray-700 border-b border-gray-200 pb-1">Imagen de Perfil</h6>
                            <div className="flex items-center space-x-4">
                              <Image 
                                src={selectedUser.picture} 
                                alt="Foto de perfil" 
                                width={64}
                                height={64}
                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <div>
                                <p className="text-sm text-gray-600">URL de la imagen:</p>
                                <a 
                                  href={selectedUser.picture} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                                >
                                  {selectedUser.picture}
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    {selectedUser && (
                      <Link
                        href={`/usuarios/${selectedUser.id}`}
                        className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                        onClick={()=>setIsModalOpen(false)}
                      >
                        Ver perfil
                      </Link>
                    )}
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      onClick={closeModal}
                    >
                      Cerrar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal para añadir usuario */}
      <Transition appear show={isAddUserModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={clearAddUserModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Añadir Usuario al {workspace.charAt(0).toUpperCase() + workspace.slice(1)}
                    </Dialog.Title>
                    <button
                      onClick={clearAddUserModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserIcon className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-gray-600 text-sm">
                        Busca usuarios por email para añadirlos al {workspace}. El usuario será asignado como {userSingular.toUpperCase()} por defecto.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email del Usuario
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={searchEmail}
                          onChange={(e) => setSearchEmail(e.target.value)}
                          placeholder="Ej: usuario@ejemplo.com"
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          disabled={isAddingUser}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        {isSearching && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <ArrowPathIcon className="h-5 w-5 text-gray-400 animate-spin" />
                          </div>
                        )}
                      </div>
                      {searchEmail.length > 0 && searchEmail.length < 3 && (
                        <p className="text-xs text-gray-500 mt-1">Escribe al menos 3 caracteres para buscar</p>
                      )}
                    </div>

                    {/* Resultados de búsqueda */}
                    {searchResults.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Usuarios encontrados:</h4>
                        <div className="max-h-32 overflow-y-auto space-y-2">
                          {searchResults.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => handleSelectUserForAdd(user)}
                              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                              disabled={isAddingUser}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <UserIcon className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {user.first_name} {user.last_name}
                                  </p>
                                  <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mensaje cuando no hay resultados */}
                    {searchEmail.length >= 3 && !isSearching && searchResults.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No se encontraron usuarios con ese email</p>
                      </div>
                    )}

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                      onClick={clearAddUserModal}
                      disabled={isAddingUser}
                    >
                      Cerrar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de confirmación para eliminar usuario */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
          setError(null);
        }}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Eliminar Usuario del {workspace.charAt(0).toUpperCase() + workspace.slice(1)}
                    </Dialog.Title>
                    <button
                      onClick={() => {
                        setIsDeleteModalOpen(false);
                        setUserToDelete(null);
                        setError(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {userToDelete && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ExclamationTriangleIcon className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          ¿Estás seguro?
                        </h4>
                        <p className="text-gray-600 text-sm mb-4">
                          Vas a eliminar a <span className="font-medium">{getDisplayName(userToDelete)}</span> del {workspace}.
                          Esta acción no se puede deshacer.
                        </p>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h5 className="text-sm font-medium text-yellow-800">Información importante</h5>
                            <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                              <li>• El usuario perderá acceso al {workspace}</li>
                              <li>• Se eliminarán sus datos de membresía</li>
                              <li>• El usuario puede ser añadido nuevamente más tarde</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 flex space-x-3">
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                      onClick={() => {
                        setIsDeleteModalOpen(false);
                        setUserToDelete(null);
                        setError(null);
                      }}
                      disabled={isDeletingUser}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      onClick={confirmDeleteUser}
                      disabled={isDeletingUser}
                    >
                      {isDeletingUser ? 'Eliminando...' : 'Eliminar Usuario'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de notificación para usuario existente */}
      <Transition appear show={showUserExistsNotification} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowUserExistsNotification(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-amber-200">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                      <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mr-3">
                        <ExclamationTriangleIcon className="h-4 w-4 text-white" />
                      </div>
                      Usuario Ya Registrado
                    </Dialog.Title>
                    <button
                      onClick={() => setShowUserExistsNotification(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserIcon className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed mb-4">
                      {userExistsMessage}
                    </p>
                    <p className="text-amber-600 text-sm">
                      No es necesario realizar ninguna acción adicional.
                    </p>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-lg border border-transparent bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-md"
                      onClick={() => setShowUserExistsNotification(false)}
                    >
                      Entendido
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de confirmación para añadir usuario seleccionado */}
      <Transition appear show={showConfirmAddUser} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCancelAddUser}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Confirmar Añadir Usuario
                    </Dialog.Title>
                    <button
                      onClick={handleCancelAddUser}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isAddingUser}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {selectedUserForAdd && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <UserIcon className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {selectedUserForAdd.first_name} {selectedUserForAdd.last_name}
                        </h4>
                        <p className="text-gray-600 text-sm mb-4">
                          {selectedUserForAdd.email}
                        </p>
                        <p className="text-gray-600 text-sm">
                          ¿Estás seguro que deseas añadir este usuario al {workspace}?
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <UserPlusIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h5 className="text-sm font-medium text-blue-800">Información del proceso</h5>
                            <ul className="text-xs text-blue-700 mt-1 space-y-1">
                              <li>• El usuario será añadido como MEMBER</li>
                              <li>• Tendrá acceso básico al {workspace}</li>
                              <li>• Podrás cambiar su rol después si es necesario</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 flex space-x-3">
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                      onClick={handleCancelAddUser}
                      disabled={isAddingUser}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      onClick={handleConfirmAddUser}
                      disabled={isAddingUser}
                    >
                      {isAddingUser ? 'Añadiendo...' : 'Confirmar y Añadir'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
} 