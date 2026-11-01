import React, { useEffect } from 'react';
import { Link } from 'react-router';
import { useFrontPageStore, isFrontPagePersisted } from './frontPageStore';
import { booleanState } from '../../../shared/utils/utils';
import Loader from '../../../shared/components/Loader';

const FrontPage: React.FC = () => {
  const { frontPage, isLoading, fetchFrontPage } = useFrontPageStore();

  useEffect(() => {
    fetchFrontPage();
  }, [fetchFrontPage]);

  const exists = isFrontPagePersisted(frontPage);

  if (isLoading && !frontPage) {
    return (
      <div className="container-fluid py-5 d-flex justify-content-center align-items-center">
        <Loader fullScreen={false} scale={0.7} text="Cargando portada..." />
      </div>
    );
  }

  return (
    <section className="container-fluid py-4 mb-4">
      {/* Cabecera superior */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-body-emphasis mb-1">Portada del Sitio</h2>
          <p className="text-body-secondary mb-0 small">
            Gestión y visualización de la portada principal (Landing)
          </p>
        </div>
        <div>
          {/* Criterio estricto: Solo se puede crear una vez; luego solo editar */}
          {!exists ? (
            <Link
              to="/admin/frontpage/create"
              className="btn btn-sm btn-primary px-3 py-2 fw-semibold rounded-pill"
            >
              + Crear Portada
            </Link>
          ) : (
            <Link
              to="/admin/frontpage/edit"
              className="btn btn-sm btn-outline-primary px-3 py-2 fw-semibold rounded-pill"
            >
              ✏️ Editar Portada
            </Link>
          )}
        </div>
      </div>

      {!exists ? (
        <div className="card border border-secondary-subtle bg-body p-5 text-center shadow-sm" style={{ borderRadius: '12px' }}>
          <div className="py-4">
            <div className="mb-3">
              <span className="fs-1 text-secondary">🖼️</span>
            </div>
            <h3 className="h5 fw-bold text-body-emphasis mb-2">Aún no se ha creado la portada</h3>
            <p className="text-body-secondary mb-4 mx-auto" style={{ maxWidth: '480px' }}>
              La portada representa la presentación principal de la web pública. Haz clic en el botón de abajo para configurarla por primera vez.
            </p>
            <Link
              to="/admin/frontpage/create"
              className="btn btn-primary px-4 py-2 fw-semibold rounded-pill"
            >
              Crear portada ahora
            </Link>
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border border-secondary-subtle bg-body overflow-hidden" style={{ borderRadius: '16px' }}>
          <div className="row g-0">
            {/* Imagen de portada */}
            <div className="col-lg-5 bg-body-tertiary d-flex align-items-center justify-content-center p-3 border-end-lg border-secondary-subtle">
              <div
                className="w-100 rounded-3 overflow-hidden shadow-sm"
                style={{ maxHeight: '380px', backgroundColor: 'var(--bs-tertiary-bg)' }}
              >
                <img
                  src={frontPage!.picture}
                  alt={frontPage!.title}
                  className="w-100 h-100"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                    minHeight: '260px',
                    maxHeight: '380px',
                    opacity: frontPage!.enabled ? 1 : 0.6,
                  }}
                  loading="lazy"
                />
              </div>
            </div>

            {/* Contenido e información */}
            <div className="col-lg-7 p-4 p-md-5 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span
                    className={`badge ${
                      frontPage!.enabled
                        ? 'bg-success-subtle text-success border border-success-subtle'
                        : 'bg-danger-subtle text-danger border border-danger-subtle'
                    }`}
                  >
                    {booleanState(frontPage!.enabled)}
                  </span>
                  <span className="text-body-secondary small">Única portada del sistema</span>
                </div>

                <h3 className="h3 fw-bold text-body-emphasis mb-3">{frontPage!.title}</h3>

                <div className="mb-4">
                  <h4 className="text-uppercase tracking-wider text-body-secondary fw-semibold small mb-2">
                    Cabecera / Posicionamiento
                  </h4>
                  <div className="p-3 bg-body-tertiary rounded-3 border border-secondary-subtle text-body">
                    {frontPage!.info_header}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-uppercase tracking-wider text-body-secondary fw-semibold small mb-2">
                    Descripción
                  </h4>
                  <p className="text-body-secondary" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                    {frontPage!.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-top border-secondary-subtle d-flex justify-content-end">
                <Link
                  to="/admin/frontpage/edit"
                  className="btn btn-primary px-4 py-2 fw-semibold rounded-pill"
                >
                  ✏️ Editar Portada
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FrontPage;
