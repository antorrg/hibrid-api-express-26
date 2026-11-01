import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Form } from 'react-bootstrap';
import { useProductStore } from '../productStore';
import SelectImages from '../../images/SelectImages/SelectImages';
import ConfirmModal from '../../../../shared/modalComponents/ConfirmModal';
import Loader from '../../../../shared/components/Loader';
import type { CreateProductDTO, CreateVariantInProductDTO } from '../productTypes';
import DoubleButton from '../../../Utils/DoubleButton';
import { RichTextEditor, isRichTextEmpty } from '../../../Utils/RichTextEditor';

interface VariantDraft {
  picture: string;
  text: string;
}

const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const { createProduct, isLoading } = useProductStore();

  // Campos principales del producto
  const [title, setTitle] = useState('');
  const [picture, setPicture] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [showHeaderInfo, setShowHeaderInfo] = useState(false);
  const [infoHeader, setInfoHeader] = useState('');
  const [infoBody, setInfoBody] = useState('');
  const [isAlive, setIsAlive] = useState(false);
  const [url, setUrl] = useState('');

  // Variantes / Ítems
  const [variants, setVariants] = useState<VariantDraft[]>([
    { picture: '', text: '' },
  ]);

  // Modal de confirmación y estado de errores
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleGoBack = () => {
    navigate('/admin?tab=producto');
  };

  // Gestión de variantes
  const handleAddVariant = () => {
    setVariants((prev) => [...prev, { picture: '', text: '' }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantPictureChange = (index: number, newPicture: string | null) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, picture: newPicture || '' } : v))
    );
  };

  const handleVariantTextChange = (index: number, newText: string) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, text: newText } : v))
    );
  };

  // Validación previa
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

    // Validar variantes si tienen algún campo relleno
    variants.forEach((v, index) => {
      const hasText = !isRichTextEmpty(v.text);
      const hasPic = !!v.picture?.trim();
      if (hasPic && !hasText) {
        newErrors[`variantText_${index}`] = 'Indica un texto descriptivo para esta variante.';
      }
      if (hasText && !hasPic) {
        newErrors[`variantPicture_${index}`] = 'Indica una imagen para esta variante.';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setConfirmModalOpen(true);
    }
  };

  const handleConfirmSubmit = async () => {
    setConfirmModalOpen(false);

    // Filtrar solo variantes válidas (que tengan imagen y texto)
    const validVariants: CreateVariantInProductDTO[] = variants
      .filter((v) => v.picture.trim() !== '' && !isRichTextEmpty(v.text))
      .map((v) => ({
        picture: v.picture.trim(),
        text: v.text.trim(),
      }));

    const payload: CreateProductDTO = {
      title: title.trim(),
      picture: picture || '',
      logo: logo || picture || '',
      info_header: infoHeader.trim(),
      info_body: infoBody.trim() || null,
      isAlive,
      url: isAlive ? url.trim() : 'NoUrl',
      variants: validVariants,
    };

    const created = await createProduct(payload);
    if (created) {
      handleGoBack();
    }
  };

  return (
    <div className="container-fluid py-4 mb-5">
      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        title="Crear nuevo producto"
        message={`¿Estás seguro de que deseas crear el producto "${title}"?`}
        confirmText="Sí, crear producto"
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
          <span>←</span> Volver a Productos
        </button>
      </div>

      <div className="card shadow-sm border border-secondary-subtle bg-body p-4 p-md-5" style={{ borderRadius: '16px' }}>
        <div className="border-bottom border-secondary-subtle pb-3 mb-4">
          <h2 className="h4 fw-bold text-body-emphasis mb-1">Creación de Producto</h2>
          <p className="text-body-secondary small mb-0">
            Registra un nuevo producto o proyecto en el catálogo general del portfolio.
          </p>
        </div>

        {isLoading ? (
          <div className="py-5 d-flex justify-content-center align-items-center">
            <Loader fullScreen={false} scale={0.7} text="Guardando producto..." />
          </div>
        ) : (
          <form onSubmit={handleOpenConfirm} noValidate>
            {/* Sección: Imagen principal y Logo */}
            <div className="row g-4 mb-4">
              <div className="col-lg-6">
                <div className="card h-100 p-3 bg-body-tertiary border border-secondary-subtle rounded-3">
                  <h3 className="h6 fw-bold text-body-emphasis mb-3">Imagen Principal del Producto *</h3>
                  <SelectImages
                    id="product-picture-select"
                    titleField="Foto o captura de pantalla principal:"
                    value={picture}
                    onChange={(val) => {
                      setPicture(val);
                      if (errors.picture) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.picture;
                          return copy;
                        });
                      }
                    }}
                  />
                  {errors.picture && <div className="text-danger small mt-1">{errors.picture}</div>}
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card h-100 p-3 bg-body-tertiary border border-secondary-subtle rounded-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h3 className="h6 fw-bold text-body-emphasis mb-0">Logo del Producto (Opcional)</h3>
                    <span className="text-body-secondary small">Si no se especifica, se usará la imagen principal</span>
                  </div>
                  <SelectImages
                    id="product-logo-select"
                    titleField="Logo del proyecto o marca:"
                    value={logo}
                    onChange={(val) => setLogo(val)}
                  />
                </div>
              </div>
            </div>

            {/* Sección: Título e Información SEO */}
            <div className="mb-4">
              <label htmlFor="product-title" className="form-label fw-semibold text-body">
                Título del producto / proyecto <span className="text-danger">*</span>
              </label>
              <input
                id="product-title"
                type="text"
                className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                placeholder="Ej. Sistema de Comercio Electrónico"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.title;
                      return copy;
                    });
                  }
                }}
              />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label htmlFor="product-info-header" className="form-label fw-semibold text-body mb-0">
                  Información de cabecera / Posicionamiento (SEO) <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none p-0 text-primary small"
                  onClick={() => setShowHeaderInfo((prev) => !prev)}
                >
                  {showHeaderInfo ? 'Ocultar ayuda' : '¿Para qué sirve?'}
                </button>
              </div>

              {showHeaderInfo && (
                <div className="alert alert-info py-2 px-3 small border-0 mb-2">
                  💡 Texto sintético y destacado utilizado para metaetiquetas, cabecera del producto y vista previa en tarjetas de catálogo.
                </div>
              )}

              <textarea
                id="product-info-header"
                rows={3}
                className={`form-control ${errors.infoHeader ? 'is-invalid' : ''}`}
                placeholder="Breve frase o descripción de posicionamiento..."
                value={infoHeader}
                onChange={(e) => {
                  setInfoHeader(e.target.value);
                  if (errors.infoHeader) {
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.infoHeader;
                      return copy;
                    });
                  }
                }}
              />
              {errors.infoHeader && <div className="invalid-feedback">{errors.infoHeader}</div>}
            </div>

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

            {/* Sección: Switch isAlive y URL */}
            <div className="card p-3 mb-4 bg-body-tertiary border border-secondary-subtle rounded-3">
              <div className="form-check form-switch mb-2">
                <Form.Check
                  type="switch"
                  id="isAliveSwitch"
                  checked={isAlive}
                  label={
                    <span className="fw-semibold text-body">
                      ¿El proyecto está disponible online en producción (En vivo)?
                    </span>
                  }
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsAlive(checked);
                    if (!checked) {
                      setUrl('');
                      if (errors.url) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.url;
                          return copy;
                        });
                      }
                    }
                  }}
                />
              </div>

              {isAlive ? (
                <div className="mt-3">
                  <label htmlFor="product-url" className="form-label small fw-semibold text-body">
                    URL externa del proyecto en producción <span className="text-danger">*</span>
                  </label>
                  <input
                    id="product-url"
                    type="url"
                    className={`form-control ${errors.url ? 'is-invalid' : ''}`}
                    placeholder="https://mi-proyecto.com"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (errors.url) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.url;
                          return copy;
                        });
                      }
                    }}
                  />
                  {errors.url ? (
                    <div className="invalid-feedback">{errors.url}</div>
                  ) : (
                    <span className="text-body-secondary small d-block mt-1">
                      🔗 Los visitantes podrán acceder al proyecto en vivo a través de este enlace.
                    </span>
                  )}
                </div>
              ) : (
                <div className="alert alert-secondary py-2 px-3 small border-0 mb-0 mt-2 text-body-secondary">
                  📹 <strong>Proyecto sin despliegue online:</strong> Al no estar activo en la web, se vinculará a la galería de videos del portfolio usando el ID de este producto.
                </div>
              )}
            </div>

            {/* Sección: Variantes / Ítems */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h3 className="h5 fw-bold text-body-emphasis mb-0">Variantes / Ítems del Producto</h3>
                  <p className="text-body-secondary small mb-0">
                    Agrega capturas de pantalla, variantes visuales o ítems complementarios.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success rounded-pill px-3"
                  onClick={handleAddVariant}
                >
                  + Agregar Variante
                </button>
              </div>

              <div className="d-flex flex-column gap-3">
                {variants.map((v, index) => (
                  <div
                    key={index}
                    className="card border border-secondary-subtle bg-body p-3 shadow-sm rounded-3"
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary-subtle">
                      <span className="badge bg-secondary-subtle text-body border border-secondary-subtle">
                        Variante #{index + 1}
                      </span>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger text-decoration-none p-0"
                          onClick={() => handleRemoveVariant(index)}
                        >
                          Eliminar variante
                        </button>
                      )}
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <SelectImages
                          id={`variant-img-select-${index}`}
                          titleField="Imagen de la variante:"
                          value={v.picture}
                          onChange={(val) => handleVariantPictureChange(index, val)}
                        />
                        {errors[`variantPicture_${index}`] && (
                          <div className="text-danger small mt-1">{errors[`variantPicture_${index}`]}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label htmlFor={`variant-text-${index}`} className="form-label small fw-semibold text-body">
                          Texto descriptivo de la variante:
                        </label>
                        <RichTextEditor
                          id={`variant-text-${index}`}
                          value={v.text}
                          onChange={(newText) => {
                            handleVariantTextChange(index, newText);
                            if (errors[`variantText_${index}`] && !isRichTextEmpty(newText)) {
                              setErrors((prev) => {
                                const copy = { ...prev };
                                delete copy[`variantText_${index}`];
                                return copy;
                              });
                            }
                          }}
                          placeholder="Descripción breve de lo que representa esta variante o captura..."
                          isInvalid={!!errors[`variantText_${index}`]}
                        />
                        {errors[`variantText_${index}`] && (
                          <div className="text-danger small mt-1">{errors[`variantText_${index}`]}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de acción inferiores */}
            <DoubleButton
              typeLeft="button"
              onClickLeft={handleGoBack}
              textLeft="Cancelar"
              typeRight="submit"
              textRight="Crear Producto"
              disabledRight={isLoading}
            />

          </form>
        )}
      </div>
    </div>
  );
};

export default CreateProduct;
