import { useState, useEffect } from 'react';
import { useImageStore } from './imageStore';
import ConfirmModal from '../../../shared/modalComponents/ConfirmModal';
import Loader from '../../../shared/components/Loader';
import type { StoredImage } from './imageTypes';

const PAGE_SIZE = 12;

const ViewImages = () => {
  const { images, pagination, isLoading, fetchImages, deleteImage } = useImageStore();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [imageToDelete, setImageToDelete] = useState<StoredImage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchImages({ page: currentPage, limit: PAGE_SIZE, order: 'DESC' });
  }, [fetchImages, currentPage]);

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;
    const targetId = imageToDelete.id;
    setImageToDelete(null);
    setDeletingId(targetId);

    await deleteImage(targetId);
    setDeletingId(null);

    // Si borramos el último elemento de una página posterior a la 1, retrocedemos
    if (images.length === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    } else {
      fetchImages({ page: currentPage, limit: PAGE_SIZE, order: 'DESC' });
    }
  };

  const totalPages = pagination?.totalPages || Math.ceil((pagination?.total || images.length) / PAGE_SIZE) || 1;

  return (
    <section className="container-fluid py-4 mb-4">
      <ConfirmModal
        isOpen={imageToDelete !== null}
        title="Eliminar imagen"
        message="¿Estás seguro de que deseas eliminar esta imagen permanentemente? Esta acción eliminará el archivo del almacenamiento."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmVariant="btn-danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setImageToDelete(null)}
      />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-body-emphasis mb-1">Galería de imágenes</h2>
          <p className="text-body-secondary mb-0 small">
            {pagination ? `Total de imágenes registradas: ${pagination.total}` : 'Imágenes almacenadas en el servidor'}
          </p>
        </div>

        {/* Controles de paginación */}
        {totalPages > 1 && (
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              ◀ Anterior
            </button>
            <span className="text-body-secondary small px-2">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Siguiente ▶
            </button>
          </div>
        )}
      </div>

      {isLoading && images.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Loader fullScreen={false} scale={0.5} text="Cargando galería..." />
        </div>
      ) : images.length === 0 ? (
        <div className="card border border-secondary-subtle bg-body p-5 text-center shadow-sm">
          <p className="text-body-secondary mb-0">No hay imágenes guardadas en el sistema.</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {images.map((img, index) => {
            const isDeleting = deletingId === img.id;
            const filename = img.imageUrl.split('/').pop() || `imagen-${index + 1}`;

            return (
              <div className="col" key={img.id}>
                <div className="card h-100 shadow-sm border border-secondary-subtle bg-body overflow-hidden">
                  {isDeleting ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '220px' }}>
                      <Loader fullScreen={false} scale={0.3} text="Borrando..." />
                    </div>
                  ) : (
                    <>
                      <div className="position-relative bg-body-tertiary" style={{ aspectRatio: '16 / 10', overflow: 'hidden' }}>
                        <img
                          src={img.imageUrl}
                          alt={filename}
                          className="w-100 h-100"
                          style={{ objectFit: 'scale-down', objectPosition: 'center' }}
                          loading="lazy"
                        />
                      </div>
                      <div className="card-body d-flex flex-column justify-content-between p-3">
                        <div className="mb-2">
                          <span
                            className="d-inline-block text-truncate text-body fw-medium small w-100"
                            title={filename}
                          >
                            {filename}
                          </span>
                        </div>
                        <div className="d-flex justify-content-end align-items-center pt-2 border-top border-secondary-subtle">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setImageToDelete(img)}
                            disabled={deletingId !== null}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ViewImages;