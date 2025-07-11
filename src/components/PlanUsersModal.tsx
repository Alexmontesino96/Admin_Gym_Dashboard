'use client';

import { PlanUserDetail } from '@/lib/api';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  CreditCard, 
  Clock,
  Badge,
  ExternalLink
} from 'lucide-react';

interface PlanUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  planPrice: number;
  planCurrency: string;
  users: PlanUserDetail[];
}

export default function PlanUsersModal({ 
  isOpen, 
  onClose, 
  planName, 
  planPrice, 
  planCurrency,
  users 
}: PlanUsersModalProps) {

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMembershipTypeLabel = (type: string) => {
    const types = {
      'free': 'Gratuita',
      'paid': 'De Pago',
      'trial': 'Prueba'
    };
    return types[type as keyof typeof types] || type;
  };

  const getMembershipTypeColor = (type: string) => {
    const colors = {
      'free': 'bg-green-100 text-green-800',
      'paid': 'bg-blue-100 text-blue-800',
      'trial': 'bg-amber-100 text-amber-800'
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  const getAssociationMethodLabel = (method: string) => {
    const methods = {
      'stripe_connect_subscription': 'Stripe Subscription',
      'manual': 'Manual',
      'admin_assigned': 'Asignado por Admin'
    };
    return methods[method as keyof typeof methods] || method;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Usuarios Suscritos: {planName}
                </h2>
                <p className="text-sm text-slate-600">
                  {formatCurrency(planPrice, planCurrency)} • {users.length} usuario{users.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {users.length === 0 ? (
            /* No users */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={24} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Sin usuarios suscritos</h3>
              <p className="text-slate-600">
                Este plan aún no tiene usuarios suscritos.
              </p>
            </div>
          ) : (
            /* Users list */
            <div className="space-y-4">
              {users.map((user, index) => (
                <div 
                  key={user.user_id} 
                  className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {user.first_name} {user.last_name}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Mail size={14} className="text-slate-400" />
                            <span className="text-sm text-slate-600">{user.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {/* Membership Type */}
                        <div className="flex items-center space-x-2">
                          <Badge size={14} className="text-slate-400" />
                          <span className="text-slate-600">Tipo:</span>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getMembershipTypeColor(user.membership_type)}`}>
                            {getMembershipTypeLabel(user.membership_type)}
                          </span>
                        </div>

                        {/* Expiry Date */}
                        <div className="flex items-center space-x-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-slate-600">Expira:</span>
                          <span className="font-medium text-slate-900">
                            {formatDate(user.expires_at)}
                          </span>
                        </div>

                        {/* Association Method */}
                        <div className="flex items-center space-x-2">
                          <CreditCard size={14} className="text-slate-400" />
                          <span className="text-slate-600">Método:</span>
                          <span className="font-medium text-slate-900">
                            {getAssociationMethodLabel(user.association_method)}
                          </span>
                        </div>

                        {/* User IDs */}
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-600">ID Usuario:</span>
                          <span className="font-mono text-xs bg-slate-200 px-2 py-1 rounded">
                            {user.user_id}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-slate-600">ID Gym:</span>
                          <span className="font-mono text-xs bg-slate-200 px-2 py-1 rounded">
                            {user.user_gym_id}
                          </span>
                        </div>

                        {/* Stripe Info */}
                        {user.stripe_customer_id && (
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-600">Stripe Customer:</span>
                            <span className="font-mono text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              {user.stripe_customer_id}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Stripe Subscription ID (if available) */}
                      {user.stripe_subscription_id && (
                        <div className="mt-3 p-2 bg-purple-50 rounded border">
                          <div className="flex items-center space-x-2">
                            <CreditCard size={14} className="text-purple-600" />
                            <span className="text-sm text-purple-700">Subscription ID:</span>
                            <span className="font-mono text-xs text-purple-800">
                              {user.stripe_subscription_id}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4">
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {users.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Resumen</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Total usuarios:</span>
                    <span className="font-bold text-blue-900 ml-2">{users.length}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Usuarios de pago:</span>
                    <span className="font-bold text-blue-900 ml-2">
                      {users.filter(u => u.membership_type === 'paid').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Con Stripe:</span>
                    <span className="font-bold text-blue-900 ml-2">
                      {users.filter(u => u.stripe_subscription_id).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
} 