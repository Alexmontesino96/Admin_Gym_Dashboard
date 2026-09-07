'use client'

import { useEffect, useState } from 'react'
import {
  clientHealthAPI,
  kgToLb,
  WeeklyCheckIn,
  WeightHistory,
} from '@/lib/api'

/**
 * Peso y check-ins de un cliente, para la ficha del entrenador.
 *
 * La ficha enseñaba `profile.weight`, un número que la persona tecleó una vez al rellenar su
 * perfil y que no se actualiza nunca. Lo que el entrenador necesita es la serie real y lo que su
 * cliente le escribe cada semana, que hasta ahora no llegaba a ninguna parte pese a que la hoja
 * de registro de la app dice literalmente «nota para tu entrenador».
 *
 * Todo se pinta en libras: el servidor guarda kilos, y el mercado es Estados Unidos.
 */
export default function ClientHealthPanel({ userId }: { userId: number }) {
  const [history, setHistory] = useState<WeightHistory | null>(null)
  const [checkIns, setCheckIns] = useState<WeeklyCheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [h, c] = await Promise.all([
          clientHealthAPI.getWeightHistory(userId, 180),
          clientHealthAPI.getCheckIns(userId, 12),
        ])
        if (cancelled) return
        setHistory(h)
        setCheckIns(c)
      } catch (e) {
        if (cancelled) return
        // Un fallo de red no es lo mismo que «no hay datos», y decir lo segundo cuando pasa lo
        // primero hace que el entrenador crea que su cliente no registra nada.
        setError('Could not load this client’s check-ins.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  if (loading) {
    return <div className="text-sm text-gray-500">Loading check-ins…</div>
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>
  }

  const lb = (kg: number | null | undefined) =>
    kg == null ? '—' : `${kgToLb(kg).toFixed(1)} lb`

  const hasAnything = (history?.points.length ?? 0) > 0 || checkIns.length > 0
  if (!hasAnything) {
    return (
      <div className="text-sm text-gray-500">
        No check-ins yet. Your client logs them from the app.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {history && history.points.length > 0 && (
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Current</p>
            <p className="text-2xl font-semibold tabular-nums text-gray-900">
              {lb(history.current_weight)}
            </p>
          </div>
          {history.change != null && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Over {history.days} days
              </p>
              <p className="text-2xl font-semibold tabular-nums text-gray-900">
                {history.change > 0 ? '+' : '−'}
                {Math.abs(kgToLb(history.change)).toFixed(1)} lb
              </p>
            </div>
          )}
        </div>
      )}

      {checkIns.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-4 font-medium">Week</th>
                <th className="py-2 pr-4 font-medium">Weight</th>
                <th className="py-2 pr-4 font-medium">Energy</th>
                <th className="py-2 pr-4 font-medium">Sleep</th>
                <th className="py-2 pr-4 font-medium">Soreness</th>
                <th className="py-2 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {checkIns.map(c => (
                <tr key={c.id} className="border-b border-gray-100 align-top">
                  <td className="py-2 pr-4 whitespace-nowrap text-gray-700">
                    {new Date(`${c.week_start}T00:00:00`).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap tabular-nums text-gray-900">
                    {lb(c.weight)}
                  </td>
                  <td className="py-2 pr-4 tabular-nums text-gray-700">{c.energy ?? '—'}</td>
                  <td className="py-2 pr-4 tabular-nums text-gray-700">{c.sleep ?? '—'}</td>
                  <td className="py-2 pr-4 tabular-nums text-gray-700">{c.soreness ?? '—'}</td>
                  <td className="py-2 whitespace-pre-line text-gray-700">{c.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
