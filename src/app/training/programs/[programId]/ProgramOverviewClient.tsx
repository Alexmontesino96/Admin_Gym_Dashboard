'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  Copy,
  Layers,
  Lock,
  Eye,
  Pencil,
  Plus,
  Send,
  Trash2,
  UserPlus,
} from 'lucide-react'
import {
  trainingAPI,
  type TrainingBlock,
  type TrainingBlockCreateData,
  type TrainingDay,
  type TrainingProgram,
} from '@/lib/api'
import { dayNumbersOfWeek, weekdayIndex } from '@/lib/training/dates'
import { trainingStrings as t } from '@/lib/training/strings'
import AssignProgramModal from '@/components/training/AssignProgramModal'
import {
  isModuleDisabled,
  TrainingEmpty,
  TrainingErrorBanner,
  TrainingModal,
  TrainingModuleInactive,
  TrainingSkeleton,
  TrainingSuccessBanner,
} from '@/components/training/TrainingStates'

const emptyBlockForm = (weekStart: number): TrainingBlockCreateData => ({
  name: '',
  focus: '',
  week_start: weekStart,
  week_end: weekStart,
  notes: '',
})

/** Loads the day grid week by week, a few weeks at a time so a 52-week program does not fan out. */
const loadAllDays = async (programId: number, weeks: number): Promise<TrainingDay[]> => {
  const weekNumbers = Array.from({ length: weeks }, (_, index) => index + 1)
  const days: TrainingDay[] = []
  const chunkSize = 6
  for (let index = 0; index < weekNumbers.length; index += chunkSize) {
    const chunk = weekNumbers.slice(index, index + chunkSize)
    const results = await Promise.all(chunk.map(week => trainingAPI.getProgramDays(programId, week)))
    results.forEach(result => {
      if (Array.isArray(result)) days.push(...result)
    })
  }
  return days
}

