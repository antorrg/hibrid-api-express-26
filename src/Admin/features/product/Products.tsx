import { useEffect } from 'react';
import { Link } from 'react-router';
import { useProductStore } from './productStore';
import { booleanState } from '../../../shared/utils/utils';
import Loader from '../../../shared/components/Loader';

const Products = () => {
  const { products, isLoading, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <section className="container-fluid py-4 mb-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
        <div>
          <h2 className="h4 fw-bold text-body-emphasis mb-1">Catálogo de Productos</h2>
          <p className="text-body-secondary mb-0 small">
            {products.length > 0 ? `Total de productos: ${products.length}` : 'Administración general de productos'}
          </p>
        </div>
        <div>
          <Link className="btn btn-sm btn-primary px-3 py-2 fw-semibold rounded-pill" to="/admin/product/create">
            + Crear producto
          </Link>
        </div>
      </div>

      {isLoading && products.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <Loader fullScreen={false} scale={0.5} text="Cargando productos..." />
        </div>
      ) : products.length === 0 ? (
        <div className="card border border-secondary-subtle bg-body p-5 text-center shadow-sm">
          <p className="text-body-secondary mb-0">No hay productos registrados en el sistema.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {products.map((info) => (
            <div
              className="card shadow-sm border border-secondary-subtle bg-body overflow-hidden"
              key={info.id}
              style={{ borderRadius: '12px' }}
            >
              <div className="d-flex flex-column flex-md-row align-items-center">
                <div
                  className="bg-body-tertiary flex-shrink-0"
                  style={{ width: '100%', maxWidth: '200px', height: '140px', overflow: 'hidden' }}
                >
                  <img
                    src={info.picture}
                    alt={info.title}
                    className="w-100 h-100"
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                      opacity: info.enabled ? 1 : 0.6,
                    }}
                    loading="lazy"
                  />
                </div>

                <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center w-100 p-3 gap-3">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h3 className="h5 fw-bold text-body-emphasis mb-0">{info.title}</h3>
                      <span
                        className={`badge ${
                          info.enabled
                            ? 'bg-success-subtle text-success border border-success-subtle'
                            : 'bg-danger-subtle text-danger border border-danger-subtle'
                        }`}
                      >
                        {booleanState(info.enabled)}
                      </span>
                    </div>
                    <p className="text-body-secondary small mb-1">{info.info_header}</p>
                    {info.url && info.url !== 'NoUrl' && (
                      <span className="text-muted small text-truncate d-block" style={{ maxWidth: '350px' }}>
                        🔗 {info.url}
                      </span>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Link
                      className="btn btn-sm btn-outline-secondary px-3 py-2 fw-medium rounded-pill"
                      to={`/admin/product/${info.id}`}
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Products;