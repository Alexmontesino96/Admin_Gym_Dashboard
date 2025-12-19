'use client';

import { useState, useMemo } from 'react';
import { User, Search, CheckCircle2, Circle } from 'lucide-react';
import { GymParticipant } from '@/lib/api';

interface UserSelectorProps {
  users: GymParticipant[];
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
  loading?: boolean;
}

export default function UserSelector({
  users,
  selectedUserIds,
  onSelectionChange,
  loading = false
}: UserSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Construir nombre completo
  const getFullName = (user: GymParticipant) => {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
  };

  // Filtrar usuarios por búsqueda
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;

    const term = searchTerm.toLowerCase();
    return users.filter(user => {
      const fullName = getFullName(user);
      return fullName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);
    });
  }, [users, searchTerm]);

  const handleToggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onSelectionChange(selectedUserIds.filter(id => id !== userId));
    } else {
      onSelectionChange([...selectedUserIds, userId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredUsers.map(u => String(u.id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          id="user-search"
          name="user-search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Contador y Seleccionar todos */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          {selectedUserIds.length} de {filteredUsers.length} seleccionados
        </span>
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {selectedUserIds.length === filteredUsers.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
        </button>
      </div>

      {/* Lista de usuarios */}
      <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => {
              const userId = String(user.id);
              const isSelected = selectedUserIds.includes(userId);

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleToggleUser(userId)}
                  className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Checkbox visual */}
                  <div className="flex-shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </div>

                  {/* Info del usuario */}
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {getFullName(user)}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Badge de rol */}
                  <div className="flex-shrink-0">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.gym_role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                      user.gym_role === 'TRAINER' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {user.gym_role}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
