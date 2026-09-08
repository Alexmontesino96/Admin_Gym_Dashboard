'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Dumbbell, Lock, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import {
  trainingAPI,
  type Exercise,
  type ExerciseCategory,
  type ExerciseCreateData,
} from '@/lib/api'
import { trainingStrings as t } from '@/lib/training/strings'
import {
  isModuleDisabled,
  TrainingEmpty,
  TrainingErrorBanner,
  TrainingModal,
  TrainingModuleInactive,
  TrainingSkeleton,
  TrainingSuccessBanner,
} from '@/components/training/TrainingStates'

const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  strength: t.exercises.categoryStrength,
  cardio: t.exercises.categoryCardio,
  mobility: t.exercises.categoryMobility,
  other: t.exercises.categoryOther,
}

const emptyForm: ExerciseCreateData = {
  name: '',
  category: 'strength',
  primary_muscles: [],
  equipment: '',
  is_unilateral: false,
  default_rest_seconds: 90,
  instructions: '',
}

export default function ExerciseLibraryClient() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // A failed load must not be dressed up as an empty catalog.
  const [loadError, setLoadError] = useState<string | null>(null)
  const [moduleInactive, setModuleInactive] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [tab, setTab] = useState<'global' | 'custom'>('global')
  const [search, setSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [form, setForm] = useState<ExerciseCreateData>(emptyForm)
  const [musclesText, setMusclesText] = useState('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setLoadError(null)
    setModuleInactive(false)
    try {
      const data = await trainingAPI.getExercises({ limit: 500 })
      setExercises(Array.isArray(data) ? data : [])
    } catch (err) {
      if (isModuleDisabled(err)) {
        setModuleInactive(true)
      } else {
        setLoadError(t.picker.loadError)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [successMessage])

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return exercises.filter(exercise => {
      const isGlobal = exercise.gym_id == null
      if (tab === 'global' && !isGlobal) return false
      if (tab === 'custom' && isGlobal) return false
      if (!needle) return true
      return (
        exercise.name.toLowerCase().includes(needle) ||
        exercise.exercise_key.toLowerCase().includes(needle) ||
        (exercise.equipment ?? '').toLowerCase().includes(needle) ||
        (exercise.primary_muscles ?? []).some(muscle => muscle.toLowerCase().includes(needle))
      )
    })
  }, [exercises, search, tab])

  const counts = useMemo(
    () => ({
      global: exercises.filter(exercise => exercise.gym_id == null).length,
      custom: exercises.filter(exercise => exercise.gym_id != null).length,
    }),
    [exercises],
  )

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setMusclesText('')
    setFormErrors({})
    setShowForm(true)
  }

  const openEdit = (exercise: Exercise) => {
    setEditing(exercise)
    setForm({
      name: exercise.name,
      category: exercise.category,
      primary_muscles: exercise.primary_muscles ?? [],
      equipment: exercise.equipment ?? '',
      is_unilateral: exercise.is_unilateral,
      default_rest_seconds: exercise.default_rest_seconds,
      instructions: exercise.instructions ?? '',
    })
    setMusclesText((exercise.primary_muscles ?? []).join(', '))
    setFormErrors({})
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormErrors({ name: t.exercises.nameRequired })
      return
    }
    setActionLoading(true)
    setError(null)
    try {
      const payload: ExerciseCreateData = {
        ...form,
        name: form.name.trim(),
        equipment: form.equipment?.trim() || null,
        instructions: form.instructions?.trim() || null,
        primary_muscles: musclesText
          .split(',')
          .map(item => item.trim().toLowerCase())
          .filter(Boolean),
      }
      if (editing) {
        await trainingAPI.updateExercise(editing.id, payload)
        setSuccessMessage(t.exercises.updated)
      } else {
        await trainingAPI.createExercise(payload)
        setSuccessMessage(t.exercises.created)
      }
      setShowForm(false)
      setEditing(null)
      setTab('custom')
      await load()
    } catch {
      setError(t.exercises.saveError)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (exercise: Exercise) => {
    if (!confirm(t.exercises.confirmDelete)) return
    setActionLoading(true)
    setError(null)
    try {
      await trainingAPI.deleteExercise(exercise.id)
      setSuccessMessage(t.exercises.deleted)
      await load()
    } catch {
      setError(t.common.genericError)
    } finally {
      setActionLoading(false)
    }
  }

  if (moduleInactive) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <TrainingModuleInactive />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/training"
              aria-label={t.programs.title}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t.exercises.title}</h1>
              <p className="text-slate-600">{t.exercises.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t.exercises.newExercise}
          </button>
        </div>
      </div>

      {successMessage && <TrainingSuccessBanner message={successMessage} />}
      {error && <TrainingErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Tabs + search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab('global')}
              aria-pressed={tab === 'global'}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                tab === 'global'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.exercises.globalTab}
              <span className="ml-2 tabular-nums opacity-70">{counts.global}</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('custom')}
              aria-pressed={tab === 'custom'}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                tab === 'custom'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.exercises.customTab}
              <span className="ml-2 tabular-nums opacity-70">{counts.custom}</span>
            </button>
          </div>
          <div className="relative min-w-[240px] flex-1">
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
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <TrainingSkeleton rows={5} />
        ) : loadError ? (
          <TrainingErrorBanner message={loadError} onRetry={load} />
        ) : visible.length === 0 ? (
          <TrainingEmpty
            icon={Dumbbell}
            title={tab === 'global' ? t.exercises.globalEmpty : t.exercises.customEmpty}
            actionLabel={tab === 'custom' ? t.exercises.customEmptyAction : undefined}
            onAction={tab === 'custom' ? openCreate : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4 font-medium">{t.exercises.name}</th>
                  <th className="py-2 pr-4 font-medium">{t.exercises.category}</th>
                  <th className="py-2 pr-4 font-medium">{t.exercises.primaryMuscles}</th>
                  <th className="py-2 pr-4 font-medium">{t.exercises.equipment}</th>
                  <th className="py-2 pr-4 font-medium">{t.exercises.defaultRest}</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {visible.map(exercise => (
                  <tr key={exercise.id} className="border-b border-slate-100 align-top">
                    <td className="py-3 pr-4">
                      <span className="block font-medium text-slate-900">{exercise.name}</span>
                      <span className="block text-xs text-slate-500">{exercise.exercise_key}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      {CATEGORY_LABELS[exercise.category] ?? exercise.category}
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      {(exercise.primary_muscles ?? []).join(', ') || t.common.none}
                    </td>
                    <td className="py-3 pr-4 text-slate-700">
                      {exercise.equipment || t.common.none}
                    </td>
                    <td className="py-3 pr-4 tabular-nums text-slate-700">
                      {exercise.default_rest_seconds}s
                    </td>
                    <td className="py-3">
                      {exercise.gym_id == null ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          <Lock size={12} />
                          {t.exercises.readOnly}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(exercise)}
                            aria-label={`${t.common.edit} ${exercise.name}`}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(exercise)}
                            disabled={actionLoading}
                            aria-label={`${t.common.delete} ${exercise.name}`}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / edit */}
      <TrainingModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setEditing(null)
        }}
        title={editing ? t.exercises.editExercise : t.exercises.newExercise}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditing(null)
              }}
              className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={actionLoading}
              className="rounded-xl bg-indigo-600 px-6 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {actionLoading ? t.common.saving : t.common.save}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="exercise-name" className="mb-2 block text-sm font-medium text-slate-700">
              {t.exercises.name}
            </label>
            <input
              id="exercise-name"
              type="text"
              value={form.name}
              onChange={event => setForm({ ...form, name: event.target.value })}
              placeholder={t.exercises.namePlaceholder}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="exercise-category"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                {t.exercises.category}
              </label>
              <select
                id="exercise-category"
                value={form.category}
                onChange={event =>
                  setForm({ ...form, category: event.target.value as ExerciseCategory })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {(Object.keys(CATEGORY_LABELS) as ExerciseCategory[]).map(value => (
                  <option key={value} value={value}>
                    {CATEGORY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="exercise-rest"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                {t.exercises.defaultRest} (s)
              </label>
              <input
                id="exercise-rest"
                type="number"
                min={0}
                step={15}
                value={form.default_rest_seconds ?? 90}
                onChange={event =>
                  setForm({
                    ...form,
                    default_rest_seconds: parseInt(event.target.value, 10) || 0,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 tabular-nums transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="exercise-muscles"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              {t.exercises.primaryMuscles}
            </label>
            <input
              id="exercise-muscles"
              type="text"
              value={musclesText}
              onChange={event => setMusclesText(event.target.value)}
              placeholder={t.exercises.primaryMusclesPlaceholder}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="exercise-equipment"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              {t.exercises.equipment}
            </label>
            <input
              id="exercise-equipment"
              type="text"
              value={form.equipment ?? ''}
              onChange={event => setForm({ ...form, equipment: event.target.value })}
              placeholder={t.exercises.equipmentPlaceholder}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="exercise-instructions"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              {t.exercises.instructions}
            </label>
            <textarea
              id="exercise-instructions"
              rows={3}
              value={form.instructions ?? ''}
              onChange={event => setForm({ ...form, instructions: event.target.value })}
              placeholder={t.exercises.instructionsPlaceholder}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_unilateral ?? false}
              onChange={event => setForm({ ...form, is_unilateral: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700">{t.exercises.isUnilateral}</span>
          </label>
        </div>
      </TrainingModal>
    </div>
  )
}
