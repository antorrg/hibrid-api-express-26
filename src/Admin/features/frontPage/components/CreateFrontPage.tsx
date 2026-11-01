import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Form } from 'react-bootstrap';
import { useFrontPageStore, isFrontPagePersisted } from '../frontPageStore';
import SelectImages from '../../images/SelectImages/SelectImages';
import ConfirmModal from '../../../../shared/modalComponents/ConfirmModal';
import Loader from '../../../../shared/components/Loader';
import DoubleButton from '../../../Utils/DoubleButton';
import type { CreateFrontPageDTO } from '../frontPageTypes';

const CreateFrontPage: React.FC = () => {
  const navigate = useNavigate();
  const { frontPage, isLoading, fetchFrontPage, createFrontPage } = useFrontPageStore();

  const [title, setTitle] = useState('');
  const [infoHeader, setInfoHeader] = useState('');
  const [picture, setPicture] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchFrontPage();
  }, [fetchFrontPage]);

  // Si ya existe una portada creada, no se permite crear otra (Singleton)
  useEffect(() => {
    if (isFrontPagePersisted(frontPage)) {
      navigate('/admin?tab=portada', { replace: true });
    }
  }, [frontPage, navigate]);

  const handleGoBack = () => {
    navigate('/admin?tab=portada');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'El título de la portada es obligatorio.';
    }

    if (!infoHeader.trim()) {
      newErrors.infoHeader = 'La cabecera o información de posicionamiento es obligatoria.';
    }

    if (!picture) {
      newErrors.picture = 'Debes seleccionar o subir una imagen para la portada.';
    }

    if (!description.trim()) {
      newErrors.description = 'La descripción de la portada es obligatoria.';
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
    setConfirmModalOpen(false);

    const payload: CreateFrontPageDTO = {
      title: title.trim(),
      info_header: infoHeader.trim(),
      picture: picture || '',
      description: description.trim(),
    };

    const success = await createFrontPage(payload);
    if (success) {
      navigate('/admin?tab=portada');
    }
  };

  return (
    <div className="container-fluid py-4 mb-5">
      {/* Modal de confirmación para guardar */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        title="Crear portada"
        message="¿Estás seguro de que deseas guardar la portada principal del sitio?"
        confirmText="Sí, guardar portada"
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
          <span>← Volver a Portada</span>
        </button>
      </div>

      <div className="card shadow-sm border border-secondary-subtle bg-body p-4 p-md-5" style={{ borderRadius: '16px' }}>
        <div className="border-bottom border-secondary-subtle pb-3 mb-4">
          <h2 className="h4 fw-bold text-body-emphasis mb-1">Crear Portada Principal</h2>
          <p className="text-body-secondary small mb-0">
            Define la imagen, título y presentación principal de la aplicación. Recuerda que solo existe una portada.
          </p>
        </div>

        <Form onSubmit={handleSubmit}>
          {/* Título */}
          <div className="mb-4">
            <label htmlFor="frontpage-title" className="form-label fw-semibold text-body">
              Título de la Portada <span className="text-danger">*</span>
            </label>
            <input
              id="frontpage-title"
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              placeholder="Ej: Bienvenido a Nuestro Catálogo Oficial"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          {/* Cabecera / Info Header */}
          <div className="mb-4">
            <label htmlFor="frontpage-info-header" className="form-label fw-semibold text-body">
              Cabecera / Posicionamiento <span className="text-danger">*</span>
            </label>
            <input
              id="frontpage-info-header"
              type="text"
              className={`form-control ${errors.infoHeader ? 'is-invalid' : ''}`}
              placeholder="Ej: Calidad, vanguardia y tecnología"
              value={infoHeader}
              onChange={(e) => setInfoHeader(e.target.value)}
              disabled={isLoading}
            />
            {errors.infoHeader && <div className="invalid-feedback">{errors.infoHeader}</div>}
          </div>

          {/* Selector de Imagen con SelectImages */}
          <div className="mb-4">
            <label className="form-label fw-semibold text-body d-block">
              Imagen de Portada <span className="text-danger">*</span>
            </label>
            <SelectImages
              id="frontpage-create-image"
              titleField="Imagen de Portada:"
              value={picture}
              onChange={(newPic) => setPicture(newPic)}
            />
            {errors.picture && <div className="text-danger small mt-1">{errors.picture}</div>}
          </div>

          {/* Descripción */}
          <div className="mb-4">
            <label htmlFor="frontpage-description" className="form-label fw-semibold text-body">
              Descripción General <span className="text-danger">*</span>
            </label>
            <Form.Control
              as="textarea"
              id="frontpage-description"
              rows={5}
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              placeholder="Escribe la descripción o bienvenida que se mostrará en la portada..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
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
            textRight={isLoading ? <Loader fullScreen={false} scale={0.4} text="" /> : 'Guardar Portada'}
            disabledRight={isLoading}
          />
        </Form>
      </div>
    </div>
  );
};

export default CreateFrontPage;
