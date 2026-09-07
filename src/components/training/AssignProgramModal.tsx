'use client'

import { useCallback, useEffect, useState } from 'react'
import { Search, UserCheck } from 'lucide-react'
import {
  getUsersAPI,
  trainingAPI,
  type GymParticipant,
  type TrainingAssignmentMode,
  type TrainingProgram,
} from '@/lib/api'
import { nextMonday, thisMonday } from '@/lib/training/dates'
import { trainingStrings as t } from '@/lib/training/strings'
import { TrainingErrorBanner, TrainingInlineSpinner, TrainingModal } from './TrainingStates'

/**
 * Assigning a program: pick clients, pick a start Monday, pick copy or shared.
 *
 * Used from two places with the opposite half already fixed — from a program page the program is
 * given and the trainer picks clients; from a client's file the client is given and the trainer
 * picks a program.
 */
export default function AssignProgramModal({
  isOpen,
  onClose,
  onSuccess,
  program,
  clientUserId,
  clientName,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  /** Fixed program, when opened from a program page. */
  program?: TrainingProgram | null
  /** Fixed client, when opened from a client's file. */
  clientUserId?: number
  clientName?: string
}) {
  const [programs, setPrograms] = useState<TrainingProgram[]>([])
  const [clients, setClients] = useState<GymParticipant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(program?.id ?? null)
  const [selectedClientIds, setSelectedClientIds] = useState<number[]>(
    clientUserId ? [clientUserId] : [],
  )
  const [startOption, setStartOption] = useState<'this_week' | 'next_monday'>('next_monday')
  const [mode, setMode] = useState<TrainingAssignmentMode>('copy')
  const [replace, setReplace] = useState(false)
  const [clientSearch, setClientSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const requests: [Promise<TrainingProgram[]> | null, Promise<GymParticipant[]> | null] = [
        program ? null : trainingAPI.getPrograms({ limit: 100 }),
        clientUserId ? null : getUsersAPI.getGymParticipants({ role: 'MEMBER', limit: 200 }),
      ]
      const [programList, clientList] = await Promise.all([
        requests[0] ?? Promise.resolve<TrainingProgram[]>([]),
        requests[1] ?? Promise.resolve<GymParticipant[]>([]),
      ])
      setPrograms(programList)
      setClients(clientList)
    } catch {
      setError(t.assign.error)
    } finally {
      setLoading(false)
    }
  }, [program, clientUserId])

  useEffect(() => {
    if (!isOpen) return
    setSelectedProgramId(program?.id ?? null)
    setSelectedClientIds(clientUserId ? [clientUserId] : [])
    setStartOption('next_monday')
    setMode('copy')
    setReplace(false)
    setClientSearch('')
    setError(null)
    load()
  }, [isOpen, load, program, clientUserId])

  const toggleClient = (id: number) => {
    setSelectedClientIds(current =>
      current.includes(id) ? current.filter(value => value !== id) : [...current, id],
    )
  }

  const handleAssign = async () => {
    if (!selectedProgramId) {
      setError(t.assign.noProgramSelected)
      return
    }
    if (selectedClientIds.length === 0) {
      setError(t.assign.noClients)
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await trainingAPI.assignProgram(selectedProgramId, {
        user_ids: selectedClientIds,
        start_date: startOption === 'this_week' ? thisMonday() : nextMonday(),
        mode,
        replace,
      })
      onSuccess()
      onClose()
    } catch (err) {
      const status = (err as { status?: number } | null)?.status
      setError(status === 409 ? t.assign.activeAssignmentConflict : t.assign.error)
    } finally {
      setSubmitting(false)
    }
  }

  const visibleClients = clients.filter(client => {
    const needle = clientSearch.trim().toLowerCase()
    if (!needle) return true
    const name = `${client.first_name ?? ''} ${client.last_name ?? ''} ${client.email}`.toLowerCase()
    return name.includes(needle)
  })

  const fullName = (client: GymParticipant) =>
    [client.first_name, client.last_name].filter(Boolean).join(' ') || client.email

  return (
    <TrainingModal
      isOpen={isOpen}
      onClose={onClose}
      title={t.assign.title}
      subtitle={program?.name ?? clientName}
      size="xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={submitting || loading}
            className="rounded-xl bg-indigo-600 px-6 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? t.common.saving : t.assign.action}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {error && <TrainingErrorBanner message={error} onDismiss={() => setError(null)} />}

        {/* Program */}
        {!program && (
          <div>
            <label htmlFor="assign-program" className="mb-2 block text-sm font-medium text-slate-700">
              {t.assign.program}
            </label>
            {loading ? (
              <TrainingInlineSpinner />
            ) : (
              <select
                id="assign-program"
                value={selectedProgramId ?? ''}
                onChange={event => setSelectedProgramId(Number(event.target.value) || null)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{t.assign.noProgramSelected}</option>
                {programs.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {t.programs.weeksCount(item.duration_weeks)}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Clients */}
        {!clientUserId && (
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">{t.assign.clients}</span>
            <div className="relative mb-2">
              <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                value={clientSearch}
                onChange={event => setClientSearch(event.target.value)}
                placeholder={t.common.search}
                aria-label={t.assign.clients}
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200">
              {loading ? (
                <div className="p-4">
                  <TrainingInlineSpinner />
                </div>
              ) : visibleClients.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">{t.assign.noClients}</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {visibleClients.map(client => (
                    <li key={client.id}>
                      <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={selectedClientIds.includes(client.id)}
                          onChange={() => toggleClient(client.id)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700">{fullName(client)}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {clientUserId && clientName && (
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <UserCheck size={16} className="text-slate-400" />
            {clientName}
          </div>
        )}

        {/* Start */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-slate-700">{t.assign.start}</legend>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStartOption('this_week')}
              aria-pressed={startOption === 'this_week'}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                startOption === 'this_week'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.assign.startThisWeek}
              <span className="mt-1 block text-xs font-normal tabular-nums text-slate-500">
                {thisMonday()}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStartOption('next_monday')}
              aria-pressed={startOption === 'next_monday'}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                startOption === 'next_monday'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t.assign.startNextMonday}
              <span className="mt-1 block text-xs font-normal tabular-nums text-slate-500">
                {nextMonday()}
              </span>
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-500">{t.assign.startHint}</p>
        </fieldset>

        {/* Mode */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-slate-700">{t.assign.mode}</legend>
          <div className="flex gap-3">
            {(['copy', 'shared'] as TrainingAssignmentMode[]).map(value => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
                className={`flex-1 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                  mode === value
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {value === 'copy' ? t.assign.modeCopy : t.assign.modeShared}
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  {value === 'copy' ? t.assign.modeCopyHint : t.assign.modeSharedHint}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Replace */}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
          <input
            type="checkbox"
            checked={replace}
            onChange={event => setReplace(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>
            <span className="block text-sm font-medium text-slate-700">{t.assign.replace}</span>
            <span className="block text-xs text-slate-500">{t.assign.replaceHint}</span>
          </span>
        </label>
      </div>
    </TrainingModal>
  )
}
