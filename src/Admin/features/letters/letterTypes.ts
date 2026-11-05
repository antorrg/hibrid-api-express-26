export interface ILetter {
  id: string;
  tema: string;
  mensaje: string;
  aprobada: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PaginatedLettersResponse {
  info: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
  };
  data: ILetter[];
}

export interface ModerateLetterDTO {
  aprobada: boolean;
}

export const TEMAS_DISPONIBLES = [
  'Para quien lo necesite',
  'Ansiedad',
  'Duelo',
  'Soledad',
  'Empezar de nuevo',
  'Gratitud'
] as const;

export type TemaDisponible = typeof TEMAS_DISPONIBLES[number];

