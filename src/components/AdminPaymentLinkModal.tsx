'use client';

import { useState, useEffect } from 'react';
import { membershipAPI, AdminPaymentLinkRequest, AdminPaymentLinkResponse, MembershipPlan, GymParticipant } from '@/lib/api';
import { 
  X, 
  AlertCircle, 
  RefreshCw, 
  Link as LinkIcon, 
  User, 
  CreditCard, 
  Calendar, 
  FileText, 
  ExternalLink, 
  Copy, 
  CheckCircle 
} from 'lucide-react';

interface AdminPaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: MembershipPlan[];
  users?: GymParticipant[];
  preselectedUserId?: number;
  preselectedPlanId?: number;
}

export default function AdminPaymentLinkModal({ 
  isOpen, 
  onClose, 
  plans, 
  users = [], 
  preselectedUserId,
  preselectedPlanId 
}: AdminPaymentLinkModalProps) {
  const [formData, setFormData] = useState<AdminPaymentLinkRequest>({
    user_id: preselectedUserId || 0,
    plan_id: preselectedPlanId || 0,
    success_url: '',
    cancel_url: '',
    notes: '',
    expires_in_hours: 24
  });

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState<AdminPaymentLinkResponse | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        user_id: preselectedUserId || 0,
        plan_id: preselectedPlanId || 0,
        success_url: '',
        cancel_url: '',
        notes: '',
        expires_in_hours: 24
      });
      setPaymentLink(null);
      setCreateError(null);
      setLinkCopied(false);
    }
  }, [isOpen, preselectedUserId, preselectedPlanId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleCreatePaymentLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user_id || !formData.plan_id) {
      setCreateError('Debe seleccionar un usuario y un plan');
      return;
    }

    setCreating(true);
    setCreateError(null);
    
    try {
      const response = await membershipAPI.createPaymentLink(formData);
      setPaymentLink(response);
    } catch (err) {
      console.error('Error creating payment link:', err);
      setCreateError(err instanceof Error ? err.message : 'Error al crear el enlace de pago');
    } finally {
      setCreating(false);
    }
  };

  const copyLinkToClipboard = async () => {
    if (!paymentLink) return;
    
    try {
      await navigator.clipboard.writeText(paymentLink.checkout_url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const openPaymentLink = () => {
    if (paymentLink) {
      window.open(paymentLink.checkout_url, '_blank');
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const selectedUser = users.find(user => user.id === formData.user_id);
  const selectedPlan = plans.find(plan => plan.id === formData.plan_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <LinkIcon size={20} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {paymentLink ? 'Enlace de Pago Creado' : 'Crear Enlace de Pago'}
              </h2>
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
          {!paymentLink ? (
            /* Form */
            <form onSubmit={handleCreatePaymentLink} className="space-y-6">
              {/* Error */}
              {createError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle size={16} className="text-red-600" />
                    <span className="text-sm text-red-800">{createError}</span>
                  </div>
                </div>
              )}

              {/* Selección de Usuario y Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Usuario <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>Seleccionar usuario...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </option>
                    ))}
                  </select>
                  {selectedUser && (
                    <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
                      <div className="flex items-center space-x-2">
                        <User size={14} className="text-slate-500" />
                        <span className="text-slate-700">{selectedUser.email}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Plan de Membresía <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="plan_id"
                    value={formData.plan_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>Seleccionar plan...</option>
                    {plans.filter(plan => plan.is_active).map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - {formatCurrency(plan.price_cents / 100, plan.currency)}
                      </option>
                    ))}
                  </select>
                  {selectedPlan && (
                    <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
                      <div className="flex items-center space-x-2">
                        <CreditCard size={14} className="text-slate-500" />
                        <span className="text-slate-700">{selectedPlan.description}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* URLs (opcionales) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    URL de Éxito (opcional)
                  </label>
                  <input
                    type="url"
                    name="success_url"
                    value={formData.success_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://tudominio.com/success"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    URL de Cancelación (opcional)
                  </label>
                  <input
                    type="url"
                    name="cancel_url"
                    value={formData.cancel_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://tudominio.com/cancel"
                  />
                </div>
              </div>

              {/* Expiración */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expira en (horas)
                </label>
                <select
                  name="expires_in_hours"
                  value={formData.expires_in_hours}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 hora</option>
                  <option value={6}>6 horas</option>
                  <option value={12}>12 horas</option>
                  <option value={24}>24 horas</option>
                  <option value={48}>48 horas</option>
                  <option value={72}>72 horas</option>
                  <option value={168}>1 semana</option>
                </select>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Notas internas sobre este enlace de pago..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || !formData.user_id || !formData.plan_id}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {creating ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <LinkIcon size={16} />
                  )}
                  <span>{creating ? 'Creando...' : 'Crear Enlace'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Payment Link Created */
            <div className="space-y-6">
              {/* Success message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm text-green-800">¡Enlace de pago creado exitosamente!</span>
                </div>
              </div>

              {/* Payment Link Details */}
              <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-slate-900 mb-4">Detalles del Enlace</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Usuario:</span>
                    <p className="font-medium text-slate-900">{paymentLink.user_name}</p>
                    <p className="text-slate-600">{paymentLink.user_email}</p>
                  </div>
                  
                  <div>
                    <span className="text-slate-600">Plan:</span>
                    <p className="font-medium text-slate-900">{paymentLink.plan_name}</p>
                    <p className="text-slate-600">{formatCurrency(paymentLink.price_amount, paymentLink.currency)}</p>
                  </div>
                  
                  <div>
                    <span className="text-slate-600">Expira:</span>
                    <p className="font-medium text-slate-900">
                      {new Date(paymentLink.expires_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-slate-600">Creado por:</span>
                    <p className="font-medium text-slate-900">{paymentLink.created_by_admin}</p>
                  </div>
                </div>

                {paymentLink.notes && (
                  <div>
                    <span className="text-slate-600">Notas:</span>
                    <p className="font-medium text-slate-900">{paymentLink.notes}</p>
                  </div>
                )}
              </div>

              {/* Payment Link URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Enlace de Pago
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={paymentLink.checkout_url}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={copyLinkToClipboard}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      linkCopied 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    {linkCopied ? (
                      <CheckCircle size={16} />
                    ) : (
                      <Copy size={16} />
                    )}
                    <span>{linkCopied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={openPaymentLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <ExternalLink size={16} />
                    <span>Abrir</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setPaymentLink(null);
                    setFormData({
                      user_id: preselectedUserId || 0,
                      plan_id: preselectedPlanId || 0,
                      success_url: '',
                      cancel_url: '',
                      notes: '',
                      expires_in_hours: 24
                    });
                  }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Crear Otro
                </button>
                <button
                  onClick={onClose}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 