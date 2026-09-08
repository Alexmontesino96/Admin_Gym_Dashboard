'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Copy,
  Dumbbell,
  Eye,
  Lock,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react'
import {
  trainingAPI,
  type TrainingProgramCreateData,
  type TrainingProgramListItem,
  type TrainingProgramStatus,
  type TrainingVisibility,
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

type StatusFilter = 'all' | TrainingProgramStatus

const STATUS_STYLES: Record<TrainingProgramStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  active: 'bg-green-100 text-green-800',
  archived: 'bg-amber-100 text-amber-800',
}

const STATUS_LABELS: Record<TrainingProgramStatus, string> = {
  draft: t.programs.statusDraft,
  active: t.programs.statusActive,
  archived: t.programs.statusArchived,
}

const emptyForm: TrainingProgramCreateData = {
  name: '',
  description: '',
  goal: '',
  duration_weeks: 8,
  visibility: 'private',
}

export default function TrainingProgramsClient() {
  const router = useRouter()
  const [programs, setPrograms] = useState<TrainingProgramListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // A failed load is not the same thing as "no programs": telling the second story when the first
  // one happened makes the trainer think their work disappeared.
  const [loadError, setLoadError] = useState<string | null>(null)
  const [moduleInactive, setModuleInactive] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<TrainingProgramCreateData>(emptyForm)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const loadPrograms = useCallback(async () => {
    setLoading(true)
    setError(null)
    setLoadError(null)
    setModuleInactive(false)
    try {
      const data = await trainingAPI.getPrograms({ limit: 100 })
      setPrograms(Array.isArray(data) ? data : [])
    } catch (err) {
      if (isModuleDisabled(err)) {
        setModuleInactive(true)
      } else {
        setLoadError(t.programs.loadError)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPrograms()
  }, [loadPrograms])

  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(() => setSuccessMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [successMessage])

  const visiblePrograms = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return programs.filter(program => {
      if (statusFilter !== 'all' && program.status !== statusFilter) return false
      if (!needle) return true
      return (
        program.name.toLowerCase().includes(needle) ||
        (program.goal ?? '').toLowerCase().includes(needle)
      )
    })
  }, [programs, search, statusFilter])

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.name.trim()) errors.name = t.programs.nameRequired
    if (!Number.isFinite(form.duration_weeks) || form.duration_weeks < 1 || form.duration_weeks > 52) {
      errors.duration_weeks = t.programs.durationRange
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreate = async () => {
    if (!validate()) return
    setActionLoading(true)
    setError(null)
    try {
      const created = await trainingAPI.createProgram({
        ...form,
        name: form.name.trim(),
        description: form.description?.trim() || null,
        goal: form.goal?.trim() || null,
      })
      setShowCreate(false)
      setForm(emptyForm)
      setSuccessMessage(t.programs.created)
      if (created?.id) {
        router.push(`/training/programs/${created.id}`)
      } else {
        loadPrograms()
      }
    } catch {
      setError(t.programs.createError)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDuplicate = async (program: TrainingProgramListItem) => {
    setActionLoading(true)
    setError(null)
    try {
      await trainingAPI.duplicateProgram(program.id)
      setSuccessMessage(t.programs.duplicated)
      await loadPrograms()
    } catch {
      setError(t.common.genericError)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (program: TrainingProgramListItem) => {
    if (!confirm(t.programs.confirmDelete)) return
    setActionLoading(true)
    setError(null)
    try {
      await trainingAPI.deleteProgram(program.id)
      setSuccessMessage(t.programs.deleted)
      await loadPrograms()
    } catch (err) {
      const status = (err as { status?: number } | null)?.status
      setError(status === 409 ? t.programs.deleteBlockedByAssignments : t.common.genericError)
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
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 p-3">
              <Dumbbell size={24} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t.programs.title}</h1>
              <p className="text-slate-600">{t.programs.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/training/exercises"
              className="rounded-xl border border-slate-300 px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t.exercises.title}
            </Link>
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm)
                setFormErrors({})
                setShowCreate(true)
              }}
              className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
            >
              <Plus size={18} />
              <span>{t.programs.newProgram}</span>
            </button>
          </div>
        </div>
      </div>

      {successMessage && <TrainingSuccessBanner message={successMessage} />}
      {error && <TrainingErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-[240px] flex-1">
            <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={t.programs.search}
              aria-label={t.programs.search}
              className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'draft', 'active', 'archived'] as StatusFilter[]).map(value => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  statusFilter === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {value === 'all' ? t.programs.filterAll : STATUS_LABELS[value]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <TrainingSkeleton />
        ) : loadError ? (
          <TrainingErrorBanner message={loadError} onRetry={loadPrograms} />
        ) : visiblePrograms.length === 0 ? (
          <TrainingEmpty
            icon={Dumbbell}
            title={programs.length === 0 ? t.programs.empty : t.programs.emptyFiltered}
            description={
              programs.length === 0
                ? t.programs.subtitle
                : undefined
            }
            actionLabel={programs.length === 0 ? t.programs.emptyAction : undefined}
            onAction={programs.length === 0 ? () => setShowCreate(true) : undefined}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {visiblePrograms.map(program => (
              <li key={program.id} className="group py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/training/programs/${program.id}`}
                        className="truncate text-lg font-semibold text-slate-900 transition-colors hover:text-indigo-600"
                      >
                        {program.name}
                      </Link>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[program.status]}`}
                      >
                        {STATUS_LABELS[program.status]}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        {program.visibility === 'group' ? (
                          <Eye size={12} />
                        ) : (
                          <Lock size={12} />
                        )}
                        {program.visibility === 'group'
                          ? t.programs.visibilityGroup
                          : t.programs.visibilityPrivate}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="tabular-nums">
                        {t.programs.weeksCount(program.duration_weeks)}
                      </span>
                      {program.goal && <span>{program.goal}</span>}
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Users size={14} />
                        {t.programs.assignedCount(program.assigned_count ?? 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(program)}
                      disabled={actionLoading}
                      title={t.common.duplicate}
                      aria-label={`${t.common.duplicate} ${program.name}`}
                      className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(program)}
                      disabled={actionLoading}
                      title={t.common.delete}
                      aria-label={`${t.common.delete} ${program.name}`}
                      className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                    <Link
                      href={`/training/programs/${program.id}`}
                      className="flex items-center gap-1 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      {t.program.overview}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create modal */}
      <TrainingModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title={t.programs.createTitle}
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {t.common.cancel}
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={actionLoading}
              className="rounded-xl bg-indigo-600 px-6 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {actionLoading ? t.common.saving : t.common.create}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="program-name" className="mb-2 block text-sm font-medium text-slate-700">
              {t.programs.name}
            </label>
            <input
              id="program-name"
              type="text"
              value={form.name}
              onChange={event => setForm({ ...form, name: event.target.value })}
              placeholder={t.programs.namePlaceholder}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="program-weeks" className="mb-2 block text-sm font-medium text-slate-700">
                {t.programs.durationWeeks}
              </label>
              <input
                id="program-weeks"
                type="number"
                min={1}
                max={52}
                value={form.duration_weeks}
                onChange={event =>
                  setForm({ ...form, duration_weeks: parseInt(event.target.value, 10) || 0 })
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 tabular-nums transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {formErrors.duration_weeks && (
                <p className="mt-1 text-sm text-red-600">{formErrors.duration_weeks}</p>
              )}
            </div>
            <div>
              <label htmlFor="program-goal" className="mb-2 block text-sm font-medium text-slate-700">
                {t.programs.goal}
              </label>
              <input
                id="program-goal"
                type="text"
                value={form.goal ?? ''}
                onChange={event => setForm({ ...form, goal: event.target.value })}
                placeholder={t.programs.goalPlaceholder}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="program-description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              {t.programs.description}
            </label>
            <textarea
              id="program-description"
              rows={3}
              value={form.description ?? ''}
              onChange={event => setForm({ ...form, description: event.target.value })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-slate-700">
              {t.programs.visibility}
            </legend>
            <div className="flex gap-3">
              {(['private', 'group'] as TrainingVisibility[]).map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, visibility: value })}
                  aria-pressed={form.visibility === value}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    form.visibility === value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {value === 'group' ? t.programs.visibilityGroup : t.programs.visibilityPrivate}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-slate-500">{t.programs.visibilityHint}</p>
          </fieldset>
        </div>
      </TrainingModal>
    </div>
  )
}
