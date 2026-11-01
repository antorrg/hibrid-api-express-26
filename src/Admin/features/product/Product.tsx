import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useProductStore } from './productStore';
import { booleanState } from '../../../shared/utils/utils';
import Loader from '../../../shared/components/Loader';
import ConfirmModal from '../../../shared/modalComponents/ConfirmModal';
import type { IVariantProduct } from './productTypes';

const Product = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedProduct, isLoading, fetchProductById, deleteProduct, deleteVariant } = useProductStore();

  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<boolean>(false);
  const [variantToDelete, setVariantToDelete] = useState<IVariantProduct | null>(null);

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id, fetchProductById]);

  const handleGoBack = () => {
    navigate('/admin?tab=producto');
  };

  const handleConfirmDeleteProduct = async () => {
    if (!selectedProduct) return;
    setConfirmDeleteProduct(false);
    const success = await deleteProduct(selectedProduct.id);
    if (success) {
      handleGoBack();
    }
  };

  const handleConfirmDeleteVariant = async () => {
    if (!variantToDelete || !selectedProduct) return;
    const variantId = variantToDelete.id;
    setVariantToDelete(null);
    await deleteVariant(variantId, selectedProduct.id);
  };

  if (isLoading && !selectedProduct) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center">
        <Loader fullScreen={false} scale={0.7} text="Cargando producto..." />
      </div>
    );
  }

  if (!selectedProduct && !isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="card p-5 border border-secondary-subtle bg-body shadow-sm">
          <h2 className="h4 text-body-emphasis mb-3">Producto no encontrado</h2>
          <p className="text-body-secondary mb-4">El producto que intentas consultar no existe o fue eliminado.</p>
          <div>
            <button type="button" onClick={handleGoBack} className="btn btn-primary rounded-pill px-4">
              Volver a la lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  const variants = selectedProduct?.variants || [];

  return (
    <div className="container-fluid py-4 mb-5">
      {/* Modal de confirmación para eliminar producto */}
      <ConfirmModal
        isOpen={confirmDeleteProduct}
        title="Eliminar producto"
        message={`¿Estás seguro de que deseas eliminar permanentemente el producto "${selectedProduct?.title}" y todas sus variantes?`}
        confirmText="Sí, eliminar producto"
        cancelText="Cancelar"
        confirmVariant="btn-danger"
        onConfirm={handleConfirmDeleteProduct}
        onCancel={() => setConfirmDeleteProduct(false)}
      />

      {/* Modal de confirmación para eliminar variante */}
      <ConfirmModal
        isOpen={variantToDelete !== null}
        title="Eliminar variante"
        message="¿Estás seguro de que deseas eliminar esta variante?"
        confirmText="Sí, eliminar variante"
        cancelText="Cancelar"
        confirmVariant="btn-danger"
        onConfirm={handleConfirmDeleteVariant}
        onCancel={() => setVariantToDelete(null)}
      />

      {/* Navegación superior */}
    <div className=''>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          type="button"
          onClick={handleGoBack}
          className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-2 px-3 py-2 caption-badges"
        >
          <span>←</span> Volver
        </button>

        <div className="d-flex align-items-center gap-2">
          <Link
            to={`/admin/product/${selectedProduct!.id}/edit`}
            className="btn btn-sm btn-primary rounded-pill px-3 py-2 d-flex align-items-center gap-1"
          >
            ✏️ Editar producto
          </Link>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger rounded-pill px-3 py-2"
            onClick={() => setConfirmDeleteProduct(true)}
          >
            Eliminar producto
          </button>
        </div>
      </div>
      </div>

      {/* Ficha principal del producto */}
      <div className="card shadow-sm border border-secondary-subtle bg-body mb-5 p-4 p-md-5" style={{ borderRadius: '16px' }}>
        <div className="row g-4 align-items-start">
          <div className="col-lg-5 text-center">
            <div className="position-relative bg-body-tertiary rounded-4 overflow-hidden border border-secondary-subtle shadow-sm mb-3">
              <img
                src={selectedProduct?.picture}
                alt={selectedProduct?.title}
                className="w-100 h-100"
                style={{
                  maxHeight: '340px',
                  objectFit: 'contain',
                  opacity: selectedProduct?.enabled ? 1 : 0.6,
                }}
              />
            </div>
            {selectedProduct?.logo && (
              <div className="d-flex align-items-center justify-content-center gap-2 mt-2">
                <span className="text-body-secondary small">Logo:</span>
                <img
                  src={selectedProduct.logo}
                  alt="Logo"
                  className="rounded border border-secondary-subtle bg-body p-1"
                  style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                />
              </div>
            )}
          </div>

          <div className="col-lg-7">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <h1 className="h3 fw-bold text-body-emphasis mb-0">{selectedProduct?.title}</h1>
              <span
                className={`badge ${
                  selectedProduct?.enabled
                    ? 'bg-success-subtle text-success border border-success-subtle'
                    : 'bg-danger-subtle text-danger border border-danger-subtle'
                }`}
              >
                {booleanState(selectedProduct?.enabled)}
              </span>
              {selectedProduct?.isAlive && (
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                  En Producción
                </span>
              )}
            </div>

            <div className="mb-3">
              <h4 className="h6 text-body-secondary text-uppercase fw-semibold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                Información de cabecera / Posicionamiento
              </h4>
              <p className="text-body lead fs-6 mb-0">{selectedProduct?.info_header}</p>
            </div>

            <hr className="border-secondary-subtle my-3" />

            <div className="mb-3">
              <h4 className="h6 text-body-secondary text-uppercase fw-semibold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                Descripción completa
              </h4>
              <p className="text-body-secondary mb-0" style={{ whiteSpace: 'pre-line' }}>
                {selectedProduct?.info_body || 'Sin descripción detallada disponible.'}
              </p>
            </div>

            {selectedProduct?.url && selectedProduct.url !== 'NoUrl' && (
              <div className="mt-3">
                <h4 className="h6 text-body-secondary text-uppercase fw-semibold mb-1" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                  Enlace externo
                </h4>
                <a
                  href={selectedProduct.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-decoration-none small fw-medium"
                >
                  🔗 {selectedProduct.url} ↗
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección de Variantes */}
      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className='caption-badges'>
            <h3 className="h4 fw-bold text-body-emphasis mb-0">Variantes del Producto</h3>
            <p className="text-body-emphasis small mb-0">
              {variants.length > 0 ? `Total de variantes: ${variants.length}` : 'No hay variantes asociadas'}
            </p>
          </div>
        </div>

        {variants.length === 0 ? (
          <div className="card p-4 border border-secondary-subtle bg-body text-center shadow-sm">
            <p className="text-body-secondary mb-0">Este producto no cuenta con variantes registradas actualmente.</p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
            {variants.map((v, index) => (
              <div className="col" key={v.id}>
                <div className="card h-100 shadow-sm border border-secondary-subtle bg-body overflow-hidden">
                  <div className="bg-body-tertiary position-relative" style={{ aspectRatio: '16 / 10', overflow: 'hidden' }}>
                    <img
                      src={v.picture}
                      alt={`Variante ${index + 1}`}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover', objectPosition: 'center', opacity: v.enabled ? 1 : 0.6 }}
                      loading="lazy"
                    />
                    <span
                      className={`badge position-absolute top-0 end-0 m-2 ${
                        v.enabled
                          ? 'bg-success text-white'
                          : 'bg-secondary text-white'
                      }`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {booleanState(v.enabled)}
                    </span>
                  </div>

                  <div className="card-body d-flex flex-column justify-content-between p-3">
                    <p className="card-text text-body small mb-3 text-truncate-2" style={{ minHeight: '2.5rem' }}>
                      {v.text ? v.text.replace(/<[^>]*>/g, '') : <span className="text-body-secondary fst-italic">Sin texto descriptivo</span>}
                    </p>

                    <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary-subtle">
                      <Link
                        to={`/admin/product/${selectedProduct!.id}/variant/${v.id}`}
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                      >
                        Ver variante
                      </Link>
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-danger text-decoration-none p-0"
                        onClick={() => setVariantToDelete(v)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Product;
