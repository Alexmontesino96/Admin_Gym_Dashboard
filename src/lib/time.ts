// Utilities for timezone-aware conversions without extra deps

type Mode = 'utc' | 'offset'

// Robust parse for 'YYYY-MM-DDTHH:MM[:SS[.sss]]' or with space separator
const parseLocalDateTime = (val: string) => {
  const trimmed = val.trim()
  const m = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?/)
  if (!m) throw new Error('Invalid datetime-local value')
  const y = Number(m[1]); const mo = Number(m[2]); const d = Number(m[3])
  const hh = Number(m[4]); const mm = Number(m[5]); const ss = m[6] ? Number(m[6]) : 0
  return { y, m: mo, d, hh, mm, ss }
}

// Compute timezone offset (in minutes) for a given UTC timestamp and IANA zone
const getTzOffsetMinutes = (utcMs: number, timeZone: string): number => {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const parts = dtf.formatToParts(new Date(utcMs))
  const map: Record<string, number> = Object.create(null)
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = Number(p.value)
  }
  const asUTC = Date.UTC(map.year, (map.month || 1) - 1, map.day || 1, map.hour || 0, map.minute || 0, map.second || 0)
  return Math.round((asUTC - utcMs) / 60000)
}

// Convert gym local wall time to UTC ms using two-pass offset resolution (handles DST boundaries)
const gymLocalToUtcMs = (val: string, timeZone: string): number => {
  const { y, m, d, hh, mm, ss } = parseLocalDateTime(val)
  const targetUtcGuess = Date.UTC(y, m - 1, d, hh, mm, ss)
  const off1 = getTzOffsetMinutes(targetUtcGuess, timeZone)
  let utcMs = targetUtcGuess - off1 * 60000
  const off2 = getTzOffsetMinutes(utcMs, timeZone)
  if (off2 !== off1) {
    utcMs = targetUtcGuess - off2 * 60000
  }
  return utcMs
}

const pad2 = (n: number) => String(n).padStart(2, '0')

export const toGymZonedISO = (val: string, gymTimeZone: string, mode: Mode = 'utc'): string => {
  if (!val) throw new Error('Empty datetime value')
  const aware = /[zZ]$/.test(val) || /[+-]\d{2}:?\d{2}$/.test(val)
  if (aware) {
    // Already timezone-aware
    const date = new Date(val)
    if (isNaN(date.getTime())) throw new RangeError('Invalid time value')
    if (mode === 'utc') return date.toISOString()
    const utcMs = date.getTime()
    const offMin = getTzOffsetMinutes(utcMs, gymTimeZone)
    const sign = offMin >= 0 ? '+' : '-'
    const abs = Math.abs(offMin)
    const offHH = pad2(Math.floor(abs / 60))
    const offMM = pad2(abs % 60)
    const zDate = new Date(utcMs + offMin * 60000)
    const y = zDate.getUTCFullYear(); const m = zDate.getUTCMonth() + 1; const d = zDate.getUTCDate()
    const hh = zDate.getUTCHours(); const mm = zDate.getUTCMinutes(); const ss = zDate.getUTCSeconds()
    return `${y}-${pad2(m)}-${pad2(d)}T${pad2(hh)}:${pad2(mm)}:${pad2(ss)}${sign}${offHH}:${offMM}`
  }
  // Normalize input like 'YYYY-MM-DDTHH:MM' -> add seconds if missing
  const normalized = val.length === 16 ? `${val}:00` : val
  const utcMs = gymLocalToUtcMs(normalized, gymTimeZone)
  if (!isFinite(utcMs)) throw new RangeError('Invalid time value')
  if (mode === 'utc') {
    return new Date(utcMs).toISOString()
  }
  const { y, m, d, hh, mm, ss } = parseLocalDateTime(normalized)
  const offMin = getTzOffsetMinutes(utcMs, gymTimeZone)
  const sign = offMin >= 0 ? '+' : '-'
  const abs = Math.abs(offMin)
  const offHH = pad2(Math.floor(abs / 60))
  const offMM = pad2(abs % 60)
  return `${y}-${pad2(m)}-${pad2(d)}T${pad2(hh)}:${pad2(mm)}:${pad2(ss)}${sign}${offHH}:${offMM}`
}

export const ensureEndAfterStart = (startISO: string, endISO: string): boolean => {
  return new Date(endISO).getTime() > new Date(startISO).getTime()
}
