'use client'

import { useCallback, useEffect, useState } from 'react'
import type { WeightUnit } from '@/lib/api'

const STORAGE_KEY = 'training.weightUnit'

/**
 * The unit the trainer types in while authoring a program.
 *
 * The backend stores kilograms and there is no per-staff unit preference in the API yet, so this
 * is a local choice remembered in the browser. Pounds by default: the market is the United States
 * and the rest of the panel already prints pounds.
 */
export function useTrainingWeightUnit(): {
  unit: WeightUnit
  setUnit: (unit: WeightUnit) => void
} {
  const [unit, setUnitState] = useState<WeightUnit>('lb')

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === 'kg' || stored === 'lb') setUnitState(stored)
    } catch {
      // Blocked storage is not a reason to break the editor.
    }
  }, [])

  const setUnit = useCallback((next: WeightUnit) => {
    setUnitState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Same here: the choice just does not survive the reload.
    }
  }, [])

  return { unit, setUnit }
}
