'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Copy,
  Dumbbell,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import {
  trainingAPI,
  type Exercise,
  type TrainingDay,
  type TrainingDayExercise,
  type TrainingDayUpsertData,
  type TrainingLoadMode,
  type TrainingProgram,
  type TrainingSetOverride,
  type WeightUnit,
} from '@/lib/api'
import { dayNumbersOfWeek, weekdayIndex, weekNumberOf } from '@/lib/training/dates'
import { trainingStrings as t } from '@/lib/training/strings'
import { fromUnit, toUnit } from '@/lib/training/units'
import { useTrainingWeightUnit } from '@/hooks/useTrainingWeightUnit'
import ExercisePickerModal from '@/components/training/ExercisePickerModal'
import {
  TrainingEmpty,
  TrainingErrorBanner,
  TrainingModal,
  TrainingSkeleton,
  TrainingSuccessBanner,
} from '@/components/training/TrainingStates'

/**
 * A draft exercise row. `load_value` lives here in the unit the trainer is typing in; it becomes
 * kilograms only in `buildPayload`, right before the request. The wire never sees pounds.
 */
type ExerciseDraft = Omit<TrainingDayExercise, 'id' | 'day_id'> & { rowKey: string }

const LOAD_MODES: Array<{ value: TrainingLoadMode; label: string }> = [
  { value: 'weight', label: t.dayEditor.loadWeight },
  { value: 'percent_1rm', label: t.dayEditor.loadPercent },
  { value: 'rpe', label: t.dayEditor.loadRpe },
  { value: 'bodyweight', label: t.dayEditor.loadBodyweight },
]

/** A weight load is the only mode whose value is stored in kilograms. */
const isWeightMode = (mode: TrainingLoadMode) => mode === 'weight'

let rowCounter = 0
const nextRowKey = () => {
  rowCounter += 1
  return `row-${rowCounter}`
}

const toDraft = (exercise: TrainingDayExercise, unit: WeightUnit): ExerciseDraft => ({
  ...exercise,
  load_value:
    exercise.load_value != null && isWeightMode(exercise.load_mode)
      ? toUnit(exercise.load_value, unit)
      : exercise.load_value,
  set_overrides:
    exercise.set_overrides?.map(override => ({
      ...override,
      load_value:
        override.load_value != null && isWeightMode(exercise.load_mode)
          ? toUnit(override.load_value, unit)
          : override.load_value,
    })) ?? null,
  rowKey: nextRowKey(),
})

