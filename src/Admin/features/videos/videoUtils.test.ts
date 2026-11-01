import { describe, it, expect } from 'vitest';
import { extractYouTubeId, getYouTubeThumbnail } from './videoUtils';

describe('videoUtils', () => {
  it('extractYouTubeId extrae el ID correctamente de diversos formatos de URL y IDs directos', () => {
    // ID directo de 11 caracteres
    expect(extractYouTubeId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');

    // URL estándar watch?v=
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeId('https://youtube.com/watch?v=dQw4w9WgXcQ&t=10s')).toBe('dQw4w9WgXcQ');

    // URL corta youtu.be
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ?feature=share')).toBe('dQw4w9WgXcQ');

    // Shorts
    expect(extractYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');

    // Embed
    expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');

    // Entrada vacía
    expect(extractYouTubeId('')).toBe('');
    expect(extractYouTubeId('   ')).toBe('');
  });

  it('getYouTubeThumbnail retorna la URL correcta de la miniatura de YouTube', () => {
    expect(getYouTubeThumbnail('dQw4w9WgXcQ')).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
    expect(getYouTubeThumbnail('https://youtu.be/dQw4w9WgXcQ')).toBe(
      'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    );
    expect(getYouTubeThumbnail('')).toBe('');
  });
});
