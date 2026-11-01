import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Form } from 'react-bootstrap';
import { useProductStore } from '../productStore';
import SelectImages from '../../images/SelectImages/SelectImages';
import ConfirmModal from '../../../../shared/modalComponents/ConfirmModal';
import Loader from '../../../../shared/components/Loader';
import DoubleButton from '../../../Utils/DoubleButton';
import { RichTextEditor, isRichTextEmpty } from '../../../Utils/RichTextEditor';
import type { UpdateVariantDTO } from '../productTypes';

const EditVariant: React.FC = () => {
  const { productId, variantId } = useParams<{ productId: string; variantId: string }>();
  const navigate = useNavigate();
  const { selectedVariant, isLoading, fetchVariantById, updateVariant } = useProductStore();

  // Estados del formulario
  const [picture, setPicture] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [saver, setSaver] = useState(false);

  // Modal y errores
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Carga inicial de la variante
  useEffect(() => {
    if (variantId) {
      fetchVariantById(variantId);
    }
  }, [variantId, fetchVariantById]);

  // Poblado de datos en el formulario
  useEffect(() => {
    if (selectedVariant && selectedVariant.id === variantId) {
      setPicture(selectedVariant.picture || null);
      setText(selectedVariant.text || '');
      setEnabled(selectedVariant.enabled ?? true);
      setSaver(false);
      setHasLoadedData(true);
    }
  }, [selectedVariant, variantId]);

  const handleGoBack = () => {
    if (productId && variantId) {
      navigate(`/admin/product/${productId}/variant/${variantId}`);
    } else if (productId) {
      navigate(`/admin/product/${productId}`);
    } else {
      navigate('/admin?tab=producto');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!picture) {
      newErrors.picture = 'Debes seleccionar o cargar una imagen para esta vista o variante.';
    }

    if (isRichTextEmpty(text)) {
      newErrors.text = 'El texto descriptivo es obligatorio.';
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
    if (!variantId || !productId) return;
    setConfirmModalOpen(false);

    const payload: UpdateVariantDTO = {
      picture: picture || '',
      text: text.trim(),
      enabled,
      saver,
    };

    const updated = await updateVariant(variantId, productId, payload);
    if (updated) {
      navigate(`/admin/product/${productId}/variant/${variantId}`);
    }
  };

  if (isLoading && !hasLoadedData) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center">
        <Loader fullScreen={false} scale={0.7} text="Cargando detalle de la variante..." />
      </div>
    );
  }

  if (!selectedVariant && !isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="card p-5 border border-secondary-subtle bg-body shadow-sm">
          <h2 className="h4 text-body-emphasis mb-3">Variante no encontrada</h2>
          <p className="text-body-secondary mb-4">La variante que intentas editar no existe o fue eliminada.</p>
          <div>
            <button type="button" onClick={handleGoBack} className="btn btn-primary rounded-pill px-4">
              Volver
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
        title="Actualizar variante"
        message="¿Estás seguro de que deseas guardar los cambios de esta vista o variante?"
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
          <span>←</span> Volver a la Variante
        </button>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-7">
          <div className="card shadow-sm border border-secondary-subtle bg-body p-4 p-md-5" style={{ borderRadius: '16px' }}>
            <div className="border-bottom border-secondary-subtle pb-3 mb-4">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle mb-2">
                Modo Edición
              </span>
              <h2 className="h4 fw-bold text-body-emphasis mb-1">Editar Vista / Variante</h2>
              <p className="text-body-secondary small mb-0">
                Actualiza la imagen, texto explicativo o visibilidad de esta muestra del proyecto.
              </p>
            </div>

            {isLoading ? (
              <div className="py-5 text-center">
                <Loader fullScreen={false} scale={0.6} text="Guardando cambios..." />
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* Selector de Imagen */}
                <div className="card p-3 mb-4 bg-body-tertiary border border-secondary-subtle rounded-3">
                  <h3 className="h6 fw-bold text-body mb-2">
                    Imagen de la Variante / Vista <span className="text-danger">*</span>
                  </h3>
                  <SelectImages
                    id="variant-picture-select"
                    titleField="Imagen de la variante:"
                    value={picture}
                    onChange={(newVal) => setPicture(newVal)}
                  />
                  {errors.picture && <div className="text-danger small mt-1">{errors.picture}</div>}
                </div>

                {/* Texto descriptivo */}
                <div className="mb-4">
                  <label htmlFor="variant-text" className="form-label fw-semibold text-body">
                    Texto descriptivo / Explicación <span className="text-danger">*</span>
                  </label>
                  <RichTextEditor
                    id="variant-text"
                    value={text}
                    onChange={(newVal) => {
                      setText(newVal);
                      if (errors.text && !isRichTextEmpty(newVal)) {
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.text;
                          return copy;
                        });
                      }
                    }}
                    placeholder="Descripción de lo que muestra esta captura o variante del producto..."
                    isInvalid={!!errors.text}
                  />
                  {errors.text && <div className="text-danger small mt-1">{errors.text}</div>}
                </div>

                {/* Switches de Estado y Saver */}
                <div className="card p-3 mb-4 bg-body-tertiary border border-secondary-subtle rounded-3">
                  <h3 className="h6 fw-bold text-body mb-3">Opciones de Publicación y Almacenamiento</h3>
                  <div className="d-flex flex-column gap-3">
                    <div className="form-check form-switch">
                      <Form.Check
                        type="switch"
                        id="variantEnabledSwitch"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                        label={<span className="text-body fw-medium">Variante activa (Visible en la galería pública)</span>}
                      />
                    </div>

                    <div className="form-check form-switch">
                      <Form.Check
                        type="switch"
                        id="variantSaverSwitch"
                        checked={saver}
                        onChange={(e) => setSaver(e.target.checked)}
                        label={<span className="text-body fw-medium">Preservar imagen anterior en el servidor (Saver)</span>}
                      />
                      <div className="text-body-secondary small mt-1">
                        Si reemplazas la imagen y activas esta casilla, el archivo anterior no será eliminado del storage.
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
      </div>
    </div>
  );
};

export default EditVariant;
