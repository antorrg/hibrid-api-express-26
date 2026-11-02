import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Form } from 'react-bootstrap';
import { useAboutStore, isAboutPersisted } from '../aboutStore';
import SelectImages from '../../images/SelectImages/SelectImages';
import RichTextEditor, { isRichTextEmpty } from '../../../Utils/RichTextEditor';
import ConfirmModal from '../../../../shared/modalComponents/ConfirmModal';
import Loader from '../../../../shared/components/Loader';
import DoubleButton from '../../../Utils/DoubleButton';
import type { CreateAboutDTO } from '../aboutTypes';

const CreateAbout: React.FC = () => {
  const navigate = useNavigate();
  const { about, isLoading, fetchAbout, createAbout } = useAboutStore();

  const [title, setTitle] = useState('');
  const [imgShow, setImgShow] = useState(true);
  const [picture, setPicture] = useState<string | null>(null);
  const [text, setText] = useState('');

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAbout();
  }, [fetchAbout]);

  // Si ya existe una sección Acerca de persistida, redirigir a la pestaña principal (Singleton)
  useEffect(() => {
    if (isAboutPersisted(about)) {
      navigate('/admin?tab=about', { replace: true });
    }
  }, [about, navigate]);

  const handleGoBack = () => {
    navigate('/admin?tab=about');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'El título de la sección es obligatorio.';
    }

    if (isRichTextEmpty(text)) {
      newErrors.text = 'El texto principal es obligatorio.';
    }

    if (imgShow && !picture) {
      newErrors.picture = 'Debes seleccionar o subir una imagen para el modo con imagen (o desmarca el modo si deseas solo texto).';
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

    const payload: CreateAboutDTO = {
      title: title.trim(),
      text: text.trim(),
      picture: picture || '',
      imgShow,
    };

    const success = await createAbout(payload);
    if (success) {
      navigate('/admin?tab=about');
    }
  };

  return (
    <div className="container-fluid py-4 mb-5">
      {/* Modal de confirmación para guardar */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        title="Crear sección Acerca de"
        message="¿Estás seguro de que deseas guardar la sección Acerca de?"
        confirmText="Sí, guardar sección"
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
          <span>← Volver a Acerca de</span>
        </button>
      </div>

      <div className="card shadow-sm border border-secondary-subtle bg-body p-4 p-md-5" style={{ borderRadius: '16px' }}>
        <div className="border-bottom border-secondary-subtle pb-3 mb-4">
          <h2 className="h4 fw-bold text-body-emphasis mb-1">Crear Sección Acerca de</h2>
          <p className="text-body-secondary small mb-0">
            Define la presentación institucional o sobre la empresa que se mostrará en la vista pública.
          </p>
        </div>

        <Form onSubmit={handleSubmit}>
          {/* Título */}
          <div className="mb-4">
            <label htmlFor="about-title" className="form-label fw-semibold text-body">
              Título <span className="text-danger">*</span>
            </label>
            <input
              id="about-title"
              type="text"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              placeholder="Ej: Acerca de Nuestra Empresa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>

          {/* Switch Modo Con Imagen / Sólo Texto */}
          <div className="card p-3 mb-4 bg-body-tertiary border border-secondary-subtle rounded-3">
            <Form.Check
              type="switch"
              id="about-imgshow-switch"
              checked={imgShow}
              onChange={(e) => setImgShow(e.target.checked)}
              label={
                <div>
                  <span className="fw-semibold text-body d-block">
                    {imgShow ? 'Modo: Con Imagen' : 'Modo: Sólo Texto'}
                  </span>
                  <span className="text-body-secondary small">
                    {imgShow
                      ? 'La vista pública mostrará una imagen destacada junto con el texto institucional.'
                      : 'La vista pública presentará únicamente el contenido de texto sin imagen destacada.'}
                  </span>
                </div>
              }
            />
          </div>

          {/* Selector de Imagen con SelectImages */}
          {imgShow && (
            <div className="mb-4">
              <label className="form-label fw-semibold text-body d-block">
                Imagen Destacada <span className="text-danger">*</span>
              </label>
              <SelectImages
                id="about-create-image"
                titleField="Imagen Acerca de:"
                value={picture}
                onChange={(newPic) => setPicture(newPic)}
              />
              {errors.picture && <div className="text-danger small mt-1">{errors.picture}</div>}
            </div>
          )}

          {/* Texto Principal (RichTextEditor) */}
          <div className="mb-4">
            <label htmlFor="about-text-editor" className="form-label fw-semibold text-body">
              Texto Principal <span className="text-danger">*</span>
            </label>
            <RichTextEditor
              id="about-text-editor"
              value={text}
              onChange={(val) => setText(val)}
              isInvalid={Boolean(errors.text)}
              placeholder="Redacta la historia, misión, valores o presentación institucional..."
            />
            {errors.text && <div className="text-danger small mt-1">{errors.text}</div>}
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
            textRight={isLoading ? <Loader fullScreen={false} scale={0.4} text="" /> : 'Guardar Sección'}
            disabledRight={isLoading}
          />
        </Form>
      </div>
    </div>
  );
};

export default CreateAbout;