export default function ProgramOverviewClient({ programId }: { programId: number }) {
  const router = useRouter()
  const [program, setProgram] = useState<TrainingProgram | null>(null)
  const [blocks, setBlocks] = useState<TrainingBlock[]>([])
  const [days, setDays] = useState<TrainingDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [moduleInactive, setModuleInactive] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [showBlockForm, setShowBlockForm] = useState(false)
  const [editingBlock, setEditingBlock] = useState<TrainingBlock | null>(null)
  const [blockForm, setBlockForm] = useState<TrainingBlockCreateData>(emptyBlockForm(1))
  const [blockErrors, setBlockErrors] = useState<Record<string, string>>({})
  const [showAssign, setShowAssign] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setModuleInactive(false)
    try {
      const programData = await trainingAPI.getProgram(programId)
      setProgram(programData)
      setBlocks(programData.blocks ?? [])
      if (programData.days && programData.days.length > 0) {
        setDays(programData.days)
      } else {
        setDays(await loadAllDays(programId, programData.duration_weeks))
      }
    } catch (err) {
      if (isModuleDisabled(err)) {
        setModuleInactive(true)
      } else {
        const status = (err as { status?: number } | null)?.status
        setError(status === 404 ? t.program.notFound : t.common.loadError)
      }
    } finally {
      setLoading(false)
    }
  }, [programId])

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

  const blockForWeek = useCallback(
    (week: number) => blocks.find(block => week >= block.week_start && week <= block.week_end),
    [blocks],
  )

  const validateBlock = (): boolean => {
    const errors: Record<string, string> = {}
    const weeks = program?.duration_weeks ?? 1
    if (!blockForm.name.trim()) errors.name = t.programs.nameRequired
    if (blockForm.week_start > blockForm.week_end) errors.range = t.program.blockOrderInvalid
    if (
      blockForm.week_start < 1 ||
      blockForm.week_end < 1 ||
      blockForm.week_start > weeks ||
      blockForm.week_end > weeks
    ) {
      errors.range = t.program.blockOutOfRange(weeks)
    }
    const overlaps = blocks.some(block => {
      if (editingBlock && block.id === editingBlock.id) return false
      return blockForm.week_start <= block.week_end && blockForm.week_end >= block.week_start
    })
    if (overlaps) errors.range = t.program.blockOverlap
    setBlockErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveBlock = async () => {
    if (!validateBlock()) return
    setActionLoading(true)
    setError(null)
    try {
      const payload: TrainingBlockCreateData = {
        ...blockForm,
        name: blockForm.name.trim(),
        focus: blockForm.focus?.trim() || null,
        notes: blockForm.notes?.trim() || null,
        order_index: editingBlock?.order_index ?? blocks.length,
      }
      if (editingBlock) {
        await trainingAPI.updateBlock(programId, editingBlock.id, payload)
      } else {
        await trainingAPI.createBlock(programId, payload)
      }
      setShowBlockForm(false)
      setEditingBlock(null)
      setSuccessMessage(t.program.blockSaved)
      await load()
    } catch (err) {
      const status = (err as { status?: number } | null)?.status
      setError(status === 422 ? t.program.blockOverlap : t.common.saveError)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteBlock = async (block: TrainingBlock) => {
    if (!confirm(t.program.confirmDeleteBlock)) return
    setActionLoading(true)
    try {
      await trainingAPI.deleteBlock(programId, block.id)
      await load()
    } catch {
      setError(t.common.genericError)
    } finally {
      setActionLoading(false)
    }
  }

  const handlePublish = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const updated = await trainingAPI.publishProgram(programId)
      setProgram(current => (current ? { ...current, ...updated } : updated))
      setSuccessMessage(t.program.published)
    } catch (err) {
      const status = (err as { status?: number } | null)?.status
      setError(status === 422 ? t.program.publishHint : t.program.publishError)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDuplicate = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const copy = await trainingAPI.duplicateProgram(programId)
      if (copy?.id) {
        router.push(`/training/programs/${copy.id}`)
      } else {
        setSuccessMessage(t.programs.duplicated)
      }
    } catch {
      setError(t.common.genericError)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <TrainingSkeleton rows={5} />
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
          href="/training"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft size={16} />
          {t.programs.title}
        </Link>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <TrainingEmpty
          icon={CalendarDays}
          title={t.program.notFound}
          actionLabel={t.programs.title}
          onAction={() => router.push('/training')}
        />
      </div>
    )
  }

  const weeks = Array.from({ length: program.duration_weeks }, (_, index) => index + 1)

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link
              href="/training"
              aria-label={t.programs.title}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{program.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                <span className="tabular-nums">{t.programs.weeksCount(program.duration_weeks)}</span>
                {program.goal && <span>· {program.goal}</span>}
                <span className="inline-flex items-center gap-1">
                  ·
                  {program.visibility === 'group' ? <Eye size={14} /> : <Lock size={14} />}
                  {program.visibility === 'group'
                    ? t.programs.visibilityGroup
                    : t.programs.visibilityPrivate}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    program.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : program.status === 'archived'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {program.status === 'active'
                    ? t.programs.statusActive
                    : program.status === 'archived'
                      ? t.programs.statusArchived
                      : t.programs.statusDraft}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDuplicate}
              disabled={actionLoading}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <Copy size={16} />
              {t.program.duplicate}
            </button>
            <button
              type="button"
              onClick={() => setShowAssign(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <UserPlus size={16} />
              {t.program.assign}
            </button>
            {program.status !== 'active' && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={actionLoading}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send size={16} />
                {t.program.publish}
              </button>
            )}
          </div>
        </div>

        {program.description && <p className="text-slate-600">{program.description}</p>}
      </div>

      {successMessage && <TrainingSuccessBanner message={successMessage} />}
      {error && <TrainingErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Blocks */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Layers size={18} className="text-slate-400" />
            {t.program.blocks}
          </h2>
          <button
            type="button"
            onClick={() => {
              const nextStart = blocks.length
                ? Math.min(
                    program.duration_weeks,
                    Math.max(...blocks.map(block => block.week_end)) + 1,
                  )
                : 1
              setEditingBlock(null)
              setBlockForm(emptyBlockForm(nextStart))
              setBlockErrors({})
              setShowBlockForm(true)
            }}
            className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Plus size={16} />
            {t.program.addBlock}
          </button>
        </div>

        {blocks.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">{t.program.blocksEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {[...blocks]
              .sort((a, b) => a.week_start - b.week_start)
              .map(block => (
                <li
                  key={block.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{block.name}</p>
                    <p className="text-sm tabular-nums text-slate-500">
                      {t.program.blockRange(block.week_start, block.week_end)}
                      {block.focus ? ` · ${block.focus}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBlock(block)
                        setBlockForm({
                          name: block.name,
                          focus: block.focus ?? '',
                          week_start: block.week_start,
                          week_end: block.week_end,
                          notes: block.notes ?? '',
                        })
                        setBlockErrors({})
                        setShowBlockForm(true)
                      }}
                      aria-label={`${t.common.edit} ${block.name}`}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-slate-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(block)}
                      aria-label={`${t.common.delete} ${block.name}`}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* Calendar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <CalendarDays size={18} className="text-slate-400" />
            {t.program.calendar}
          </h2>
          <p className="text-sm text-slate-500">{t.program.calendarHint}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-1 text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="w-24 px-2 py-2 font-medium">{t.common.week}</th>
                {t.week.dayNames.map(name => (
                  <th key={name} className="px-2 py-2 font-medium">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map(week => {
                const block = blockForWeek(week)
                return (
                  <tr key={week}>
                    <th scope="row" className="px-2 py-2 text-left align-top">
                      <Link
                        href={`/training/programs/${programId}/weeks/${week}`}
                        className="block font-semibold tabular-nums text-slate-900 hover:text-indigo-600"
                      >
                        {t.week.title(week)}
                      </Link>
                      {block && (
                        <span className="block text-xs font-normal text-slate-500">{block.name}</span>
                      )}
                    </th>
                    {dayNumbersOfWeek(week).map(dayNumber => {
                      const day = daysByNumber.get(dayNumber)
                      const exerciseCount = day?.exercises?.length ?? 0
                      const isRest = day?.is_rest ?? false
                      return (
                        <td key={dayNumber} className="align-top">
                          <Link
                            href={`/training/programs/${programId}/days/${dayNumber}`}
                            aria-label={`${t.week.dayNamesLong[weekdayIndex(dayNumber)]}, ${
                              t.week.title(week)
                            }, ${
                              isRest
                                ? t.program.restDay
                                : exerciseCount > 0
                                  ? t.program.exerciseCount(exerciseCount)
                                  : t.program.emptyDay
                            }`}
                            className={`block min-h-[64px] rounded-xl border p-2 transition-colors ${
                              isRest
                                ? 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                                : exerciseCount > 0
                                  ? 'border-indigo-200 bg-indigo-50 text-indigo-900 hover:bg-indigo-100'
                                  : 'border-dashed border-slate-300 bg-white text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            <span className="block truncate text-xs font-medium">
                              {isRest
                                ? t.program.restDay
                                : day?.name || (exerciseCount > 0 ? `${t.common.day} ${dayNumber}` : t.program.emptyDay)}
                            </span>
                            {!isRest && exerciseCount > 0 && (
                              <span className="mt-1 block text-xs tabular-nums text-indigo-700">
                                {t.program.exerciseCount(exerciseCount)}
                              </span>
                            )}
                          </Link>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Block modal */}
      <TrainingModal
        isOpen={showBlockForm}
        onClose={() => {
          setShowBlockForm(false)
          setEditingBlock(null)
        }}
        title={editingBlock ? t.common.edit : t.program.addBlock}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setShowBlockForm(false)
                setEditingBlock(null)
              }}
              className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleSaveBlock}
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
            <label htmlFor="block-name" className="mb-2 block text-sm font-medium text-slate-700">
              {t.program.blockName}
            </label>
            <input
              id="block-name"
              type="text"
              value={blockForm.name}
              onChange={event => setBlockForm({ ...blockForm, name: event.target.value })}
              placeholder={t.program.blockNamePlaceholder}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {blockErrors.name && <p className="mt-1 text-sm text-red-600">{blockErrors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="block-start" className="mb-2 block text-sm font-medium text-slate-700">
                {t.program.blockWeekStart}
              </label>
              <input
                id="block-start"
                type="number"
                min={1}
                max={program.duration_weeks}
                value={blockForm.week_start}
                onChange={event =>
                  setBlockForm({ ...blockForm, week_start: parseInt(event.target.value, 10) || 1 })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 tabular-nums transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="block-end" className="mb-2 block text-sm font-medium text-slate-700">
                {t.program.blockWeekEnd}
              </label>
              <input
                id="block-end"
                type="number"
                min={1}
                max={program.duration_weeks}
                value={blockForm.week_end}
                onChange={event =>
                  setBlockForm({ ...blockForm, week_end: parseInt(event.target.value, 10) || 1 })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 tabular-nums transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          {blockErrors.range && <p className="text-sm text-red-600">{blockErrors.range}</p>}

          <div>
            <label htmlFor="block-focus" className="mb-2 block text-sm font-medium text-slate-700">
              {t.program.blockFocus}
            </label>
            <input
              id="block-focus"
              type="text"
              value={blockForm.focus ?? ''}
              onChange={event => setBlockForm({ ...blockForm, focus: event.target.value })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="block-notes" className="mb-2 block text-sm font-medium text-slate-700">
              {t.program.blockNotes}
            </label>
            <textarea
              id="block-notes"
              rows={2}
              value={blockForm.notes ?? ''}
              onChange={event => setBlockForm({ ...blockForm, notes: event.target.value })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </TrainingModal>

      <AssignProgramModal
        isOpen={showAssign}
        onClose={() => setShowAssign(false)}
        onSuccess={() => {
          setSuccessMessage(t.assign.assigned)
          load()
        }}
        program={program}
      />
    </div>
  )
}
