// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import About from './About';
import { useAboutStore } from './aboutStore';

describe('About Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra estado vacío y botón para crear cuando no existe sección creada', () => {
    useAboutStore.setState({
      about: {
        id: 'mock-uuid',
        title: 'No title',
        picture: 'nopicture',
        text: 'no data yet',
        imgShow: false,
        enabled: true,
      },
      isLoading: false,
      error: null,
      fetchAbout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    );

    expect(screen.getByText('Acerca de Nosotros')).not.toBeNull();
    expect(screen.getByText('Aún no se ha creado la sección Acerca de')).not.toBeNull();
    expect(screen.getByRole('link', { name: '+ Crear Acerca de' })).not.toBeNull();
    expect(screen.queryByRole('link', { name: /Editar Acerca de/i })).toBeNull();
  });

  it('renderiza la sección completa en modo con imagen y permite editar', () => {
    useAboutStore.setState({
      about: {
        id: 'about-123',
        title: 'Nuestra Historia y Trayectoria',
        picture: 'https://storage.googleapis.com/test-bucket/about.jpg',
        text: '<p>Somos una empresa dedicada a soluciones tecnológicas de punta.</p>',
        imgShow: true,
        enabled: true,
      },
      isLoading: false,
      error: null,
      fetchAbout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    );

    expect(screen.getByText('Nuestra Historia y Trayectoria')).not.toBeNull();
    expect(screen.getByText('Modo: Con Imagen')).not.toBeNull();
    expect(screen.getByText('Activo')).not.toBeNull();
    expect(screen.getByText(/Somos una empresa dedicada a soluciones/i)).not.toBeNull();

    const img = screen.getByRole('img', { name: 'Nuestra Historia y Trayectoria' });
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('https://storage.googleapis.com/test-bucket/about.jpg');

    const editLinks = screen.getAllByRole('link', { name: /Editar Acerca de/i });
    expect(editLinks.length).toBeGreaterThan(0);
    expect(editLinks[0].getAttribute('href')).toBe('/admin/about/edit');
    expect(screen.queryByRole('link', { name: /\+ Crear Acerca de/i })).toBeNull();
  });

  it('renderiza la sección en modo sólo texto sin renderizar elemento de imagen', () => {
    useAboutStore.setState({
      about: {
        id: 'about-456',
        title: 'Misión y Visión Institucional',
        picture: 'nopicture',
        text: '<p>Nuestra misión es empoderar a organizaciones.</p>',
        imgShow: false,
        enabled: false,
      },
      isLoading: false,
      error: null,
      fetchAbout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    );

    expect(screen.getByText('Misión y Visión Institucional')).not.toBeNull();
    expect(screen.getByText('Modo: Sólo Texto')).not.toBeNull();
    expect(screen.getByText('Bloqueado')).not.toBeNull();
    expect(screen.getByText(/Nuestra misión es empoderar/i)).not.toBeNull();

    // No debe haber ninguna imagen de About
    expect(screen.queryByRole('img')).toBeNull();
  });
});
