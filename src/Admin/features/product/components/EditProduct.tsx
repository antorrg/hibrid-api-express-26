import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Form } from 'react-bootstrap';
import { useProductStore } from '../productStore';
import SelectImages from '../../images/SelectImages/SelectImages';
import ConfirmModal from '../../../../shared/modalComponents/ConfirmModal';
import Loader from '../../../../shared/components/Loader';
import DoubleButton from '../../../Utils/DoubleButton';
import type { UpdateProductDTO } from '../productTypes';

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedProduct, isLoading, fetchProductById, updateProduct } = useProductStore();

  // Estados del formulario
  const [title, setTitle] = useState('');
  const [picture, setPicture] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [showHeaderInfo, setShowHeaderInfo] = useState(false);
  const [infoHeader, setInfoHeader] = useState('');
  const [infoBody, setInfoBody] = useState('');
  const [isAlive, setIsAlive] = useState(false);
  const [url, setUrl] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [saver, setSaver] = useState(false);

  // Modal y errores
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Carga inicial del producto si no está en store o difiere del ID
  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id, fetchProductById]);

  // Poblado de datos en el formulario
  useEffect(() => {
    if (selectedProduct && selectedProduct.id === id) {
      setTitle(selectedProduct.title || '');
      setPicture(selectedProduct.picture || null);
      setLogo(selectedProduct.logo || null);
      setInfoHeader(selectedProduct.info_header || '');
      setInfoBody(selectedProduct.info_body || '');
      setIsAlive(Boolean(selectedProduct.isAlive));
      setUrl(selectedProduct.url && selectedProduct.url !== 'NoUrl' ? selectedProduct.url : '');
      setEnabled(selectedProduct.enabled ?? true);
      setSaver(false);
      setHasLoadedData(true);
    }
  }, [selectedProduct, id]);

  const handleGoBack = () => {
    if (id) {
      navigate(`/admin/product/${id}`);
    } else {
      navigate('/admin?tab=producto');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'El título del producto es obligatorio.';
    }

    if (!picture) {
      newErrors.picture = 'Debes seleccionar o subir una imagen principal.';
    }

    if (!infoHeader.trim()) {
      newErrors.infoHeader = 'La información de cabecera/posicionamiento es obligatoria.';
    }

    if (isAlive && !url.trim()) {
      newErrors.url = 'Si el proyecto está en vivo, debes indicar su URL.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setConfirmModalOpen(true);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!id) return;
    setConfirmModalOpen(false);

    const payload: UpdateProductDTO = {
      title: title.trim(),
      picture: picture || '',
      logo: logo || picture || '',
      info_header: infoHeader.trim(),
      info_body: infoBody.trim() || null,
      isAlive,
      url: isAlive ? url.trim() : 'NoUrl',
      enabled,
      saver,
    };

    const updated = await updateProduct(id, payload);
    if (updated) {
      navigate(`/admin/product/${id}`);
    }
  };

  if (isLoading && !hasLoadedData) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center">
        <Loader fullScreen={false} scale={0.7} text="Cargando producto a editar..." />
      </div>
    );
  }

  if (!selectedProduct && !isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="card p-5 border border-secondary-subtle bg-body shadow-sm">
          <h2 className="h4 text-body-emphasis mb-3">Producto no encontrado</h2>
          <p className="text-body-secondary mb-4">El producto que intentas editar no existe o fue eliminado.</p>
          <div>
            <button type="button" onClick={() => navigate('/admin?tab=producto')} className="btn btn-primary rounded-pill px-4">
              Volver a la lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 mb-5">
      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        title="Actualizar producto"
        message={`¿Estás seguro de que deseas guardar los cambios del producto "${title}"?`}
        confirmText="Sí, guardar cambios"
        cancelText="Cancelar"
        confirmVariant="btn-primary"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setConfirmModalOpen(false)}
      />

      {/* Navegación superior */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          type="button"
          onClick={handleGoBack}
          className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-2 px-3 py-2"
        >
          <span>←</span> Volver al Detalle
        </button>
      </div>

      <div className="card shadow-sm border border-secondary-subtle bg-body p-4 p-md-5" style={{ borderRadius: '16px' }}>
        <div className="border-bottom border-secondary-subtle pb-3 mb-4">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle mb-2">
            Modo Edición
          </span>
          <h2 className="h4 fw-bold text-body-emphasis mb-1">Editar Producto</h2>
          <p className="text-body-secondary small mb-0">
            Modifica la información principal, imágenes y visibilidad del producto o proyecto.
          </p>
        </div>

        {isLoading ? (
          <div className="py-5 text-center">
            <Loader fullScreen={false} scale={0.6} text="Guardando cambios..." />
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Título */}
            <div className="mb-4">
              <label htmlFor="product-title" className="form-label fw-semibold text-body">
                Título del Producto / Proyecto <span className="text-danger">*</span>
              </label>
              <input
                id="product-title"
                type="text"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                placeholder="Ej: Tienda Virtual Next.js"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>

            {/* Selectores de Imágenes */}
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <div className="card h-100 p-3 bg-body-tertiary border border-secondary-subtle rounded-3">
                  <h3 className="h6 fw-bold text-body mb-2">
                    Imagen Principal (Landing / Portada) <span className="text-danger">*</span>
                  </h3>
                  <SelectImages
                    id="product-main-picture"
                    titleField="Imagen principal:"
                    value={picture}
                    onChange={(newVal) => setPicture(newVal)}
                  />
                  {errors.picture && <div className="text-danger small mt-1">{errors.picture}</div>}
                </div>
              </div>

              <div className="col-md-6">
                <div className="card h-100 p-3 bg-body-tertiary border border-secondary-subtle rounded-3">
                  <h3 className="h6 fw-bold text-body mb-2">Logo del Proyecto (Opcional)</h3>
                  <p className="text-body-secondary small mb-3">
                    Si no seleccionas un logo, se utilizará la imagen principal como respaldo.
                  </p>
                  <SelectImages
                    id="product-logo-picture"
                    titleField="Logo del proyecto:"
                    value={logo}
                    onChange={(newVal) => setLogo(newVal)}
                  />
                </div>
              </div>
            </div>

            {/* Información de posicionamiento / SEO */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label htmlFor="product-info-header" className="form-label fw-semibold text-body mb-0">
                  Información de cabecera / Posicionamiento <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  className="btn btn-link btn-sm text-decoration-none p-0 text-body-secondary"
                  onClick={() => setShowHeaderInfo(!showHeaderInfo)}
                >
                  {showHeaderInfo ? 'Ocultar ayuda' : '¿Para qué sirve?'}
                </button>
              </div>

              {showHeaderInfo && (
                <div className="alert alert-info py-2 px-3 small border-0 mb-2">
                  ℹ️ Esta descripción corta se utiliza para los encabezados SEO, metaetiquetas y títulos de búsqueda.
                </div>
              )}

              <textarea
                id="product-info-header"
                rows={3}
                className={`form-control ${errors.infoHeader ? 'is-invalid' : ''}`}
                placeholder="Breve frase o descripción de posicionamiento..."
                value={infoHeader}
                onChange={(e) => setInfoHeader(e.target.value)}
              />
              {errors.infoHeader && <div className="invalid-feedback">{errors.infoHeader}</div>}
            </div>

            {/* Descripción detallada */}
            <div className="mb-4">
              <label htmlFor="product-info-body" className="form-label fw-semibold text-body">
                Descripción detallada (Opcional)
              </label>
              <textarea
                id="product-info-body"
                rows={4}
                className="form-control"
                placeholder="Explicación completa de características, tecnologías, arquitectura y detalles del proyecto..."
                value={infoBody}
                onChange={(e) => setInfoBody(e.target.value)}
              />
            </div>

            {/* Switch de Proyecto en Vivo y URL */}
            <div className="card p-3 mb-4 bg-body-tertiary border border-secondary-subtle rounded-3">
              <div className="form-check form-switch mb-2">
                <Form.Check
                  type="switch"
                  id="isAliveSwitch"
                  checked={isAlive}
                  onChange={(e) => setIsAlive(e.target.checked)}
                  label={<span className="fw-semibold text-body">¿El proyecto está disponible online en producción (En vivo)?</span>}
                />
              </div>

              {isAlive ? (
                <div className="mt-3">
                  <label htmlFor="product-url" className="form-label small fw-semibold text-body">
                    URL del sitio en vivo <span className="text-danger">*</span>
                  </label>
                  <input
                    id="product-url"
                    type="url"
                    className={`form-control ${errors.url ? 'is-invalid' : ''}`}
                    placeholder="https://ejemplo.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  {errors.url && <div className="invalid-feedback">{errors.url}</div>}
                </div>
              ) : (
                <div className="alert alert-secondary py-2 px-3 small border-0 mb-0 mt-2 text-body-secondary">
                  📹 <strong>Proyecto sin despliegue online:</strong> Al no estar activo en la web, se vinculará a la galería de videos del portfolio usando el ID de este producto.
                </div>
              )}
            </div>

            {/* Opciones avanzadas de estado y almacenamiento */}
            <div className="card p-3 mb-4 bg-body-tertiary border border-secondary-subtle rounded-3">
              <h3 className="h6 fw-bold text-body mb-3">Configuración de Publicación y Almacenamiento</h3>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-check form-switch">
                    <Form.Check
                      type="switch"
                      id="enabledSwitch"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                      label={<span className="text-body fw-medium">Visibilidad activa (Mostrar en sitio público)</span>}
                    />
                    <div className="text-body-secondary small mt-1">
                      Si desactivas esta opción, el producto solo será visible para administradores.
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-check form-switch">
                    <Form.Check
                      type="switch"
                      id="saverSwitch"
                      checked={saver}
                      onChange={(e) => setSaver(e.target.checked)}
                      label={<span className="text-body fw-medium">Preservar imágenes anteriores (Saver)</span>}
                    />
                    <div className="text-body-secondary small mt-1">
                      Si cambias de imagen y activas esta opción, la imagen antigua no será eliminada del servidor/almacenamiento.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción inferiores con DoubleButton */}
            <DoubleButton
              typeLeft="button"
              onClickLeft={handleGoBack}
              textLeft="Cancelar"
              typeRight="submit"
              textRight="Guardar Cambios"
              disabledRight={isLoading}
            />
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProduct;
