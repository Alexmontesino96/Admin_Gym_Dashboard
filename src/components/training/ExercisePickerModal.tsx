'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Dumbbell, Search } from 'lucide-react'
import { trainingAPI, type Exercise } from '@/lib/api'
import { trainingStrings as t } from '@/lib/training/strings'
import { TrainingEmpty, TrainingErrorBanner, TrainingModal, TrainingSpinner } from './TrainingStates'

const RECENT_KEY = 'training.recentExercises'
const RECENT_LIMIT = 8

/**
 * The catalog picker. Search, filter by muscle, and a "Recently used" shelf on top — the shortcut
 * that saves the most real time, because a trainer writes the same fifteen movements all week.
 *
 * There is no endpoint for "recently used" in the API contract, so it is remembered per browser.
 */
export const rememberRecentExercise = (exerciseKey: string): void => {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    const previous = Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
    const next = [exerciseKey, ...previous.filter(key => key !== exerciseKey)].slice(0, RECENT_LIMIT)
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // Blocked storage only costs the shortcut, never the edit.
  }
}

const readRecentExercises = (): string[] => {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

export default function ExercisePickerModal({
  isOpen,
  onClose,
  onSelect,
  clientName,
}: {
  isOpen: boolean
  onClose: () => void
  onSelect: (exercise: Exercise) => void
  clientName?: string
}) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [muscle, setMuscle] = useState('')
  const [recentKeys, setRecentKeys] = useState<string[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await trainingAPI.getExercises({ limit: 300 })
      setExercises(Array.isArray(data) ? data : [])
    } catch {
      setError(t.picker.loadError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    setSearch('')
    setMuscle('')
    setRecentKeys(readRecentExercises())
    load()
  }, [isOpen, load])

  const muscles = useMemo(() => {
    const set = new Set<string>()
    exercises.forEach(exercise => {
      exercise.primary_muscles?.forEach(item => set.add(item))
    })
    return [...set].sort()
  }, [exercises])

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return exercises.filter(exercise => {
      if (muscle && !exercise.primary_muscles?.includes(muscle)) return false
      if (!needle) return true
      return (
        exercise.name.toLowerCase().includes(needle) ||
        exercise.exercise_key.toLowerCase().includes(needle) ||
        (exercise.equipment ?? '').toLowerCase().includes(needle)
      )
    })
  }, [exercises, muscle, search])

  const recent = useMemo(
    () =>
      recentKeys
        .map(key => exercises.find(exercise => exercise.exercise_key === key))
        .filter((exercise): exercise is Exercise => Boolean(exercise)),
    [recentKeys, exercises],
  )

  const handleSelect = (exercise: Exercise) => {
    rememberRecentExercise(exercise.exercise_key)
    onSelect(exercise)
  }

  const renderRow = (exercise: Exercise) => (
    <li key={exercise.id}>
      <button
        type="button"
        onClick={() => handleSelect(exercise)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-slate-900">{exercise.name}</span>
          <span className="block truncate text-xs text-slate-500">
            {[exercise.equipment, exercise.primary_muscles?.join(', ')].filter(Boolean).join(' · ') ||
              exercise.exercise_key}
          </span>
        </span>
        <span className="shrink-0 text-sm font-medium text-indigo-600">{t.picker.add}</span>
      </button>
    </li>
  )

  return (
    <TrainingModal isOpen={isOpen} onClose={onClose} title={t.picker.title} size="2xl">
      <div className="space-y-4">
        {error && <TrainingErrorBanner message={error} onDismiss={() => setError(null)} onRetry={load} />}

        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={t.picker.search}
              aria-label={t.picker.search}
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={muscle}
            onChange={event => setMuscle(event.target.value)}
            aria-label={t.picker.allMuscles}
            className="rounded-xl border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{t.picker.allMuscles}</option>
            {muscles.map(item => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <TrainingSpinner />
        ) : (
          <>
            {recent.length > 0 && !search && !muscle && (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {clientName ? t.picker.recentlyUsedWith(clientName) : t.picker.recentlyUsed}
                </h3>
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {recent.map(renderRow)}
                </ul>
              </div>
            )}

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t.picker.catalog}
              </h3>
              {filtered.length === 0 ? (
                <TrainingEmpty icon={Dumbbell} title={t.picker.empty} />
              ) : (
                <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
                  {filtered.map(renderRow)}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </TrainingModal>
  )
}
