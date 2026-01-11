'use client';

import { useEffect } from 'react';
import { clearSelectedGymId, clearTokenCache } from '@/lib/api';
import { Loader2 } from 'lucide-react';

/**
 * Página de logout que limpia todo el contexto del usuario antes de redirigir
 * al endpoint de Auth0 logout.
 *
 * Esta página es necesaria porque necesitamos limpiar localStorage/sessionStorage
 * en el lado del cliente antes de hacer logout en Auth0.
 */
export default function LogoutPage() {
  useEffect(() => {
    const performLogout = async () => {
      try {
        console.log('Limpiando contexto de usuario...');

        // Limpiar el gimnasio seleccionado (localStorage + cookie)
        clearSelectedGymId();

        // Limpiar cache de tokens (sessionStorage)
        clearTokenCache();

        // Limpiar workspace context si existe
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('workspace_context');
          // Limpiar cualquier otro dato de sesión
          sessionStorage.clear();
          console.log('Contexto de workspace y sesión limpiado');
        }

        console.log('Contexto limpiado exitosamente. Redirigiendo a logout...');

        // Pequeño delay para asegurar que se limpiaron los datos
        await new Promise(resolve => setTimeout(resolve, 100));

        // Redirigir al endpoint de Auth0 logout (usa el SDK para eliminar la sesión del servidor)
        window.location.href = '/auth/logout';
      } catch (error) {
        console.error('Error durante logout:', error);
        // Intentar logout de todas formas
        window.location.href = '/auth/logout';
      }
    };

    performLogout();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Cerrando sesión...
        </h2>
        <p className="text-gray-600">
          Limpiando tu información de forma segura
        </p>
      </div>
    </div>
  );
}
