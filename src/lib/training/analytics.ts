/**
 * Product analytics facade for the training module.
 *
 * There is no analytics provider yet (plan §7.4). This is the seam: today every event goes to
 * `console.debug` behind a flag, tomorrow the body of `trackTraining` calls a real SDK and not a
 * single call site changes. The panel is responsible for three events; iOS owns the rest.
 */

export type TrainingAnalyticsEvent =
  | 'program_created'
  | 'program_published'
  | 'program_assigned'

export type TrainingAnalyticsProps = Record<string, string | number | boolean | null | undefined>

/**
 * Debug logging is opt-in so the console stays readable. Turn it on with
 * `NEXT_PUBLIC_TRAINING_ANALYTICS_DEBUG=true`, or from the browser with
 * `localStorage.setItem('training.analytics.debug', '1')`.
 */
const isDebugEnabled = (): boolean => {
  if (process.env.NEXT_PUBLIC_TRAINING_ANALYTICS_DEBUG === 'true') return true
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem('training.analytics.debug') === '1'
  } catch {
    // Private mode, blocked storage: analytics must never break a page.
    return false
  }
}

export const trackTraining = (
  event: TrainingAnalyticsEvent,
  props: TrainingAnalyticsProps = {},
): void => {
  if (!isDebugEnabled()) return
  console.debug('[training]', event, props)
}
