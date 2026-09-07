import { kgToLb } from '@/lib/api'
import type { ApiDecimal, WeightUnit } from '@/lib/api'

/**
 * Weights travel and are stored in kilograms (plan §4.4). The conversion lives at the edge of the
 * interface: the trainer types in their own unit, the client reads in theirs, and the wire never
 * sees anything but kilos.
 */

export const LB_PER_KG = 2.204622621848776

/**
 * Los campos `Numeric` del backend llegan como cadena decimal (`"80.00"`). Todo lo que entra por
 * la red pasa por aquí antes de que nadie haga una cuenta con ello: `"80" + 2` es `"802"`, y ese
 * es exactamente el tipo de error que nadie ve hasta que un entrenador escribe una carga absurda.
 */
export const toNumber = (value: ApiDecimal | null | undefined): number | null => {
  if (value == null) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export const lbToKg = (lb: number): number => lb / LB_PER_KG

/** Step of a load stepper: 5 lb / 2.5 kg (plan §2.2). */
export const stepFor = (unit: WeightUnit): number => (unit === 'kg' ? 2.5 : 5)

/** A kilo value as a number in the given unit, rounded to one decimal. */
export const toUnit = (kg: number, unit: WeightUnit): number =>
  unit === 'kg' ? Math.round(kg * 10) / 10 : Math.round(kgToLb(kg) * 10) / 10

/** A value typed in the given unit back to kilos, rounded to two decimals (Numeric(7,2)). */
export const fromUnit = (value: number, unit: WeightUnit): number =>
  unit === 'kg' ? Math.round(value * 100) / 100 : Math.round(lbToKg(value) * 100) / 100

/** `"185 lb"`, or an em dash when there is nothing to show. */
export const formatWeight = (
  kg: ApiDecimal | null | undefined,
  unit: WeightUnit,
  options: { decimals?: number } = {},
): string => {
  const value = toNumber(kg)
  if (value == null) return '—'
  const decimals = options.decimals ?? (unit === 'kg' ? 1 : 0)
  return `${toUnit(value, unit).toFixed(decimals)} ${unit}`
}

/** Volume is big, so it reads better with thousand separators and no decimals. */
export const formatVolume = (kg: ApiDecimal | null | undefined, unit: WeightUnit): string => {
  const value = toNumber(kg)
  if (value == null) return '—'
  return `${Math.round(toUnit(value, unit)).toLocaleString('en-US')} ${unit}`
}

/** `3130` seconds becomes `52:10`. */
export const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds == null || seconds < 0) return '—'
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

/** `120` seconds becomes `2:00`, for the rest field of the day editor. */
export const formatRest = (seconds: number | null | undefined): string => {
  if (seconds == null) return '—'
  return formatDuration(seconds)
}
