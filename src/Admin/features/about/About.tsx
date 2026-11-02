import React, { useEffect } from 'react';
import { Link } from 'react-router';
import { useAboutStore, isAboutPersisted } from './aboutStore';
import { booleanState } from '../../../shared/utils/utils';
import Loader from '../../../shared/components/Loader';

const About: React.FC = () => {
  const { about, isLoading, fetchAbout } = useAboutStore();

  useEffect(() => {
    fetchAbout();
  }, [fetchAbout]);

  const exists = isAboutPersisted(about);

  if (isLoading && !about) {
    return (
      <div className="container-fluid py-5 d-flex justify-content-center align-items-center">
        <Loader fullScreen={false} scale={0.7} text="Cargando información de Acerca de..." />
      </div>
    );
  }

  const hasImage = Boolean(about?.imgShow && about?.picture && about.picture !== 'nopicture');

  return (
    <section className="container-fluid py-4 mb-4">
      {/* Cabecera superior */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-body-emphasis mb-1">Acerca de Nosotros</h2>
          <p className="text-body-secondary mb-0 small">
            Gestión y visualización de la sección informativa de la empresa o sitio web
          </p>
        </div>
        <div>
          {!exists ? (
            <Link
              to="/admin/about/create"
              className="btn btn-sm btn-primary px-3 py-2 fw-semibold rounded-pill"
            >
              + Crear Acerca de
            </Link>
          ) : (
            <Link
              to="/admin/about/edit"
              className="btn btn-sm btn-outline-primary px-3 py-2 fw-semibold rounded-pill"
            >
              ✏️ Editar Acerca de
            </Link>
          )}
        </div>
      </div>

      {!exists ? (
        <div
          className="card border border-secondary-subtle bg-body p-5 text-center shadow-sm"
          style={{ borderRadius: '12px' }}
        >
          <div className="py-4">
            <div className="mb-3">
              <span className="fs-1 text-secondary">📖</span>
            </div>
            <h3 className="h5 fw-bold text-body-emphasis mb-2">Aún no se ha creado la sección Acerca de</h3>
            <p className="text-body-secondary mb-4 mx-auto" style={{ maxWidth: '480px' }}>
              Esta sección presenta la historia, misión y valores de tu negocio al público. Haz clic en el botón de abajo para configurarla por primera vez.
            </p>
            <Link
              to="/admin/about/create"
              className="btn btn-primary px-4 py-2 fw-semibold rounded-pill"
            >
              Crear Acerca de ahora
            </Link>
          </div>
        </div>
      ) : (
        <div
          className="card shadow-sm border border-secondary-subtle bg-body overflow-hidden"
          style={{ borderRadius: '16px' }}
        >
          <div className="row g-0">
            {/* Imagen condicional (Modo Con Imagen) */}
            {hasImage && (
              <div className="col-lg-5 bg-body-tertiary d-flex align-items-center justify-content-center p-3 border-end-lg border-secondary-subtle">
                <div
                  className="w-100 rounded-3 overflow-hidden shadow-sm"
                  style={{ maxHeight: '380px', backgroundColor: 'var(--bs-tertiary-bg)' }}
                >
                  <img
                    src={about!.picture}
                    alt={about!.title}
                    className="w-100 h-100"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                      minHeight: '260px',
                      maxHeight: '380px',
                      opacity: about!.enabled ? 1 : 0.6,
                    }}
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* Contenido e información */}
            <div className={`${hasImage ? 'col-lg-7' : 'col-12'} p-4 p-md-5 d-flex flex-column justify-content-between`}>
              <div>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                  <span
                    className={`badge ${
                      about!.enabled
                        ? 'bg-success-subtle text-success border border-success-subtle'
                        : 'bg-danger-subtle text-danger border border-danger-subtle'
                    }`}
                  >
                    {booleanState(about!.enabled)}
                  </span>

                  <span
                    className={`badge ${
                      about!.imgShow
                        ? 'bg-primary-subtle text-primary border border-primary-subtle'
                        : 'bg-secondary-subtle text-secondary border border-secondary-subtle'
                    }`}
                  >
                    {about!.imgShow ? 'Modo: Con Imagen' : 'Modo: Sólo Texto'}
                  </span>
                </div>

                <h3 className="h3 fw-bold text-body-emphasis mb-4">{about!.title}</h3>

                <div className="mb-4">
                  <h4 className="text-uppercase tracking-wider text-body-secondary fw-semibold small mb-2">
                    Contenido Principal
                  </h4>
                  <div
                    className="p-3 bg-body-secondary rounded-3 border border-secondary-subtle rich-text-content text-body"
                    style={{ lineHeight: '1.7', fontSize: '1rem' }}
                    dangerouslySetInnerHTML={{ __html: about!.text }}
                  />
                </div>
              </div>

              <div className="pt-3 border-top border-secondary-subtle d-flex justify-content-end">
                <Link
                  to="/admin/about/edit"
                  className="btn btn-primary px-4 py-2 fw-semibold rounded-pill"
                >
                  ✏️ Editar Acerca de
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default About;