export default function DayEditorClient({
  programId,
  dayNumber,
}: {
  programId: number
  dayNumber: number
}) {
  const router = useRouter()
  const { unit, setUnit } = useTrainingWeightUnit()
  const week = weekNumberOf(dayNumber)

  const [program, setProgram] = useState<TrainingProgram | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [focus, setFocus] = useState('')
  const [notes, setNotes] = useState('')
  const [isRest, setIsRest] = useState(false)
  const [exercises, setExercises] = useState<ExerciseDraft[]>([])
  const [dirty, setDirty] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [showPicker, setShowPicker] = useState(false)
  const [showDuplicate, setShowDuplicate] = useState(false)
  const [targetDays, setTargetDays] = useState<number[]>([])
  const [duplicating, setDuplicating] = useState(false)

  // The unit the drafts are currently expressed in, so a unit switch converts once and only once.
  const draftUnit = useRef<WeightUnit>(unit)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [programData, weekDays] = await Promise.all([
        trainingAPI.getProgram(programId),
        trainingAPI.getProgramDays(programId, week),
      ])
      setProgram(programData)
      const day: TrainingDay | undefined = Array.isArray(weekDays)
        ? weekDays.find(item => item.day_number === dayNumber)
        : undefined
      setName(day?.name ?? '')
      setFocus(day?.focus ?? '')
      setNotes(day?.notes ?? '')
      setIsRest(day?.is_rest ?? false)
      setExercises(
        (day?.exercises ?? [])
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map(exercise => toDraft(exercise, unit)),
      )
      draftUnit.current = unit
      setDirty(false)
    } catch (err) {
      const status = (err as { status?: number } | null)?.status
      setError(status === 404 ? t.program.notFound : t.common.loadError)
    } finally {
      setLoading(false)
    }
    // `unit` is read to seed the drafts; a later unit change is handled by its own effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId, week, dayNumber])

  useEffect(() => {
    load()
  }, [load])

  // Switching the typing unit converts what is on screen; nothing is sent until Save.
  useEffect(() => {
    if (draftUnit.current === unit) return
    const from = draftUnit.current
    draftUnit.current = unit
    setExercises(current =>
      current.map(exercise => {
        if (!isWeightMode(exercise.load_mode)) return exercise
        const convert = (value: number | null | undefined) =>
          value == null ? null : toUnit(fromUnit(value, from), unit)
        return {
          ...exercise,
          load_value: convert(exercise.load_value),
          set_overrides:
            exercise.set_overrides?.map(override => ({
              ...override,
              load_value: convert(override.load_value),
            })) ?? null,
        }
      }),
    )
  }, [unit])

  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [successMessage])

  // Leaving the tab with unsaved work asks the browser's own question.
  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const mutate = (updater: (current: ExerciseDraft[]) => ExerciseDraft[]) => {
    setExercises(updater)
    setDirty(true)
  }

  const updateExercise = (rowKey: string, patch: Partial<ExerciseDraft>) => {
    mutate(current =>
      current.map(exercise => (exercise.rowKey === rowKey ? { ...exercise, ...patch } : exercise)),
    )
  }

  const move = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= exercises.length) return
    mutate(current => {
      const next = [...current]
      const [moved] = next.splice(index, 1)
      next.splice(target, 0, moved)
      return next.map((exercise, position) => ({ ...exercise, order_index: position }))
    })
  }

  const removeExercise = (rowKey: string) => {
    mutate(current =>
      current
        .filter(exercise => exercise.rowKey !== rowKey)
        .map((exercise, position) => ({ ...exercise, order_index: position })),
    )
  }

  const addExercise = (exercise: Exercise) => {
    mutate(current => [
      ...current,
      {
        rowKey: nextRowKey(),
        exercise_id: exercise.id,
        exercise_key: exercise.exercise_key,
        exercise_name: exercise.name,
        order_index: current.length,
        superset_group: null,
        sets_count: 3,
        reps: '8',
        load_mode: 'weight',
        load_value: null,
        rpe_target: null,
        rest_seconds: exercise.default_rest_seconds || 90,
        notes: null,
        set_overrides: null,
      },
    ])
    setShowPicker(false)
    setIsRest(false)
  }

  const addOverride = (exercise: ExerciseDraft) => {
    const used = new Set((exercise.set_overrides ?? []).map(item => item.set_number))
    let setNumber = 1
    while (used.has(setNumber) && setNumber <= exercise.sets_count) setNumber += 1
    if (setNumber > exercise.sets_count) return
    updateExercise(exercise.rowKey, {
      set_overrides: [
        ...(exercise.set_overrides ?? []),
        { set_number: setNumber, reps: null, load_value: null, rpe_target: null, rest_seconds: null },
      ].sort((a, b) => a.set_number - b.set_number),
    })
  }

  const updateOverride = (
    exercise: ExerciseDraft,
    setNumber: number,
    patch: Partial<TrainingSetOverride>,
  ) => {
    updateExercise(exercise.rowKey, {
      set_overrides: (exercise.set_overrides ?? []).map(override =>
        override.set_number === setNumber ? { ...override, ...patch } : override,
      ),
    })
  }

  const removeOverride = (exercise: ExerciseDraft, setNumber: number) => {
    updateExercise(exercise.rowKey, {
      set_overrides: (exercise.set_overrides ?? []).filter(
        override => override.set_number !== setNumber,
      ),
    })
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!isRest) {
      exercises.forEach(exercise => {
        if (exercise.sets_count < 1 || exercise.sets_count > 20) {
          errors[`${exercise.rowKey}-sets`] = t.dayEditor.setsRange
        }
        if (!exercise.reps.trim()) {
          errors[`${exercise.rowKey}-reps`] = t.dayEditor.repsRequired
        }
      })
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const buildPayload = (): TrainingDayUpsertData => ({
    name: name.trim() || null,
    is_rest: isRest,
    focus: focus.trim() || null,
    notes: notes.trim() || null,
    exercises: isRest
      ? []
      : exercises.map((exercise, position) => ({
          exercise_id: exercise.exercise_id,
          exercise_key: exercise.exercise_key,
          exercise_name: exercise.exercise_name,
          order_index: position,
          superset_group: exercise.superset_group?.trim() || null,
          sets_count: exercise.sets_count,
          reps: exercise.reps.trim(),
          load_mode: exercise.load_mode,
          load_value:
            exercise.load_value == null
              ? null
              : isWeightMode(exercise.load_mode)
                ? fromUnit(exercise.load_value, unit)
                : exercise.load_value,
          rpe_target: exercise.rpe_target,
          rest_seconds: exercise.rest_seconds,
          notes: exercise.notes?.trim() || null,
          set_overrides:
            exercise.set_overrides && exercise.set_overrides.length > 0
              ? exercise.set_overrides.map(override => ({
                  ...override,
                  reps: override.reps?.trim() || null,
                  load_value:
                    override.load_value == null
                      ? null
                      : isWeightMode(exercise.load_mode)
                        ? fromUnit(override.load_value, unit)
                        : override.load_value,
                }))
              : null,
        })),
  })

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    setError(null)
    try {
      await trainingAPI.upsertProgramDay(programId, dayNumber, buildPayload())
      setDirty(false)
      setSuccessMessage(t.dayEditor.saved)
    } catch {
      // The screen does not close and nothing is cleared: the work is still on screen.
      setError(t.dayEditor.saveError)
    } finally {
      setSaving(false)
    }
  }

  const leave = (href: string) => {
    if (dirty && !confirm(t.dayEditor.discardConfirm)) return
    router.push(href)
  }

  const handleDuplicateDay = async () => {
    if (targetDays.length === 0) return
    setDuplicating(true)
    setError(null)
    try {
      await trainingAPI.duplicateDay(programId, dayNumber, {
        target_day_numbers: [...targetDays].sort((a, b) => a - b),
      })
      setShowDuplicate(false)
      setTargetDays([])
      setSuccessMessage(t.dayEditor.duplicated)
    } catch {
      setError(t.common.genericError)
    } finally {
      setDuplicating(false)
    }
  }

  const weekdayLabel = t.week.dayNamesLong[weekdayIndex(dayNumber)]
  const totalDays = (program?.duration_weeks ?? weekNumberOf(dayNumber)) * 7
  const duplicateTargets = useMemo(
    () => Array.from({ length: totalDays }, (_, index) => index + 1).filter(v => v !== dayNumber),
    [totalDays, dayNumber],
  )

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <TrainingSkeleton rows={4} />
      </div>
    )
  }

  if (error && !program) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <TrainingErrorBanner message={error} onRetry={load} />
        <Link
          href={`/training/programs/${programId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft size={16} />
          {t.program.overview}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => leave(`/training/programs/${programId}/weeks/${week}`)}
              aria-label={t.common.cancel}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t.week.title(week)} · {t.common.day} {dayNumber}
              </p>
              <h1 className="text-2xl font-bold text-slate-900">
                {weekdayLabel}
                {name ? ` · ${name}` : ''}
              </h1>
              <p className="text-sm text-slate-600">{program?.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {dirty && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                {t.dayEditor.unsaved}
              </span>
            )}
            <div
              className="flex items-center overflow-hidden rounded-xl border border-slate-300"
              role="group"
              aria-label={t.units.unitLabel}
            >
              {(['lb', 'kg'] as WeightUnit[]).map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setUnit(value)}
                  aria-pressed={unit === value}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    unit === value ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setTargetDays([])
                setShowDuplicate(true)
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Copy size={16} />
              {t.dayEditor.duplicateDay}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? t.common.saving : t.common.save}
            </button>
          </div>
        </div>
      </div>

      {successMessage && <TrainingSuccessBanner message={successMessage} />}
      {error && <TrainingErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Day fields */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="day-name" className="mb-2 block text-sm font-medium text-slate-700">
              {t.dayEditor.dayName}
            </label>
            <input
              id="day-name"
              type="text"
              value={name}
              onChange={event => {
                setName(event.target.value)
                setDirty(true)
              }}
              placeholder={t.dayEditor.dayNamePlaceholder}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="day-focus" className="mb-2 block text-sm font-medium text-slate-700">
              {t.dayEditor.focus}
            </label>
            <input
              id="day-focus"
              type="text"
              value={focus}
              onChange={event => {
                setFocus(event.target.value)
                setDirty(true)
              }}
              placeholder={t.dayEditor.focusPlaceholder}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="day-notes" className="mb-2 block text-sm font-medium text-slate-700">
            {t.dayEditor.notes}
          </label>
          <textarea
            id="day-notes"
            rows={2}
            value={notes}
            onChange={event => {
              setNotes(event.target.value)
              setDirty(true)
            }}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
          <input
            type="checkbox"
            checked={isRest}
            onChange={event => {
              setIsRest(event.target.checked)
              setDirty(true)
            }}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>
            <span className="block text-sm font-medium text-slate-700">{t.dayEditor.restDay}</span>
            <span className="block text-xs text-slate-500">{t.dayEditor.restDayHint}</span>
          </span>
        </label>
      </div>

      {/* Exercises */}
      {!isRest && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{t.common.exercises}</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium tabular-nums text-slate-700">
              {exercises.length}
            </span>
          </div>

          {exercises.length === 0 ? (
            <TrainingEmpty
              icon={Dumbbell}
              title={t.dayEditor.empty}
              actionLabel={t.dayEditor.emptyAction}
              onAction={() => setShowPicker(true)}
            />
          ) : (
            <ol className="space-y-4">
              {exercises.map((exercise, index) => (
                <li
                  key={exercise.rowKey}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold tabular-nums text-slate-600">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">{exercise.exercise_name}</p>
                        <p className="text-xs text-slate-500">{exercise.exercise_key}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => move(index, 'up')}
                        disabled={index === 0}
                        aria-label={`${t.dayEditor.moveUp}: ${exercise.exercise_name}`}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-600 disabled:opacity-30"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 'down')}
                        disabled={index === exercises.length - 1}
                        aria-label={`${t.dayEditor.moveDown}: ${exercise.exercise_name}`}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-600 disabled:opacity-30"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeExercise(exercise.rowKey)}
                        aria-label={`${t.dayEditor.removeExercise}: ${exercise.exercise_name}`}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div>
                      <label
                        htmlFor={`${exercise.rowKey}-sets`}
                        className="mb-1 block text-xs font-medium text-slate-600"
                      >
                        {t.dayEditor.sets}
                      </label>
                      <input
                        id={`${exercise.rowKey}-sets`}
                        type="number"
                        min={1}
                        max={20}
                        value={exercise.sets_count}
                        onChange={event =>
                          updateExercise(exercise.rowKey, {
                            sets_count: parseInt(event.target.value, 10) || 1,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 tabular-nums transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {formErrors[`${exercise.rowKey}-sets`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {formErrors[`${exercise.rowKey}-sets`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor={`${exercise.rowKey}-reps`}
                        className="mb-1 block text-xs font-medium text-slate-600"
                      >
                        {t.dayEditor.reps}
                      </label>
                      <input
                        id={`${exercise.rowKey}-reps`}
                        type="text"
                        value={exercise.reps}
                        onChange={event =>
                          updateExercise(exercise.rowKey, { reps: event.target.value })
                        }
                        placeholder={t.dayEditor.repsPlaceholder}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {formErrors[`${exercise.rowKey}-reps`] && (
                        <p className="mt-1 text-xs text-red-600">
                          {formErrors[`${exercise.rowKey}-reps`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor={`${exercise.rowKey}-mode`}
                        className="mb-1 block text-xs font-medium text-slate-600"
                      >
                        {t.dayEditor.load}
                      </label>
                      <select
                        id={`${exercise.rowKey}-mode`}
                        value={exercise.load_mode}
                        onChange={event =>
                          updateExercise(exercise.rowKey, {
                            load_mode: event.target.value as TrainingLoadMode,
                            // Percent and weight are not convertible into one another, and RPE and
                            // bodyweight carry no value at all (plan §4.4).
                            load_value:
                              event.target.value === 'weight' || event.target.value === 'percent_1rm'
                                ? exercise.load_value
                                : null,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {LOAD_MODES.map(mode => (
                          <option key={mode.value} value={mode.value}>
                            {mode.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor={`${exercise.rowKey}-load`}
                        className="mb-1 block text-xs font-medium text-slate-600"
                      >
                        {exercise.load_mode === 'weight'
                          ? `${t.dayEditor.loadWeight} (${unit})`
                          : exercise.load_mode === 'percent_1rm'
                            ? '%'
                            : t.common.none}
                      </label>
                      <input
                        id={`${exercise.rowKey}-load`}
                        type="number"
                        step={exercise.load_mode === 'weight' ? (unit === 'kg' ? 2.5 : 5) : 1}
                        disabled={
                          exercise.load_mode === 'rpe' || exercise.load_mode === 'bodyweight'
                        }
                        value={exercise.load_value ?? ''}
                        onChange={event =>
                          updateExercise(exercise.rowKey, {
                            load_value:
                              event.target.value === '' ? null : Number(event.target.value),
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 tabular-nums transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`${exercise.rowKey}-rpe`}
                        className="mb-1 block text-xs font-medium text-slate-600"
                      >
                        {t.dayEditor.rpe}
                      </label>
                      <input
                        id={`${exercise.rowKey}-rpe`}
                        type="number"
                        min={1}
                        max={10}
                        step={0.5}
                        value={exercise.rpe_target ?? ''}
                        onChange={event =>
                          updateExercise(exercise.rowKey, {
                            rpe_target:
                              event.target.value === '' ? null : Number(event.target.value),
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 tabular-nums transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`${exercise.rowKey}-rest`}
                        className="mb-1 block text-xs font-medium text-slate-600"
                      >
                        {t.dayEditor.rest} (s)
                      </label>
                      <input
                        id={`${exercise.rowKey}-rest`}
                        type="number"
                        min={0}
                        step={15}
                        value={exercise.rest_seconds}
                        onChange={event =>
                          updateExercise(exercise.rowKey, {
                            rest_seconds: parseInt(event.target.value, 10) || 0,
                          })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 tabular-nums transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`${exercise.rowKey}-superset`}
                        className="mb-1 block text-xs font-medium text-slate-600"
                      >
                        {t.dayEditor.supersetGroup}
                      </label>
                      <input
                        id={`${exercise.rowKey}-superset`}
                        type="text"
                        maxLength={8}
                        value={exercise.superset_group ?? ''}
                        onChange={event =>
                          updateExercise(exercise.rowKey, {
                            superset_group: event.target.value || null,
                          })
                        }
                        placeholder={t.dayEditor.supersetPlaceholder}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label
                        htmlFor={`${exercise.rowKey}-notes`}
                        className="mb-1 block text-xs font-medium text-slate-600"
                      >
                        {t.dayEditor.exerciseNotes}
                      </label>
                      <input
                        id={`${exercise.rowKey}-notes`}
                        type="text"
                        value={exercise.notes ?? ''}
                        onChange={event =>
                          updateExercise(exercise.rowKey, { notes: event.target.value || null })
                        }
                        placeholder={t.dayEditor.exerciseNotesPlaceholder}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Per-set overrides */}
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {t.dayEditor.setOverrides}
                        </p>
                        <p className="text-xs text-slate-500">{t.dayEditor.setOverridesHint}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addOverride(exercise)}
                        disabled={(exercise.set_overrides?.length ?? 0) >= exercise.sets_count}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-white disabled:opacity-40"
                      >
                        {t.dayEditor.addOverride}
                      </button>
                    </div>

                    {(exercise.set_overrides?.length ?? 0) > 0 && (
                      <ul className="space-y-2">
                        {(exercise.set_overrides ?? []).map(override => (
                          <li
                            key={override.set_number}
                            className="flex flex-wrap items-end gap-2 rounded-lg bg-white p-2"
                          >
                            <div className="w-16">
                              <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                {t.dayEditor.setNumber}
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={exercise.sets_count}
                                value={override.set_number}
                                onChange={event =>
                                  updateOverride(exercise, override.set_number, {
                                    set_number: parseInt(event.target.value, 10) || 1,
                                  })
                                }
                                aria-label={t.dayEditor.setNumber}
                                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div className="w-20">
                              <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                {t.dayEditor.reps}
                              </label>
                              <input
                                type="text"
                                value={override.reps ?? ''}
                                onChange={event =>
                                  updateOverride(exercise, override.set_number, {
                                    reps: event.target.value || null,
                                  })
                                }
                                aria-label={t.dayEditor.reps}
                                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div className="w-24">
                              <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                {exercise.load_mode === 'weight' ? unit : '%'}
                              </label>
                              <input
                                type="number"
                                disabled={
                                  exercise.load_mode === 'rpe' || exercise.load_mode === 'bodyweight'
                                }
                                value={override.load_value ?? ''}
                                onChange={event =>
                                  updateOverride(exercise, override.set_number, {
                                    load_value:
                                      event.target.value === '' ? null : Number(event.target.value),
                                  })
                                }
                                aria-label={t.dayEditor.load}
                                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                              />
                            </div>
                            <div className="w-20">
                              <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                {t.dayEditor.rpe}
                              </label>
                              <input
                                type="number"
                                min={1}
                                max={10}
                                step={0.5}
                                value={override.rpe_target ?? ''}
                                onChange={event =>
                                  updateOverride(exercise, override.set_number, {
                                    rpe_target:
                                      event.target.value === '' ? null : Number(event.target.value),
                                  })
                                }
                                aria-label={t.dayEditor.rpe}
                                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div className="w-24">
                              <label className="mb-1 block text-[11px] font-medium text-slate-500">
                                {t.dayEditor.rest} (s)
                              </label>
                              <input
                                type="number"
                                min={0}
                                step={15}
                                value={override.rest_seconds ?? ''}
                                onChange={event =>
                                  updateOverride(exercise, override.set_number, {
                                    rest_seconds:
                                      event.target.value === ''
                                        ? null
                                        : parseInt(event.target.value, 10),
                                  })
                                }
                                aria-label={t.dayEditor.rest}
                                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeOverride(exercise, override.set_number)}
                              aria-label={t.dayEditor.removeOverride}
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <X size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}

          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 font-medium text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
          >
            <Plus size={18} />
            {t.dayEditor.addExercise}
          </button>
        </div>
      )}

      <ExercisePickerModal
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={addExercise}
      />

      <TrainingModal
        isOpen={showDuplicate}
        onClose={() => setShowDuplicate(false)}
        title={t.dayEditor.duplicateTitle}
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowDuplicate(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleDuplicateDay}
              disabled={duplicating || targetDays.length === 0}
              className="rounded-xl bg-indigo-600 px-6 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {duplicating ? t.common.saving : t.dayEditor.duplicateAction}
            </button>
          </>
        }
      >
        <div>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            {t.dayEditor.targetDays}
          </span>
          <div className="max-h-72 space-y-3 overflow-y-auto">
            {Array.from({ length: Math.ceil(totalDays / 7) }, (_, index) => index + 1).map(
              weekNumber => (
                <div key={weekNumber}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t.week.title(weekNumber)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dayNumbersOfWeek(weekNumber)
                      .filter(value => duplicateTargets.includes(value))
                      .map(value => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setTargetDays(current =>
                              current.includes(value)
                                ? current.filter(item => item !== value)
                                : [...current, value],
                            )
                          }
                          aria-pressed={targetDays.includes(value)}
                          className={`min-w-[44px] rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                            targetDays.includes(value)
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {t.week.dayNames[weekdayIndex(value)]}
                        </button>
                      ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </TrainingModal>
    </div>
  )
}
