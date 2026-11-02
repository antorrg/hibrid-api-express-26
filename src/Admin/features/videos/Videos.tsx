import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Pagination } from 'react-bootstrap';
import { useVideosStore } from './videosStore';
import { booleanState } from '../../../shared/utils/utils';
import Loader from '../../../shared/components/Loader';
import ConfirmModal from '../../../shared/modalComponents/ConfirmModal';
import type { SingleVideoGroup } from './videosTypes';

type VideosProps = {
  setAction: ()=> void
}
const Videos: React.FC<VideosProps> = ({setAction}) => {
  const {
    videoGroups,
    paginationInfo,
    currentPage,
    isLoading,
    fetchVideoGroups,
    deleteGroup,
  } = useVideosStore();

  const [groupToDelete, setGroupToDelete] = useState<SingleVideoGroup | null>(null);

  useEffect(() => {
    fetchVideoGroups(1, 3);
  }, [fetchVideoGroups]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && (!paginationInfo || newPage <= paginationInfo.totalPages)) {
      fetchVideoGroups(newPage, 3);
    }
  };

  const handleConfirmDeleteGroup = async () => {
    if (!groupToDelete) return;
    const gId = groupToDelete.id;
    setGroupToDelete(null);
    await deleteGroup(gId);
  };

  return (
    <section className="container-fluid py-4 mb-4">
      {/* Modal de confirmación para eliminar grupo */}
      <ConfirmModal
        isOpen={groupToDelete !== null}
        title="Eliminar grupo de videos"
        message={`¿Estás seguro de que deseas eliminar permanentemente el grupo "${groupToDelete?.title}"?`}
        confirmText="Sí, eliminar grupo"
        cancelText="Cancelar"
        confirmVariant="btn-danger"
        onConfirm={handleConfirmDeleteGroup}
        onCancel={() => setGroupToDelete(null)}
      />

      {/* Cabecera */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-body-emphasis mb-1">Galería de Videos</h2>
          <p className="text-body-secondary mb-0 small">
            Gestión de grupos de videos demostrativos vinculados a los productos del portfolio
          </p>
        </div>
        <div>
          <button
            onClick={setAction}
            className="btn btn-sm btn-outline-primary px-3 py-2 fw-semibold rounded-pill d-flex align-items-center gap-1"
          >
            <span>+ Crear videos desde Productos</span>
          </button>
        </div>
      </div>

      {/* Banner informativo sobre la regla de vinculación con producto */}
      <div className="alert alert-info border border-info-subtle bg-info-subtle text-info-emphasis rounded-3 p-3 mb-4 d-flex align-items-center gap-3">
        <span className="fs-4">💡</span>
        <div className="small">
          <strong>Regla del sistema:</strong> Los grupos de videos deben crearse asociados a un producto específico.
          Para crear un nuevo grupo, ve a la pestaña <strong>Productos</strong> y haz clic en <strong>Crear videos</strong> en el producto deseado.
        </div>
      </div>

      {isLoading && videoGroups.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Loader fullScreen={false} scale={0.5} text="Cargando grupos de videos..." />
        </div>
      ) : videoGroups.length === 0 ? (
        <div className="card border border-secondary-subtle bg-body p-5 text-center shadow-sm rounded-4">
          <div className="py-3">
            <span className="fs-1 text-secondary d-block mb-3">🎬</span>
            <h3 className="h5 fw-bold text-body-emphasis mb-2">No hay grupos de videos registrados</h3>
            <p className="text-body-secondary mb-4 mx-auto" style={{ maxWidth: '480px' }}>
              Aún no se ha creado ningún grupo de videos. Selecciona un producto del catálogo para crear su primer grupo.
            </p>
            <Link to="/admin?tab=producto" className="btn btn-primary rounded-pill px-4 py-2 fw-semibold">
              Ir al Catálogo de Productos
            </Link>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {videoGroups.map((group) => (
            <div
              key={group.id}
              className="card shadow-sm border border-secondary-subtle bg-body p-4 rounded-4"
            >
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <h3 className="h5 fw-bold text-body-emphasis mb-0">{group.title}</h3>
                    <span
                      className={`badge ${
                        group.enabled
                          ? 'bg-success-subtle text-success border border-success-subtle'
                          : 'bg-danger-subtle text-danger border border-danger-subtle'
                      }`}
                    >
                      {booleanState(group.enabled)}
                    </span>
                  </div>

                  <p className="text-body-secondary small mb-2">{group.description}</p>

                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-body-tertiary text-body border border-secondary-subtle font-monospace small">
                      ID Producto: {group.productId}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/admin/videos/${group.id}`}
                    className="btn btn-sm btn-outline-primary px-3 py-2 fw-semibold rounded-pill"
                  >
                    Ver / Gestionar videos
                  </Link>
                  <button
                    type="button"
                    onClick={() => setGroupToDelete(group)}
                    className="btn btn-sm btn-outline-danger px-3 py-2 fw-semibold rounded-pill"
                    title="Eliminar grupo"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Paginación si hay más de 3 elementos o más de 1 página */}
          {paginationInfo && paginationInfo.totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center mt-4">
              <Pagination className="mb-0">
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || isLoading}
                />
                {Array.from({ length: paginationInfo.totalPages }, (_, i) => i + 1).map((page) => (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                    disabled={isLoading}
                  >
                    {page}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= paginationInfo.totalPages || isLoading}
                />
              </Pagination>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Videos;
