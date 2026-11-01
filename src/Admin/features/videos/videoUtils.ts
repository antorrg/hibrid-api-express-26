/**
 * Extrae el identificador de video de YouTube (11 caracteres) a partir de un ID
 * o de una URL completa (youtube.com, youtu.be, shorts, embed, etc.).
 */
export const extractYouTubeId = (input: string): string => {
  const trimmed = input.trim();
  if (!trimmed) return '';

  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([\w-]{11})/
  );

  if (match && match[1]) {
    return match[1];
  }

  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
};

/**
 * Retorna la URL de la miniatura de YouTube a partir de su ID o URL.
 */
export const getYouTubeThumbnail = (youTubeId: string): string => {
  const id = extractYouTubeId(youTubeId);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
};
