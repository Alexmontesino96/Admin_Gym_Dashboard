import React from 'react';
import { Sparkles, ArrowDown } from 'lucide-react';

export default function HeroSection() {
  const scrollToMarketplace = () => {
    const marketplace = document.getElementById('marketplace');
    if (marketplace) {
      marketplace.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl shadow-2xl">
      {/* Patrón de fondo animado */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Contenido */}
      <div className="relative px-8 py-16 md:px-16 md:py-24 text-center">
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>Nuevas funcionalidades disponibles</span>
        </div>

        {/* Título principal */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
          Potencia tu gimnasio con las
          <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
            herramientas que necesitas
          </span>
        </h1>

        {/* Subtítulo */}
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto animate-slide-in-bottom">
          Desbloquea funcionalidades premium usadas por más de{' '}
          <span className="font-bold text-yellow-200">12,500 gimnasios</span>{' '}
          en todo el mundo
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={scrollToMarketplace}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:bg-yellow-200 hover:text-indigo-700 transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <span>Explorar módulos disponibles</span>
            <ArrowDown className="w-5 h-5 group-hover:animate-bounce" />
          </button>

          <button
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
          >
            Ver planes y precios
          </button>
        </div>

        {/* Stats rápidas */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-white mb-1">12,500+</div>
            <div className="text-white/80 text-sm">Gimnasios confían en nosotros</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-white mb-1">4.9/5</div>
            <div className="text-white/80 text-sm">Calificación promedio</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-white mb-1">235</div>
            <div className="text-white/80 text-sm">Activaciones esta semana</div>
          </div>
        </div>
      </div>
    </div>
  );
}
