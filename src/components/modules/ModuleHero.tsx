'use client';

import { Sparkles, Zap, TrendingUp } from 'lucide-react';

export default function ModuleHero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 mb-8 shadow-xl">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
            Actualizado 2024
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Potencia tu Gimnasio con Módulos Premium
        </h1>

        <p className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl">
          Desbloquea funcionalidades avanzadas para llevar tu negocio al siguiente nivel.
          Desde IA para nutrición hasta gestión completa de equipos.
        </p>

        <div className="flex flex-wrap gap-6 text-white/90">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-300" />
            <span className="font-medium">Activación instantánea</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-300" />
            <span className="font-medium">Usado por 500+ gimnasios</span>
          </div>
        </div>
      </div>
    </div>
  );
}
