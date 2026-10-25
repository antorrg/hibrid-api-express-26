import { throwError, ERROR_CODE } from '../../configs/errors.js'

export const TEMAS_DISPONIBLES = [
  'Para quien lo necesite',
  'Ansiedad',
  'Duelo',
  'Soledad',
  'Empezar de nuevo',
  'Gratitud'
] as const

export type TemaDisponible = typeof TEMAS_DISPONIBLES[number]

export function validTema(value: string): TemaDisponible {
  const isValid = TEMAS_DISPONIBLES.includes(value as TemaDisponible)
  if (!isValid) {
    throwError(ERROR_CODE.INVALID_INPUT, 'Tema no valido')
  }
  return value as TemaDisponible
}

export function validAprobada(b: unknown): boolean {
  if (b === true || b === 'true') {
    return true
  }
  return false
}
