'use client';

import { useState, useEffect, useCallback } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  ChevronUpDownIcon,
  CheckIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { getSelectedGymId, setSelectedGymId } from '@/lib/api';

interface Gym {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  owner_count?: number;
  member_count?: number;
}

interface GymSelectorProps {
  onGymChange?: (gymId: number) => void;
  compact?: boolean;
}

export default function GymSelector({ onGymChange, compact = false }: GymSelectorProps) {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = async () => {
    try {
      const response = await fetch('/api/token');
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.action === 'logout_required') {
          // Redirigir a logout para obtener un nuevo token con el audience correcto
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
  };

  const fetchGyms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) {
        return; // El usuario será redirigido para logout/login
      }

      // Guardar el token en localStorage para otros componentes
      localStorage.setItem('auth_token', token);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/gyms/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token inválido, limpiar localStorage y redirigir
          localStorage.removeItem('auth_token');
          localStorage.removeItem('selected_gym_id');
          throw new Error('Token de autenticación inválido. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setGyms(data);

      // Auto-seleccionar el primer gimnasio si hay alguno
      if (data.length > 0) {
        const savedGymId = getSelectedGymId();
        const gymToSelect = savedGymId
          ? data.find((gym: Gym) => gym.id === parseInt(savedGymId)) || data[0]
          : data[0];

        setSelectedGym(gymToSelect);
        setSelectedGymId(gymToSelect.id.toString());
        onGymChange?.(gymToSelect.id);
      }
    } catch (err) {
      console.error('Error fetching gyms:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar gimnasios');
    } finally {
      setLoading(false);
    }
  }, [onGymChange]);

  useEffect(() => {
    fetchGyms();
  }, [fetchGyms]);

  const handleGymChange = (gym: Gym) => {
    setSelectedGym(gym);
    setSelectedGymId(gym.id.toString());

    // Limpiar cache de workspace context para forzar re-fetch
    sessionStorage.removeItem('workspace_context');

    // Notificar cambio a otros componentes
    window.dispatchEvent(new CustomEvent('gymChanged', { detail: { gymId: gym.id } }));

    onGymChange?.(gym.id);

    // Recargar la página para aplicar el nuevo contexto
    window.location.reload();
  };

  if (loading) {
    return (
      <div className={compact ? "p-4" : "bg-white border border-gray-200 rounded-xl p-6 shadow-sm"}>
        <div className="animate-pulse flex items-center space-x-4">
          <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} bg-gray-200 rounded-full`}></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={compact ? "p-4" : "bg-white border border-red-200 rounded-xl p-6 shadow-sm"}>
        <div className="flex items-center space-x-3">
          <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} bg-red-100 rounded-full flex items-center justify-center`}>
            <BuildingOfficeIcon className={`${compact ? 'h-4 w-4' : 'h-6 w-6'} text-red-600`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-medium text-red-900 ${compact ? 'text-sm' : ''}`}>Error al cargar gimnasios</h3>
            <p className={`text-red-700 ${compact ? 'text-xs' : 'text-sm'}`}>{error}</p>
          </div>
        </div>
        <button
          onClick={fetchGyms}
          className={`${compact ? 'mt-2 text-xs' : 'mt-4'} w-full bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg transition-colors duration-200`}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (gyms.length === 0) {
    return (
      <div className={compact ? "p-4" : "bg-white border border-gray-200 rounded-xl p-6 shadow-sm"}>
        <div className="text-center">
          <BuildingOfficeIcon className={`${compact ? 'h-8 w-8' : 'h-12 w-12'} text-gray-400 mx-auto mb-3`} />
          <h3 className={`font-medium text-gray-900 mb-1 ${compact ? 'text-sm' : ''}`}>No hay gimnasios disponibles</h3>
          <p className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>Contacta al administrador para obtener acceso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "" : "bg-white border border-gray-200 rounded-xl p-6 shadow-sm"}>
      {!compact && (
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <BuildingOfficeIcon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Gimnasio Activo</h2>
            <p className="text-sm text-gray-600">Selecciona el gimnasio a gestionar</p>
          </div>
        </div>
      )}

      <div className={compact ? "" : "mt-4"}>
        <Listbox value={selectedGym} onChange={handleGymChange}>
          <div className="relative">
            <Listbox.Button className={`relative w-full cursor-pointer rounded-lg bg-gray-50 ${compact ? 'py-2 pl-3 pr-8' : 'py-3 pl-4 pr-10'} text-left border border-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}>
              {selectedGym ? (
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <span className={`block font-medium text-gray-900 truncate ${compact ? 'text-sm' : ''}`}>
                      {selectedGym.name}
                    </span>
                    {!compact && selectedGym.description && (
                      <span className="block text-sm text-gray-500 truncate">
                        {selectedGym.description}
                      </span>
                    )}
                  </div>
                  {!compact && (
                    <div className="flex items-center space-x-4 text-xs text-gray-500 ml-4">
                      {selectedGym.member_count !== undefined && (
                        <div className="flex items-center space-x-1">
                          <UserGroupIcon className="h-3 w-3" />
                          <span>Miembro desde: {new Date(selectedGym.created_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <span className={`block text-gray-400 ${compact ? 'text-sm' : ''}`}>Seleccionar gimnasio...</span>
              )}
              <span className={`pointer-events-none absolute inset-y-0 right-0 flex items-center ${compact ? 'pr-2' : 'pr-3'}`}>
                <ChevronUpDownIcon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400`} aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200">
                {gyms.map((gym) => (
                  <Listbox.Option
                    key={gym.id}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-3 pl-4 pr-10 ${
                        active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                      }`
                    }
                    value={gym}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <span className={`block font-medium truncate ${selected ? 'text-blue-600' : 'text-gray-900'} ${compact ? 'text-sm' : ''}`}>
                              {gym.name}
                            </span>
                            {!compact && gym.description && (
                              <span className={`block text-sm truncate ${active ? 'text-blue-700' : 'text-gray-500'}`}>
                                {gym.description}
                              </span>
                            )}
                          </div>
                          {!compact && (
                            <div className="flex items-center space-x-3 text-xs text-gray-500 ml-4">
                              <div className="flex items-center space-x-1">
                                <CalendarIcon className="h-3 w-3" />
                                <span>{new Date(gym.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {selected ? (
                          <span className={`absolute inset-y-0 right-0 flex items-center pr-4 ${active ? 'text-blue-600' : 'text-blue-600'}`}>
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      </div>

      {!compact && selectedGym && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-blue-800">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="font-medium">Gimnasio seleccionado:</span>
            <span>{selectedGym.name}</span>
          </div>
        </div>
      )}
    </div>
  );
} 