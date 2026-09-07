'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Award, CalendarDays, CheckCircle, Dumbbell, PartyPopper, Send, TrendingUp } from 'lucide-react'
import {
  trainingAPI,
  type ClientProgramSummary,
  type Exercise,
  type ExerciseHistory,
  type WeightUnit,
  type WorkoutLog,
} from '@/lib/api'
import { formatShortDate } from '@/lib/training/dates'
import { trainingStrings as t } from '@/lib/training/strings'
import { formatDuration, formatVolume, formatWeight, toUnit } from '@/lib/training/units'
import AssignProgramModal from './AssignProgramModal'
import {
  isModuleDisabled,
  TrainingEmpty,
  TrainingErrorBanner,
  TrainingInlineSpinner,
  TrainingModuleInactive,
  TrainingSuccessBanner,
} from './TrainingStates'

/**
 * The training half of a client's file: what they are following, how much of it they actually do,
 * what they logged lately, and where their strength is going.
 *
 * Loads read in the client's own unit — the number the trainer says out loud has to be the number
 * the client sees on their phone. Storage stays in kilograms.
 */
export default function TrainingPanel({
  userId,
  clientName,
  weightUnit = 'lb',
}: {
  userId: number
  clientName?: string
  /** The client's `preferred_weight_unit`. Pounds until the backend serves the column. */
  weightUnit?: WeightUnit
}) {
  const [active, setActive] = useState<ClientProgramSummary | null>(null)
  const [logs, setLogs] = useState<WorkoutLog[]>([])
  const [catalog, setCatalog] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [moduleInactive, setModuleInactive] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showAssign, setShowAssign] = useState(false)

  const [selectedKey, setSelectedKey] = useState<string>('')
  const [history, setHistory] = useState<ExerciseHistory | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const [openReview, setOpenReview] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setModuleInactive(false)
    try {
      const [programs, logList, exercises] = await Promise.all([
        trainingAPI.getClientPrograms(userId),
        trainingAPI.getClientLogs(userId, { limit: 8 }),
        trainingAPI.getExercises({ limit: 500 }),
      ])
      setActive(programs?.active ?? null)
      setLogs(Array.isArray(logList) ? logList : [])
      setCatalog(Array.isArray(exercises) ? exercises : [])
    } catch (err) {
      if (isModuleDisabled(err)) {
        setModuleInactive(true)
      } else {
        // Saying "no program" when the request failed makes the trainer think their client dropped out.
        setError(t.panel.loadError)
      }
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [successMessage])

  const exerciseOptions = useMemo(() => {
    const focusKeys = active?.program.focus_exercise_keys ?? []
    const byKey = new Map(catalog.map(exercise => [exercise.exercise_key, exercise.name]))
    const focus = focusKeys.map(key => ({ key, name: byKey.get(key) ?? key }))
    const rest = catalog
      .filter(exercise => !focusKeys.includes(exercise.exercise_key))
      .map(exercise => ({ key: exercise.exercise_key, name: exercise.name }))
    return [...focus, ...rest]
  }, [active, catalog])

  useEffect(() => {
    if (selectedKey || exerciseOptions.length === 0) return
    setSelectedKey(exerciseOptions[0].key)
  }, [exerciseOptions, selectedKey])

  useEffect(() => {
    if (!selectedKey) return
    let cancelled = false
    const loadHistory = async () => {
      setHistoryLoading(true)
      setHistoryError(null)
      try {
        const data = await trainingAPI.getClientExerciseHistory(userId, selectedKey, '6m')
        if (cancelled) return
        setHistory(data)
      } catch {
        if (cancelled) return
        setHistoryError(t.panel.loadError)
        setHistory(null)
      } finally {
        if (!cancelled) setHistoryLoading(false)
      }
    }
    loadHistory()
    return () => {
      cancelled = true
    }
  }, [userId, selectedKey])

  const chartData = useMemo(
    () =>
      (history?.points ?? [])
        .filter(point => point.e1rm_kg != null)
        .map(point => ({
          date: formatShortDate(point.date),
          e1rm: toUnit(point.e1rm_kg as number, weightUnit),
        })),
    [history, weightUnit],
  )

  const handleReview = async (log: WorkoutLog, congratulate: boolean) => {
    setReviewing(true)
    setReviewError(null)
    try {
      const updated = await trainingAPI.reviewLog(log.id, {
        comment: comment.trim() || undefined,
        congratulate,
      })
      setLogs(current =>
        current.map(item => (item.id === log.id ? { ...item, ...updated } : item)),
      )
      setOpenReview(null)
      setComment('')
      setSuccessMessage(clientName ? t.panel.sentTo(clientName) : t.panel.reviewed)
    } catch {
      setReviewError(t.panel.reviewError)
    } finally {
      setReviewing(false)
    }
  }

  if (loading) {
    return <TrainingInlineSpinner />
  }

  if (moduleInactive) {
    return <TrainingModuleInactive />
  }

  // With the load failed there is nothing honest to draw: an empty "no program yet" would read as
  // a fact about the client instead of a fact about the network.
  if (error) {
    return <TrainingErrorBanner message={error} onRetry={load} />
  }

  return (
    <div className="space-y-6">
      {successMessage && <TrainingSuccessBanner message={successMessage} />}

      {/* Active program */}
      {active ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t.panel.activeProgram}
              </p>
              <Link
                href={`/training/programs/${active.program.id}`}
                className="text-lg font-semibold text-slate-900 hover:text-indigo-600"
              >
                {active.program.name}
              </Link>
              <p className="text-sm tabular-nums text-slate-600">
                {t.programs.weeksCount(active.program.duration_weeks)}
                {active.current_week
                  ? ` · ${t.panel.weekOf(active.current_week, active.program.duration_weeks)}`
                  : ''}
                {active.current_block ? ` · ${active.current_block.name}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAssign(true)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t.panel.assignProgram}
            </button>
          </div>

          {active.adherence_pct != null && (
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-600">{t.panel.adherence}</span>
                <span
                  className={`font-semibold tabular-nums ${
                    active.adherence_pct < 50 ? 'text-amber-600' : 'text-slate-900'
                  }`}
                >
                  {Math.round(active.adherence_pct)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div
                  className={`h-2 rounded-full transition-all ${
                    active.adherence_pct < 50 ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(Math.max(active.adherence_pct, 0), 100)}%` }}
                />
              </div>
              {active.missed_in_block != null && active.missed_in_block > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  {t.panel.missedInBlock(active.missed_in_block)}
                </p>
              )}
            </div>
          )}

          {active.week && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t.panel.currentWeek}
              </p>
              <div className="grid grid-cols-7 gap-1.5">
                {active.week.days.map(day => (
                  <div
                    key={day.day_number}
                    title={`${day.name ?? t.program.emptyDay} · ${day.status}`}
                    className={`rounded-lg px-1 py-2 text-center text-[11px] font-medium ${
                      day.status === 'done'
                        ? 'bg-green-100 text-green-800'
                        : day.status === 'today'
                          ? 'bg-indigo-100 text-indigo-800'
                          : day.status === 'rest'
                            ? 'bg-slate-100 text-slate-500'
                            : day.status === 'skipped'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-white text-slate-400 ring-1 ring-inset ring-slate-200'
                    }`}
                  >
                    <span className="block truncate">
                      {day.is_rest ? t.program.restDay : day.name || `D${day.day_number}`}
                    </span>
                    <span className="block text-[10px] capitalize opacity-80">{day.status}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs tabular-nums text-slate-500">
                {active.week.done_count} / {active.week.planned_count}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <TrainingEmpty
            icon={CalendarDays}
            title={clientName ? t.panel.noProgram(clientName) : t.panel.noProgramGeneric}
            actionLabel={t.panel.assignProgram}
            onAction={() => setShowAssign(true)}
          />
        </div>
      )}

      {/* Recent logs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t.panel.recentLogs}
        </h4>

        {logs.length === 0 ? (
          <TrainingEmpty icon={Dumbbell} title={t.panel.noLogs} />
        ) : (
          <ul className="divide-y divide-slate-100">
            {logs.map(log => (
              <li key={log.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900">{log.title}</p>
                      {log.pr_count > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                          <Award size={12} />
                          {t.panel.prCount(log.pr_count)}
                        </span>
                      )}
                      {log.is_partial && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {t.panel.partial}
                        </span>
                      )}
                      {log.reviewed_at && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          <CheckCircle size={12} />
                          {t.panel.reviewed}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm tabular-nums text-slate-500">
                      {formatShortDate(log.completed_at ?? log.started_at)} ·{' '}
                      {formatDuration(log.duration_seconds)} · {log.total_sets} {t.panel.sets} ·{' '}
                      {formatVolume(log.total_volume_kg, weightUnit)}
                    </p>
                    {log.notes && (
                      <p className="mt-1 text-sm text-slate-600">
                        <span className="text-slate-400">{t.panel.clientNote}: </span>
                        {log.notes}
                      </p>
                    )}
                    {log.coach_comment && (
                      <p className="mt-1 text-sm text-slate-600">{log.coach_comment}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenReview(openReview === log.id ? null : log.id)
                      setComment(log.coach_comment ?? '')
                      setReviewError(null)
                    }}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    {t.panel.review}
                  </button>
                </div>

                {openReview === log.id && (
                  <div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-4">
                    {reviewError && (
                      <TrainingErrorBanner
                        message={reviewError}
                        onDismiss={() => setReviewError(null)}
                      />
                    )}
                    <div>
                      <label
                        htmlFor={`review-${log.id}`}
                        className="mb-1 block text-xs font-medium text-slate-600"
                      >
                        {t.panel.writeComment}
                      </label>
                      <textarea
                        id={`review-${log.id}`}
                        rows={2}
                        value={comment}
                        onChange={event => setComment(event.target.value)}
                        placeholder={t.panel.commentPlaceholder}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleReview(log, false)}
                        disabled={reviewing}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                      >
                        <Send size={14} />
                        {reviewing ? t.common.saving : t.panel.send}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReview(log, true)}
                        disabled={reviewing || log.coach_congratulated}
                        className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white disabled:opacity-50"
                      >
                        <PartyPopper size={14} />
                        {log.coach_congratulated ? t.panel.congratulated : t.panel.congratulate}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Strength */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <TrendingUp size={14} />
            {t.panel.strength}
          </h4>
          {exerciseOptions.length > 0 && (
            <select
              value={selectedKey}
              onChange={event => setSelectedKey(event.target.value)}
              aria-label={t.panel.selectExercise}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {exerciseOptions.map(option => (
                <option key={option.key} value={option.key}>
                  {option.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {historyError ? (
          <TrainingErrorBanner message={historyError} onDismiss={() => setHistoryError(null)} />
        ) : historyLoading ? (
          <TrainingInlineSpinner />
        ) : chartData.length < 2 ? (
          <p className="py-8 text-center text-sm text-slate-500">{t.panel.noTrend}</p>
        ) : (
          <>
            <p className="mb-2 text-xs text-slate-500">
              {t.panel.estimated1rm} ({weightUnit})
            </p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={['auto', 'auto']} />
                  <Tooltip formatter={(value: number) => [`${value} ${weightUnit}`, t.panel.estimated1rm]} />
                  <Line
                    type="monotone"
                    dataKey="e1rm"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Best sets double as the record list for the selected lift.
            El contrato ya decidio `GET /training/clients/{user_id}/records` con la forma de
            `/me/records` (`trainingAPI.getClientRecords`). En la segunda pasada esta tabla pasa a
            leer de ahi —marcas de todos los ejercicios, con su delta— en vez de derivarlas del
            historial del ejercicio seleccionado. Hasta que el endpoint responda, el
            comportamiento no cambia. */}
        {(history?.best_sets?.length ?? 0) > 0 && (
          <div className="mt-6">
            <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t.panel.records}
            </h5>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4 font-medium">{t.panel.achieved}</th>
                    <th className="py-2 pr-4 font-medium">{t.panel.bestWeight}</th>
                    <th className="py-2 pr-4 font-medium">{t.panel.bestReps}</th>
                    <th className="py-2 font-medium">{t.panel.best1rm}</th>
                  </tr>
                </thead>
                <tbody>
                  {(history?.best_sets ?? []).map((set, index) => (
                    <tr
                      key={set.id ?? `${set.client_uuid}-${index}`}
                      className="border-b border-slate-100"
                    >
                      <td className="py-2 pr-4 whitespace-nowrap text-slate-700">
                        {formatShortDate(set.completed_at)}
                      </td>
                      <td className="py-2 pr-4 tabular-nums text-slate-900">
                        {formatWeight(set.weight_kg, weightUnit)}
                      </td>
                      <td className="py-2 pr-4 tabular-nums text-slate-700">{set.reps}</td>
                      <td className="py-2 tabular-nums text-slate-900">
                        {formatWeight(set.e1rm_kg ?? null, weightUnit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AssignProgramModal
        isOpen={showAssign}
        onClose={() => setShowAssign(false)}
        onSuccess={() => {
          setSuccessMessage(t.assign.assigned)
          load()
        }}
        clientUserId={userId}
        clientName={clientName}
      />
    </div>
  )
}
