'use client';

import React, { useState } from 'react';
import { useModules } from '@/hooks/useModules';
import HeroSection from '@/components/features/HeroSection';
import CurrentModulesSection from '@/components/features/CurrentModulesSection';
import StatsBar from '@/components/features/StatsBar';
import ModulesMarketplace from '@/components/features/ModulesMarketplace';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function FeaturesClient() {
  const {
    enrichedModules,
    activeModules,
    inactiveModules,
    loading,
    error,
    activateModule,
    refetch
  } = useModules();

  const [activationSuccess, setActivationSuccess] = useState<string | null>(null);
  const [activationError, setActivationError] = useState<string | null>(null);

  const handleActivateModule = async (code: string) => {
    setActivationSuccess(null);
    setActivationError(null);

    const result = await activateModule(code);

    if (result.success) {
      const moduleName =
        enrichedModules.find((m) => m.code === code)?.displayName || code;
      setActivationSuccess(`¡${moduleName} activado exitosamente!`);

      setTimeout(() => {
        setActivationSuccess(null);
      }, 5000);
    } else {
      setActivationError(result.error || 'Error al activar el módulo');

      setTimeout(() => {
        setActivationError(null);
      }, 5000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
          <p className="text-lg text-slate-600">Cargando módulos disponibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-900 mb-2">Error al cargar módulos</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-6 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Notifications */}
      {activationSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-in-right flex items-center gap-3">
          <CheckCircle className="w-6 h-6" />
          <span className="font-semibold">{activationSuccess}</span>
        </div>
      )}

      {activationError && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-slide-in-right flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          <span className="font-semibold">{activationError}</span>
        </div>
      )}

      {/* Hero */}
      <HeroSection />

      {/* Current Modules */}
      {activeModules.length > 0 && (
        <CurrentModulesSection
          activeModules={activeModules}
          totalModules={enrichedModules.length}
        />
      )}

      {/* Stats Bar */}
      <StatsBar />

      {/* Marketplace */}
      <ModulesMarketplace
        modules={inactiveModules}
        onActivate={handleActivateModule}
      />
    </div>
  );
}
