/**
 * Calendar helpers of the training module.
 *
 * A program is a calendar of `duration_weeks × 7` days (plan §4.2): week 1 day 1 is a Monday, and
 * `week_number = ((day_number − 1) ÷ 7) + 1`. Assignments always start on a Monday, so the two
 * start options offered to the trainer are "this week" (last Monday) and "next Monday".
 */

/** Monday = 0 … Sunday = 6, the order the week grid is drawn in. */
export const weekdayIndex = (dayNumber: number): number => (dayNumber - 1) % 7

export const weekNumberOf = (dayNumber: number): number => Math.floor((dayNumber - 1) / 7) + 1

export const firstDayOfWeek = (week: number): number => (week - 1) * 7 + 1

export const dayNumbersOfWeek = (week: number): number[] => {
  const first = firstDayOfWeek(week)
  return [0, 1, 2, 3, 4, 5, 6].map(offset => first + offset)
}

const toISODate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** The Monday of the week that contains `from` (today by default), as `YYYY-MM-DD`. */
export const thisMonday = (from: Date = new Date()): string => {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  // getDay(): Sunday = 0. Sunday belongs to the week that started six days earlier.
  const offset = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - offset)
  return toISODate(date)
}

/** The next Monday strictly after `from`. This is the default start of an assignment. */
export const nextMonday = (from: Date = new Date()): string => {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const offset = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - offset + 7)
  return toISODate(date)
}

/** `2026-09-07` → `Sep 7, 2026`. Dates from the API are plain days, not instants. */
export const formatDate = (isoDate: string | null | undefined): string => {
  if (!isoDate) return '—'
  const date = new Date(`${isoDate.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** `2026-09-07T17:02:10-04:00` → `Sep 7`. */
export const formatShortDate = (isoDateTime: string | null | undefined): string => {
  if (!isoDateTime) return '—'
  const date = new Date(isoDateTime)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** `2026-09-07T17:02:10-04:00` → `Sep 7, 5:02 PM`. */
export const formatDateTime = (isoDateTime: string | null | undefined): string => {
  if (!isoDateTime) return '—'
  const date = new Date(isoDateTime)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
