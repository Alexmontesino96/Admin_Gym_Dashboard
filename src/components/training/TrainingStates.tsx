'use client'

import type { LucideIcon } from 'lucide-react'
import { AlertCircle, CheckCircle, Loader2, X } from 'lucide-react'
import { trainingStrings as t } from '@/lib/training/strings'

/**
 * The three states every training page owes the reader: loading, empty, error.
 *
 * They are one component each because the panel repeats them on five routes, and a page that
 * shows an empty list when the request actually failed makes the trainer believe their client
 * stopped training. Same shapes as the nutrition editor (spinner, circle + icon + text + action,
 * dismissible red banner).
 */

export function TrainingSpinner({ label = t.common.loading }: { label?: string }) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      <p className="mt-4 font-medium text-slate-600">{label}</p>
    </div>
  )
}

export function TrainingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-2 h-8 w-1/3 rounded bg-slate-200" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 h-6 w-1/4 rounded bg-slate-200" />
        <div className="space-y-3">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="h-16 rounded bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function TrainingEmpty({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <Icon size={24} className="text-slate-400" />
      </div>
      <h4 className="mb-2 text-lg font-medium text-slate-900">{title}</h4>
      {description && <p className="mb-6 text-slate-600">{description}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mx-auto rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function TrainingErrorBanner({
  message,
  onDismiss,
  onRetry,
}: {
  message: string
  onDismiss?: () => void
  onRetry?: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4">
      <div className="flex items-center space-x-3">
        <AlertCircle size={20} className="shrink-0 text-red-600" />
        <p className="text-red-800">{message}</p>
      </div>
      <div className="flex items-center space-x-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg px-3 py-1 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            {t.common.retry}
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label={t.common.dismiss}
            className="text-red-500 transition-colors hover:text-red-700"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

export function TrainingSuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center space-x-3 rounded-xl border border-green-200 bg-green-50 p-4">
      <CheckCircle size={20} className="text-green-600" />
      <p className="font-medium text-green-800">{message}</p>
    </div>
  )
}

export function TrainingInlineSpinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-500">
      <Loader2 size={16} className="animate-spin" />
      {label ?? t.common.loading}
    </span>
  )
}

/** Backdrop + panel of the panel's canonical modal (see `PlanAnalyticsModal`). */
export function TrainingModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'lg',
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'lg' | 'xl' | '2xl'
}) {
  if (!isOpen) return null

  const width = size === '2xl' ? 'max-w-2xl' : size === 'xl' ? 'max-w-xl' : 'max-w-lg'

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`flex max-h-[90vh] w-full ${width} flex-col rounded-2xl bg-white shadow-xl`}>
          <div className="flex items-center justify-between border-b border-slate-200 p-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.common.close}
              className="rounded-lg p-2 transition-colors hover:bg-slate-100"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
          {footer && (
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 p-6">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
