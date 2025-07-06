import MainLayout from '@/components/MainLayout';
import { Apple, FileText, PlusCircle, Target, Users, Calendar } from 'lucide-react';

export default function NutritionPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-8 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Apple size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Nutrición</h1>
              <p className="text-green-100">Gestiona planes nutricionales para tus miembros</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <FileText size={20} />
                <span className="font-medium">Planes Activos</span>
              </div>
              <p className="text-2xl font-bold mt-2">12</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Users size={20} />
                <span className="font-medium">Usuarios Siguiendo</span>
              </div>
              <p className="text-2xl font-bold mt-2">245</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Target size={20} />
                <span className="font-medium">Objetivos Alcanzados</span>
              </div>
              <p className="text-2xl font-bold mt-2">87%</p>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ver Planes */}
          <a
            href="/nutricion/planes"
            className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-green-300 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 group-hover:bg-green-200 rounded-lg transition-colors">
                <FileText size={24} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-green-600 transition-colors">
                  Ver Planes Nutricionales
                </h3>
                <p className="text-slate-600">
                  Explora y gestiona todos los planes nutricionales disponibles
                </p>
              </div>
            </div>
          </a>

          {/* Crear Plan */}
          <a
            href="/nutricion/crear"
            className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
                <PlusCircle size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Crear Nuevo Plan
                </h3>
                <p className="text-slate-600">
                  Diseña un plan nutricional personalizado para tus miembros
                </p>
              </div>
            </div>
          </a>
        </div>

        {/* Planes recientes */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Planes Recientes</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Apple size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Plan de Volumen - Ejemplo {i}</h3>
                    <p className="text-sm text-slate-600">Creado hace {i} días</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Activo
                  </span>
                  <button className="text-slate-400 hover:text-slate-600">
                    <Calendar size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 