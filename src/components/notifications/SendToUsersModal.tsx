'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Send, Users } from 'lucide-react';
import { GymParticipant } from '@/lib/api';
import { useNotifications, NotificationFormData } from '@/hooks/useNotifications';
import UserSelector from './UserSelector';
import NotificationForm from './NotificationForm';

interface SendToUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: GymParticipant[];
  usersLoading: boolean;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

export default function SendToUsersModal({
  isOpen,
  onClose,
  users,
  usersLoading,
  onSuccess,
  onError
}: SendToUsersModalProps) {
  const { sendToUsers, sending } = useNotifications();

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    data: ''
  });

  const handleFormChange = (field: keyof NotificationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    if (sending) return;
    setSelectedUserIds([]);
    setFormData({ title: '', message: '', data: '' });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await sendToUsers(selectedUserIds, formData);
      onSuccess(response.message);
      handleClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar notificación';
      onError(errorMessage);
    }
  };

  const canSubmit =
    formData.title.trim() !== '' &&
    formData.message.trim() !== '' &&
    selectedUserIds.length > 0 &&
    !sending;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Enviar a Usuarios Específicos
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Selecciona usuarios y escribe tu mensaje
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={sending}
                    className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Selector de usuarios */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Seleccionar destinatarios
                    </h3>
                    <UserSelector
                      users={users}
                      selectedUserIds={selectedUserIds}
                      onSelectionChange={setSelectedUserIds}
                      loading={usersLoading}
                    />
                  </div>

                  {/* Formulario de notificación */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">
                      Contenido de la notificación
                    </h3>
                    <NotificationForm
                      formData={formData}
                      onChange={handleFormChange}
                      showDataField
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={sending}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Enviar a {selectedUserIds.length} usuario{selectedUserIds.length !== 1 ? 's' : ''}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
