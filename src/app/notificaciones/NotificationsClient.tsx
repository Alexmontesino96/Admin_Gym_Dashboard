'use client';

import { useState, useEffect } from 'react';
import { Users, Megaphone, Bell } from 'lucide-react';
import { GymParticipant, getUsersAPI } from '@/lib/api';
import { useTerminology } from '@/hooks/useTerminology';
import QuickGuideCard from '@/components/notifications/QuickGuideCard';
import SendToUsersModal from '@/components/notifications/SendToUsersModal';
import SendToAllModal from '@/components/notifications/SendToAllModal';
import NotificationSuccessModal from '@/components/notifications/NotificationSuccessModal';
import NotificationErrorModal from '@/components/notifications/NotificationErrorModal';

export default function NotificationsClient() {
  const { userPlural } = useTerminology();

  // Estados
  const [users, setUsers] = useState<GymParticipant[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modales
  const [sendToUsersModalOpen, setSendToUsersModalOpen] = useState(false);
  const [sendToAllModalOpen, setSendToAllModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  // Mensajes
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Cargar usuarios al montar
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await getUsersAPI.getGymParticipants();
      // Filtrar usuarios válidos (excluyendo OWNER si es necesario)
      const validUsers = data.filter((user: GymParticipant) => user.gym_role !== 'OWNER');
      setUsers(validUsers);
      setTotalUsers(validUsers.length);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setUsersLoading(false);
    }
  };

  // Handlers de éxito y error
  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setSuccessModalOpen(true);
  };

  const handleError = (error: string) => {
    setErrorMessage(error);
    setErrorModalOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Bell className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Notificaciones Push
          </h1>
          <p className="text-gray-600">
            Envía mensajes a tus {userPlural} vía OneSignal
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Acciones */}
        <div className="lg:col-span-2 space-y-4">
          {/* Card: Enviar a usuarios específicos */}
          <button
            onClick={() => setSendToUsersModalOpen(true)}
            disabled={usersLoading || totalUsers === 0}
            className="w-full bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Enviar a Usuarios Específicos
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Selecciona manualmente a qué {userPlural} enviar la notificación
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">Selector de usuarios</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700">Búsqueda y filtros</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                Abrir →
              </div>
            </div>
          </button>

          {/* Card: Enviar a todos */}
          <button
            onClick={() => setSendToAllModalOpen(true)}
            disabled={usersLoading || totalUsers === 0}
            className="w-full bg-white border border-gray-200 rounded-lg p-6 hover:border-orange-500 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Megaphone className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Enviar a Todos los {userPlural.charAt(0).toUpperCase() + userPlural.slice(1)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Notificación masiva a los {totalUsers} {userPlural} registrados
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">Envío automático</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-700">Anuncios generales</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-orange-600 group-hover:text-orange-700">
                Abrir →
              </div>
            </div>
          </button>

          {/* Estado de carga */}
          {usersLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-700">Cargando usuarios...</span>
            </div>
          )}

          {/* Sin usuarios */}
          {!usersLoading && totalUsers === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700">
                No hay {userPlural} registrados en el sistema para enviar notificaciones.
              </p>
            </div>
          )}
        </div>

        {/* Columna derecha - Guía rápida */}
        <div className="lg:col-span-1">
          <QuickGuideCard />
        </div>
      </div>

      {/* Modales */}
      <SendToUsersModal
        isOpen={sendToUsersModalOpen}
        onClose={() => setSendToUsersModalOpen(false)}
        users={users}
        usersLoading={usersLoading}
        onSuccess={handleSuccess}
        onError={handleError}
      />

      <SendToAllModal
        isOpen={sendToAllModalOpen}
        onClose={() => setSendToAllModalOpen(false)}
        totalUsers={totalUsers}
        onSuccess={handleSuccess}
        onError={handleError}
      />

      <NotificationSuccessModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        message={successMessage}
      />

      <NotificationErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        error={errorMessage}
      />
    </div>
  );
}
