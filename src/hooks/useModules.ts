'use client';

import { useState, useEffect } from 'react';
import { modulesAPI } from '@/lib/api';
import { MODULES_METADATA, type ModuleMetadata } from '@/lib/features-data';

export interface Module {
  code: string;
  name: string;
  active: boolean;
  is_premium: boolean;
}

export interface EnrichedModule extends Module, ModuleMetadata {
  isActive: boolean;
}

export function useModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [enrichedModules, setEnrichedModules] = useState<EnrichedModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadModules = async () => {
    try {
      setLoading(true);
      setError(null);

      const { modules: apiModules } = await modulesAPI.getModules();

      // Enrich modules with metadata
      const enriched: EnrichedModule[] = apiModules
        .map(module => {
          const metadata = MODULES_METADATA[module.code];

          if (!metadata) {
            console.warn(`No metadata found for module: ${module.code}`);
            return null;
          }

          return {
            ...module,
            ...metadata,
            isActive: module.active
          };
        })
        .filter((module): module is EnrichedModule => module !== null);

      setModules(apiModules);
      setEnrichedModules(enriched);
    } catch (err) {
      console.error('Error loading modules:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar módulos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const activateModule = async (code: string) => {
    try {
      await modulesAPI.activateModule(code);
      await loadModules(); // Refresh modules
      return { success: true };
    } catch (err) {
      console.error(`Error activating module ${code}:`, err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al activar módulo'
      };
    }
  };

  const deactivateModule = async (code: string) => {
    try {
      await modulesAPI.deactivateModule(code);
      await loadModules(); // Refresh modules
      return { success: true };
    } catch (err) {
      console.error(`Error deactivating module ${code}:`, err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al desactivar módulo'
      };
    }
  };

  const activeModules = enrichedModules.filter(m => m.isActive);
  const inactiveModules = enrichedModules.filter(m => !m.isActive);
  const premiumModules = enrichedModules.filter(m => m.is_premium);
  const baseModules = enrichedModules.filter(m => !m.is_premium);

  return {
    modules,
    enrichedModules,
    activeModules,
    inactiveModules,
    premiumModules,
    baseModules,
    loading,
    error,
    activateModule,
    deactivateModule,
    refetch: loadModules
  };
}
