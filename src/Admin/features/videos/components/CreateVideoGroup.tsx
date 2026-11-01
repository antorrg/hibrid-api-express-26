import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Form, Button } from 'react-bootstrap';
import { useVideosStore } from '../videosStore';
import { productApi } from '../../product/productApi';
import type { IProduct } from '../../product/productTypes';
import ConfirmModal from '../../../../shared/modalComponents/ConfirmModal';
import Loader from '../../../../shared/components/Loader';
import DoubleButton from '../../../Utils/DoubleButton';
import { extractYouTubeId, getYouTubeThumbnail } from '../videoUtils';
import type { CreateVideoDTO, CreateVideoGroupDTO } from '../videosTypes';

interface DraftVideo {
  name: string;
  youTubeInput: string;
}

const CreateVideoGroup: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { createGroup, isLoading } = useVideosStore();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  // Campos del grupo
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Lista de videos inicial (mínimo 1 obligatorio)
  const [videos, setVideos] = useState<DraftVideo[]>([
    { name: '', youTubeInput: '' },
  ]);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!productId) {
      navigate('/admin?tab=producto', { replace: true });
      return;
    }

    let isMounted = true;
    productApi
      .getById(productId)
      .then((p) => {
        if (isMounted) {
          setProduct(p);
          // Sugerir un título inicial con el nombre del producto
          if (p?.title) {
            setTitle(`Videos de ${p.title}`);
          }
        }
      })
      .catch(() => {
        // Si no se encuentra el producto, aún podemos mostrar la pantalla con el ID
      })
      .finally(() => {
        if (isMounted) setLoadingProduct(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, navigate]);

  const handleGoBack = () => {
    navigate('/admin?tab=producto');
  };

  const handleAddVideo = () => {
    setVideos((prev) => [...prev, { name: '', youTubeInput: '' }]);
  };

  const handleRemoveVideo = (index: number) => {
    if (videos.length <= 1) return; // Mínimo 1 video requerido
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (index: number, field: keyof DraftVideo, val: string) => {
    setVideos((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: val } : v))
    );
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = 'El título del grupo de videos es obligatorio.';
    }

    if (!description.trim()) {
      errs.description = 'La descripción del grupo es obligatoria.';
    }

    if (!videos || videos.length === 0) {
      errs.videos = 'Debes añadir al menos un video al grupo.';
    } else {
      videos.forEach((v, idx) => {
        if (!v.name.trim()) {
          errs[`videoName_${idx}`] = 'El título del video es obligatorio.';
        }
        if (!v.youTubeInput.trim()) {
          errs[`videoYoutube_${idx}`] = 'Ingresa el ID o enlace de YouTube.';
        } else if (!extractYouTubeId(v.youTubeInput)) {
          errs[`videoYoutube_${idx}`] = 'ID o enlace de YouTube inválido.';
        }
      });
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setConfirmModalOpen(true);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!productId) return;
    setConfirmModalOpen(false);

    const formattedVideos: CreateVideoDTO[] = videos.map((v) => ({
      name: v.name.trim(),
      youTubeId: extractYouTubeId(v.youTubeInput),
    }));

    const payload: CreateVideoGroupDTO = {
      title: title.trim(),
      description: description.trim(),
      productId,
      videos: formattedVideos,
    };

    const created = await createGroup(payload);
    if (created) {
      navigate('/admin?tab=videos');
    }
  };

  if (loadingProduct) {
    return (
      <div className="container-fluid py-5 d-flex justify-content-center align-items-center">
        <Loader fullScreen={false} scale={0.7} text="Cargando información del producto..." />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 mb-5">
      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        title="Crear grupo de videos"
        message={`¿Deseas crear este grupo con ${videos.length} video(s) para el producto "${product?.title || productId}"?`}
        confirmText="Sí, crear grupo"
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
          className="btn btn-outline-secondary rounded-pill px-3 py-1 btn-sm d-flex align-items-center gap-1"
        >
          <span>← Volver a Productos</span>
        </button>
      </div>

      <div className="card shadow-sm border border-secondary-subtle bg-body p-4 p-md-5" style={{ borderRadius: '16px' }}>
        {/* Encabezado contextual con producto asociado */}
        <div className="border-bottom border-secondary-subtle pb-3 mb-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
              Vinculado a Producto
            </span>
            <span className="text-body-secondary small font-monospace">{productId}</span>
          </div>
          <h2 className="h4 fw-bold text-body-emphasis mb-1">
            Crear Grupo de Videos {product?.title ? `para "${product.title}"` : ''}
          </h2>
          <p className="text-body-secondary small mb-0">
            Cada grupo debe contar con un título, una descripción y al menos un video inicial de YouTube.
          </p>
        </div>

        <Form onSubmit={handleSubmit}>
          {/* Título del Grupo */}
          <div className="mb-4">
            <label htmlFor="videogroup-title" className="form-label fw-semibold text-body">
              Título del Grupo <span className="text-danger">*</span>
            </label>
            <input
              id="videogroup-title"
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              placeholder="Ej: Demostración técnica y funcionalidades en acción"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          {/* Descripción del Grupo */}
          <div className="mb-4">
            <label htmlFor="videogroup-description" className="form-label fw-semibold text-body">
              Descripción del Grupo <span className="text-danger">*</span>
            </label>
            <Form.Control
              as="textarea"
              id="videogroup-description"
              rows={3}
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              placeholder="Breve explicación del contenido de estos videos o su objetivo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>

          {/* Sección de Videos Iniciales (mínimo 1 obligatorio) */}
          <div className="mb-4 p-3 bg-body-tertiary rounded-3 border border-secondary-subtle">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="h6 fw-bold text-body-emphasis mb-0">Videos del Grupo (Mínimo 1 obligatorio)</h3>
                <span className="text-body-secondary small">
                  Ingresa el nombre y el ID o enlace de YouTube de cada video.
                </span>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleAddVideo}
                className="rounded-pill fw-semibold"
                disabled={isLoading}
              >
                + Añadir otro video
              </Button>
            </div>

            {errors.videos && <div className="text-danger small mb-2">{errors.videos}</div>}

            <div className="d-flex flex-column gap-3">
              {videos.map((v, index) => {
                const cleanId = extractYouTubeId(v.youTubeInput);
                const thumbnail = cleanId ? getYouTubeThumbnail(cleanId) : '';

                return (
                  <div
                    key={index}
                    className="card p-3 bg-body border border-secondary-subtle shadow-sm rounded-3"
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
                        Video #{index + 1}
                      </span>
                      {videos.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill px-2 py-0"
                          onClick={() => handleRemoveVideo(index)}
                          title="Quitar este video"
                        >
                          ✕ Quitar
                        </button>
                      )}
                    </div>

                    <div className="row g-3 align-items-start">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-body">
                          Título / Nombre del Video <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control form-control-sm ${
                            errors[`videoName_${index}`] ? 'is-invalid' : ''
                          }`}
                          placeholder="Ej: Tour de la interfaz"
                          value={v.name}
                          onChange={(e) => handleVideoChange(index, 'name', e.target.value)}
                          disabled={isLoading}
                        />
                        {errors[`videoName_${index}`] && (
                          <div className="invalid-feedback">{errors[`videoName_${index}`]}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold text-body">
                          ID o Enlace de YouTube <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control form-control-sm ${
                            errors[`videoYoutube_${index}`] ? 'is-invalid' : ''
                          }`}
                          placeholder="Ej: dQw4w9WgXcQ o https://youtu.be/..."
                          value={v.youTubeInput}
                          onChange={(e) => handleVideoChange(index, 'youTubeInput', e.target.value)}
                          disabled={isLoading}
                        />
                        {errors[`videoYoutube_${index}`] && (
                          <div className="invalid-feedback">{errors[`videoYoutube_${index}`]}</div>
                        )}
                      </div>
                    </div>

                    {/* Previsualización del video si el ID es detectado */}
                    {cleanId && (
                      <div className="d-flex align-items-center gap-3 mt-3 pt-2 border-top border-secondary-subtle">
                        <img
                          src={thumbnail}
                          alt="Thumbnail preview"
                          className="rounded"
                          style={{ width: '80px', height: '45px', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="small">
                          <span className="text-body-secondary">ID YouTube: </span>
                          <strong className="text-body font-monospace">{cleanId}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botones de acción */}
          <DoubleButton
            onClickLeft={handleGoBack}
            textLeft="Cancelar"
            onClickRight={() => {
              if (validateForm()) {
                setConfirmModalOpen(true);
              }
            }}
            textRight={isLoading ? <Loader fullScreen={false} scale={0.4} text="" /> : 'Guardar Grupo de Videos'}
            disabledRight={isLoading}
          />
        </Form>
      </div>
    </div>
  );
};

export default CreateVideoGroup;
