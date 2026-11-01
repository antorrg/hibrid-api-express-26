import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useProductStore } from './productStore';
import { booleanState } from '../../../shared/utils/utils';
import Loader from '../../../shared/components/Loader';
import ConfirmModal from '../../../shared/modalComponents/ConfirmModal';

const Variant = () => {
  const { productId, variantId } = useParams<{ productId: string; variantId: string }>();
  const navigate = useNavigate();
  const { selectedVariant, isLoading, fetchVariantById, deleteVariant } = useProductStore();

  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    if (variantId) {
      fetchVariantById(variantId);
    }
  }, [variantId, fetchVariantById]);

  const handleBackToProduct = () => {
    if (productId) {
      navigate(`/admin/product/${productId}`);
    } else {
      navigate('/admin?tab=producto');
    }
  };

  const handleBackToTabs = () => {
    navigate('/admin?tab=producto');
  };

  const handleConfirmDelete = async () => {
    if (!variantId || !productId) return;
    setConfirmDelete(false);
    const success = await deleteVariant(variantId, productId);
    if (success) {
      handleBackToProduct();
    }
  };

  if (isLoading && !selectedVariant) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center">
        <Loader fullScreen={false} scale={0.7} text="Cargando variante..." />
      </div>
    );
  }

  if (!selectedVariant && !isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="card p-5 border border-secondary-subtle bg-body shadow-sm">
          <h2 className="h4 text-body-emphasis mb-3">Variante no encontrada</h2>
          <p className="text-body-secondary mb-4">La variante que buscas no existe o fue eliminada.</p>
          <div className="d-flex justify-content-center gap-3">
            <button type="button" onClick={handleBackToProduct} className="btn btn-primary rounded-pill px-4">
              Volver al Producto
            </button>
            <button type="button" onClick={handleBackToTabs} className="btn btn-outline-secondary rounded-pill px-4">
              Volver a la Galería de Productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 mb-5">
      <ConfirmModal
        isOpen={confirmDelete}
        title="Eliminar variante"
        message="¿Estás seguro de que deseas eliminar permanentemente esta variante?"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmVariant="btn-danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      {/* Barra de navegación superior con ambas opciones de retorno */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={handleBackToProduct}
            className="btn btn-sm btn-secondary rounded-pill d-flex align-items-center gap-2 px-3 py-2 caption-badges"
          >
            <span>←</span> Volver al Producto
          </button>
          <button
            type="button"
            onClick={handleBackToTabs}
            className="btn btn-sm btn-secondary rounded-pill d-flex align-items-center gap-2 px-3 py-2 caption-badges"
          >
            Ir a Productos
          </button>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link
            to={`/admin/product/${productId}/variant/${selectedVariant!.id}/edit`}
            className="btn btn-sm btn-primary rounded-pill px-3 py-2 d-flex align-items-center gap-1"
          >
            ✏️ Editar
          </Link>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger rounded-pill px-3 py-2"
            onClick={() => setConfirmDelete(true)}
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* Tarjeta de Detalle de la Variante */}
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-7">
          <div className="card shadow-sm border border-secondary-subtle bg-body p-4 p-md-5" style={{ borderRadius: '16px' }}>
            <div className="text-center mb-4">
              <span className="badge bg-secondary-subtle text-body-secondary border border-secondary-subtle mb-2">
                Detalle de Variante
              </span>
              <h2 className="h4 fw-bold text-body-emphasis mb-0">Variante de Producto</h2>
            </div>

            <div className="bg-body-tertiary rounded-4 overflow-hidden border border-secondary-subtle shadow-sm mb-4 text-center p-2">
              <img
                src={selectedVariant?.picture}
                alt="Foto de la variante"
                className="img-fluid rounded-3"
                style={{
                  maxHeight: '380px',
                  width: '100%',
                  objectFit: 'contain',
                  opacity: selectedVariant?.enabled ? 1 : 0.6,
                }}
              />
            </div>

            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h4 className="h6 text-body-secondary text-uppercase fw-semibold mb-0" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                  Descripción de la variante
                </h4>
                <span
                  className={`badge ${
                    selectedVariant?.enabled
                      ? 'bg-success-subtle text-success border border-success-subtle'
                      : 'bg-danger-subtle text-danger border border-danger-subtle'
                  }`}
                >
                  {booleanState(selectedVariant?.enabled)}
                </span>
              </div>
              <div className="p-3 bg-body-secondary rounded-3 border border-secondary-subtle">
                {selectedVariant?.text ? (
                  <div
                    className="rich-text-content text-body"
                    style={{ fontSize: '1rem' }}
                    dangerouslySetInnerHTML={{ __html: selectedVariant.text }}
                  />
                ) : (
                  <p className="text-body mb-0">
                    <span className="text-body-secondary fst-italic">Sin texto descriptivo.</span>
                  </p>
                )}
              </div>
            </div>

            <div className="d-flex flex-wrap justify-content-end gap-3 pt-3 border-top border-secondary-subtle">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={handleBackToProduct}
              >
                Volver al Producto
              </button>
              <Link
                to="/admin?tab=producto"
                className="btn btn-primary rounded-pill px-4"
              >
                Volver al Catálogo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Variant;
