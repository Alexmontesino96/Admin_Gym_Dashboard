'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, Moon, Pencil, Plus } from 'lucide-react'
import { trainingAPI, type TrainingDay, type TrainingProgram } from '@/lib/api'
import { dayNumbersOfWeek, weekdayIndex } from '@/lib/training/dates'
import { trainingStrings as t } from '@/lib/training/strings'
import {
  isModuleDisabled,
  TrainingErrorBanner,
  TrainingModal,
  TrainingModuleInactive,
  TrainingSkeleton,
  TrainingSuccessBanner,
} from '@/components/training/TrainingStates'

export default function WeekEditorClient({
  programId,
  week,
}: {
  programId: number
  week: number
}) {
  const router = useRouter()
  const [program, setProgram] = useState<TrainingProgram | null>(null)
  const [days, setDays] = useState<TrainingDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [moduleInactive, setModuleInactive] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [showDuplicate, setShowDuplicate] = useState(false)
  const [targetWeeks, setTargetWeeks] = useState<number[]>([])
  const [keepLoads, setKeepLoads] = useState(true)
  const [duplicating, setDuplicating] = useState(false)
  const [duplicateError, setDuplicateError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setModuleInactive(false)
    try {
      const [programData, weekDays] = await Promise.all([
        trainingAPI.getProgram(programId),
        trainingAPI.getProgramDays(programId, week),
      ])
      setProgram(programData)
      setDays(Array.isArray(weekDays) ? weekDays : [])
    } catch (err) {
      if (isModuleDisabled(err)) {
        setModuleInactive(true)
      } else {
        const status = (err as { status?: number } | null)?.status
        setError(status === 404 ? t.program.notFound : t.week.loadError)
      }
    } finally {
      setLoading(false)
    }
  }, [programId, week])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [successMessage])

  const daysByNumber = useMemo(() => {
    const map = new Map<number, TrainingDay>()
    days.forEach(day => map.set(day.day_number, day))
    return map
  }, [days])

  const block = useMemo(
    () => program?.blocks?.find(item => week >= item.week_start && week <= item.week_end) ?? null,
    [program, week],
  )

  const totalWeeks = program?.duration_weeks ?? week
  const availableTargets = Array.from({ length: totalWeeks }, (_, index) => index + 1).filter(
    value => value !== week,
  )

  const toggleTarget = (value: number) => {
    setTargetWeeks(current =>
      current.includes(value) ? current.filter(item => item !== value) : [...current, value],
    )
  }

  const handleDuplicate = async () => {
    if (targetWeeks.length === 0) {
      setDuplicateError(t.week.noTargets)
      return
    }
    setDuplicating(true)
    setDuplicateError(null)
    try {
      await trainingAPI.duplicateWeek(programId, week, {
        target_weeks: [...targetWeeks].sort((a, b) => a - b),
        keep_loads: keepLoads,
      })
      setShowDuplicate(false)
      setTargetWeeks([])
      setSuccessMessage(t.week.duplicated)
    } catch {
      setDuplicateError(t.week.duplicateError)
    } finally {
      setDuplicating(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <TrainingSkeleton rows={4} />
      </div>
    )
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

  if (error && !program) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6">
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
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/training/programs/${programId}`}
              aria-label={t.program.overview}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t.week.title(week)}</h1>
              <p className="text-sm text-slate-600">
                {program?.name}
                {block ? ` · ${block.name}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={week <= 1}
              onClick={() => router.push(`/training/programs/${programId}/weeks/${week - 1}`)}
              aria-label={t.week.previousWeek}
              className="rounded-xl border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-[80px] text-center text-sm font-medium tabular-nums text-slate-700">
              {week} / {totalWeeks}
            </span>
            <button
              type="button"
              disabled={week >= totalWeeks}
              onClick={() => router.push(`/training/programs/${programId}/weeks/${week + 1}`)}
              aria-label={t.week.nextWeek}
              className="rounded-xl border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => {
                setTargetWeeks([])
                setKeepLoads(true)
                setDuplicateError(null)
                setShowDuplicate(true)
              }}
              className="ml-2 flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Copy size={16} />
              {t.week.duplicateWeek}
            </button>
          </div>
        </div>
      </div>

      {successMessage && <TrainingSuccessBanner message={successMessage} />}
      {error && <TrainingErrorBanner message={error} onDismiss={() => setError(null)} onRetry={load} />}

      {/* Seven columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {dayNumbersOfWeek(week).map(dayNumber => {
          const day = daysByNumber.get(dayNumber)
          const exercises = day?.exercises ?? []
          const isRest = day?.is_rest ?? false
          return (
            <div
              key={dayNumber}
              className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t.week.dayNames[weekdayIndex(dayNumber)]}
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {isRest ? t.program.restDay : day?.name || t.program.emptyDay}
                  </p>
                </div>
                <Link
                  href={`/training/programs/${programId}/days/${dayNumber}`}
                  aria-label={`${t.week.editDay}: ${t.week.dayNamesLong[weekdayIndex(dayNumber)]}`}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                >
                  <Pencil size={16} />
                </Link>
              </div>

              <div className="flex-1">
                {isRest ? (
                  <div className="flex h-full flex-col items-center justify-center text-slate-400">
                    <Moon size={20} />
                    <span className="mt-2 text-xs">{t.program.restDay}</span>
                  </div>
                ) : exercises.length === 0 ? (
                  <Link
                    href={`/training/programs/${programId}/days/${dayNumber}`}
                    className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-400 transition-colors hover:border-indigo-300 hover:text-indigo-600"
                  >
                    <Plus size={20} />
                    <span className="mt-2 text-xs">{t.dayEditor.addExercise}</span>
                  </Link>
                ) : (
                  <ol className="space-y-1.5">
                    {exercises
                      .slice()
                      .sort((a, b) => a.order_index - b.order_index)
                      .map((exercise, index) => (
                        <li
                          key={exercise.id ?? `${exercise.exercise_key}-${index}`}
                          className="rounded-lg bg-slate-50 px-2 py-1.5"
                        >
                          <p className="truncate text-xs font-medium text-slate-800">
                            {exercise.exercise_name}
                          </p>
                          <p className="text-xs tabular-nums text-slate-500">
                            {exercise.sets_count} × {exercise.reps}
                            {exercise.superset_group ? ` · ${exercise.superset_group}` : ''}
                          </p>
                        </li>
                      ))}
                  </ol>
                )}
              </div>

              {!isRest && exercises.length > 0 && (
                <p className="mt-3 text-xs tabular-nums text-slate-500">
                  {t.program.exerciseCount(exercises.length)}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Duplicate week */}
      <TrainingModal
        isOpen={showDuplicate}
        onClose={() => setShowDuplicate(false)}
        title={t.week.duplicateTitle(week)}
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
              onClick={handleDuplicate}
              disabled={duplicating}
              className="rounded-xl bg-indigo-600 px-6 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {duplicating ? t.common.saving : t.week.duplicateAction}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {duplicateError && (
            <TrainingErrorBanner
              message={duplicateError}
              onDismiss={() => setDuplicateError(null)}
            />
          )}

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">
              {t.week.targetWeeks}
            </span>
            <div className="flex flex-wrap gap-2">
              {availableTargets.map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleTarget(value)}
                  aria-pressed={targetWeeks.includes(value)}
                  className={`min-w-[44px] rounded-xl border px-3 py-2 text-sm font-medium tabular-nums transition-colors ${
                    targetWeeks.includes(value)
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
            <input
              type="checkbox"
              checked={keepLoads}
              onChange={event => setKeepLoads(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>
              <span className="block text-sm font-medium text-slate-700">{t.week.keepLoads}</span>
              <span className="block text-xs text-slate-500">{t.week.keepLoadsHint}</span>
            </span>
          </label>
        </div>
      </TrainingModal>
    </div>
  )
}
