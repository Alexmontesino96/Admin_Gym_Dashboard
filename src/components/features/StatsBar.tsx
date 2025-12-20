'use client';

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Star } from 'lucide-react';

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const increment = end / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration]);

  return count;
}

export default function StatsBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const gymsCount = useCountUp(isVisible ? 12500 : 0, 2000);
  const activationsCount = useCountUp(isVisible ? 235 : 0, 1500);
  const ratingValue = useCountUp(isVisible ? 49 : 0, 1800);

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-center text-center">
        {/* Stat 1: Gimnasios */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="text-4xl font-bold text-slate-900 stat-count-up">
              +{gymsCount.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600 mt-1">gimnasios confían</div>
          </div>
        </div>

        {/* Stat 2: Activaciones */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="text-4xl font-bold text-slate-900 stat-count-up">
              {activationsCount}
            </div>
            <div className="text-sm text-slate-600 mt-1">
              activaciones esta semana <span className="text-orange-500">⚡</span>
            </div>
          </div>
        </div>

        {/* Stat 3: Rating */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Star className="w-8 h-8 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center">
              <div className="text-4xl font-bold text-slate-900 stat-count-up">
                {(ratingValue / 10).toFixed(1)}
              </div>
              <div className="flex text-yellow-500">
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
              </div>
            </div>
            <div className="text-sm text-slate-600 mt-1">calificación promedio</div>
          </div>
        </div>
      </div>
    </div>
  );
}
