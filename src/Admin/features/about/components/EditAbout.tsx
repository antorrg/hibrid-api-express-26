import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Form } from 'react-bootstrap';
import { useAboutStore, isAboutPersisted } from '../aboutStore';
import SelectImages from '../../images/SelectImages/SelectImages';
import RichTextEditor, { isRichTextEmpty } from '../../../Utils/RichTextEditor';
import ConfirmModal from '../../../../shared/modalComponents/ConfirmModal';
import Loader from '../../../../shared/components/Loader';
import DoubleButton from '../../../Utils/DoubleButton';
import type { UpdateAboutDTO } from '../aboutTypes';

const EditAbout: React.FC = () => {
  const navigate = useNavigate();
  const { about, isLoading, fetchAbout, updateAbout } = useAboutStore();

  const [title, setTitle] = useState('');
  const [imgShow, setImgShow] = useState(true);
  const [picture, setPicture] = useState<string | null>(null);
  const [initialPicture, setInitialPicture] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [saver, setSaver] = useState(false);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasLoadedData, setHasLoadedData] = useState(false);

  useEffect(() => {
    fetchAbout();
  }, [fetchAbout]);

  // Poblado de datos iniciales
  useEffect(() => {
    if (about && isAboutPersisted(about)) {
      setTitle(about.title || '');
      setImgShow(about.imgShow ?? true);
      setPicture(about.picture || null);
      setInitialPicture(about.picture || null);
      setText(about.text || '');
      setEnabled(about.enabled ?? true);
      setSaver(false);
      setHasLoadedData(true);
    }
  }, [about]);

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
    if (!about?.id) return;
    setConfirmModalOpen(false);

    const payload: UpdateAboutDTO = {
      title: title.trim(),
      text: text.trim(),
      picture: picture || '',
      imgShow,
      enabled,
      saver,
    };

    const updated = await updateAbout(about.id, payload);
    if (updated) {
      navigate('/admin?tab=about');
    }
  };

  if (isLoading && !hasLoadedData) {
    return (
      <div className="container-fluid py-5 d-flex justify-content-center align-items-center">
        <Loader fullScreen={false} scale={0.7} text="Cargando sección Acerca de a editar..." />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 mb-5">
      {/* Modal de confirmación para guardar cambios */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        title="Actualizar sección Acerca de"
        message="¿Estás seguro de que deseas guardar los cambios en la sección Acerca de?"
        confirmText="Sí, actualizar sección"
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
          <h2 className="h4 fw-bold text-body-emphasis mb-1">Editar Sección Acerca de</h2>
          <p className="text-body-secondary small mb-0">
            Actualiza los datos visuales, textos y visibilidad de la sección institucional.
          </p>
        </div>

        <Form onSubmit={handleSubmit}>
          {/* Título */}
          <div className="mb-4">
            <label htmlFor="about-edit-title" className="form-label fw-semibold text-body">
              Título <span className="text-danger">*</span>
            </label>
            <input
              id="about-edit-title"
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
              id="about-edit-imgshow-switch"
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
                id="about-edit-image"
                titleField="Imagen Acerca de:"
                value={picture}
                onChange={(newPic) => setPicture(newPic)}
              />
              {errors.picture && <div className="text-danger small mt-1">{errors.picture}</div>}
            </div>
          )}

          {/* Saver Switch si se cambió la imagen respecto a la original */}
          {imgShow && picture && initialPicture && picture !== initialPicture && (
            <div className="card p-3 mb-4 bg-body-tertiary border border-secondary-subtle rounded-3">
              <Form.Check
                type="switch"
                id="aboutSaverSwitch"
                checked={saver}
                onChange={(e) => setSaver(e.target.checked)}
                label={
                  <div>
                    <span className="fw-semibold text-body d-block">Conservar imagen anterior en la galería</span>
                    <span className="text-body-secondary small">
                      Si está desmarcado, la imagen anterior será descartada si no es utilizada en otro registro.
                    </span>
                  </div>
                }
              />
            </div>
          )}

          {/* Switch de Estado Enabled */}
          <div className="card p-3 mb-4 bg-body-tertiary border border-secondary-subtle rounded-3">
            <Form.Check
              type="switch"
              id="aboutEnabledSwitch"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              label={
                <div>
                  <span className="fw-semibold text-body d-block">Sección Habilitada</span>
                  <span className="text-body-secondary small">
                    {enabled
                      ? 'La sección Acerca de está visible en la vista pública de la aplicación.'
                      : 'La sección se encuentra oculta temporalmente.'}
                  </span>
                </div>
              }
            />
          </div>

          {/* Texto Principal (RichTextEditor) */}
          <div className="mb-4">
            <label htmlFor="about-edit-text-editor" className="form-label fw-semibold text-body">
              Texto Principal <span className="text-danger">*</span>
            </label>
            <RichTextEditor
              id="about-edit-text-editor"
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
            textRight={isLoading ? <Loader fullScreen={false} scale={0.4} text="" /> : 'Guardar Cambios'}
            disabledRight={isLoading}
          />
        </Form>
      </div>
    </div>
  );
};

export default EditAbout;
