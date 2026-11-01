import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Form, Button } from 'react-bootstrap';
import { useVideosStore } from '../videosStore';
import ConfirmModal from '../../../../shared/modalComponents/ConfirmModal';
import Loader from '../../../../shared/components/Loader';
import VideoModal from './VideoModal';
import { getYouTubeThumbnail } from '../videoUtils';
import type { IVideo, UpdateVideoGroupDTO } from '../videosTypes';

const VideoGroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedGroup,
    isLoading,
    fetchGroupById,
    updateGroup,
    deleteGroup,
    createVideo,
    updateVideo,
    deleteVideo,
  } = useVideosStore();

  // Estados del grupo
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);

  // Modales
  const [confirmDeleteGroupOpen, setConfirmDeleteGroupOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<IVideo | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<IVideo | null>(null);
  const [isSavingVideo, setIsSavingVideo] = useState(false);

  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGroupById(id).then((g) => {
        if (g) {
          setTitle(g.title || '');
          setDescription(g.description || '');
          setEnabled(g.enabled ?? true);
        }
        setHasLoaded(true);
      });
    }
  }, [id, fetchGroupById]);

  const handleGoBack = () => {
    navigate('/admin?tab=videos');
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !title.trim() || !description.trim()) return;

    const payload: UpdateVideoGroupDTO = {
      title: title.trim(),
      description: description.trim(),
      enabled,
    };

    await updateGroup(id, payload);
  };

  const handleConfirmDeleteGroup = async () => {
    if (!id) return;
    setConfirmDeleteGroupOpen(false);
    const success = await deleteGroup(id);
    if (success) {
      navigate('/admin?tab=videos');
    }
  };

  const handleOpenAddVideo = () => {
    setEditingVideo(null);
    setVideoModalOpen(true);
  };

  const handleOpenEditVideo = (video: IVideo) => {
    setEditingVideo(video);
    setVideoModalOpen(true);
  };

  const handleSaveVideoModal = async (data: { name: string; youTubeId: string }) => {
    if (!id) return;
    setIsSavingVideo(true);
    try {
      if (editingVideo) {
        await updateVideo(editingVideo.id, {
          name: data.name,
          youTubeId: data.youTubeId,
        });
      } else {
        await createVideo({
          videoGroupId: id,
          name: data.name,
          youTubeId: data.youTubeId,
        });
      }
    } finally {
      setIsSavingVideo(false);
    }
  };

  const handleConfirmDeleteVideo = async () => {
    if (!videoToDelete) return;
    const vidId = videoToDelete.id;
    setVideoToDelete(null);
    await deleteVideo(vidId);
  };

  if (isLoading && !hasLoaded) {
    return (
      <div className="container-fluid py-5 d-flex justify-content-center align-items-center">
        <Loader fullScreen={false} scale={0.7} text="Cargando grupo de videos..." />
      </div>
    );
  }

  if (!selectedGroup && hasLoaded) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="card p-5 border border-secondary-subtle bg-body shadow-sm rounded-4">
          <h2 className="h4 text-body-emphasis mb-3">Grupo de videos no encontrado</h2>
          <p className="text-body-secondary mb-4">El grupo que intentas consultar no existe o fue eliminado.</p>
          <div>
            <button type="button" onClick={handleGoBack} className="btn btn-primary rounded-pill px-4">
              Volver a Videos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const videosList = selectedGroup?.videos || [];

  return (
    <div className="container-fluid py-4 mb-5">
      {/* Modal de confirmación para eliminar grupo */}
      <ConfirmModal
        isOpen={confirmDeleteGroupOpen}
        title="Eliminar grupo de videos"
        message={`¿Estás seguro de que deseas eliminar permanentemente el grupo "${selectedGroup?.title}" y todos sus videos?`}
        confirmText="Sí, eliminar grupo"
        cancelText="Cancelar"
        confirmVariant="btn-danger"
        onConfirm={handleConfirmDeleteGroup}
        onCancel={() => setConfirmDeleteGroupOpen(false)}
      />

      {/* Modal de confirmación para eliminar video individual */}
      <ConfirmModal
        isOpen={videoToDelete !== null}
        title="Eliminar video"
        message={`¿Estás seguro de que deseas eliminar el video "${videoToDelete?.name}"?`}
        confirmText="Sí, eliminar video"
        cancelText="Cancelar"
        confirmVariant="btn-danger"
        onConfirm={handleConfirmDeleteVideo}
        onCancel={() => setVideoToDelete(null)}
      />

      {/* Modal para añadir o editar video */}
      <VideoModal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        onSave={handleSaveVideoModal}
        initialData={
          editingVideo
            ? { name: editingVideo.name, youTubeId: editingVideo.youTubeId }
            : null
        }
        title={editingVideo ? 'Editar Video' : 'Añadir Video al Grupo'}
        isSaving={isSavingVideo}
      />

      {/* Navegación superior y acción de eliminación */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          type="button"
          onClick={handleGoBack}
          className="btn btn-outline-secondary rounded-pill px-3 py-1 btn-sm d-flex align-items-center gap-1"
        >
          <span>← Volver a Videos</span>
        </button>
        <button
          type="button"
          onClick={() => setConfirmDeleteGroupOpen(true)}
          className="btn btn-outline-danger rounded-pill px-3 py-1 btn-sm fw-medium"
        >
          🗑️ Eliminar Grupo
        </button>
      </div>

      <div className="row g-4">
        {/* Columna Izquierda: Edición del Grupo */}
        <div className="col-lg-5">
          <div className="card shadow-sm border border-secondary-subtle bg-body p-4 rounded-4">
            <div className="border-bottom border-secondary-subtle pb-3 mb-4">
              <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle mb-2">
                Grupo ID: {selectedGroup?.id}
              </span>
              <h2 className="h4 fw-bold text-body-emphasis mb-1">Datos del Grupo</h2>
              <p className="text-body-secondary small mb-0">
                Vinculado al producto: <strong className="font-monospace">{selectedGroup?.productId}</strong>
              </p>
            </div>

            <Form onSubmit={handleSaveGroup}>
              <div className="mb-3">
                <Form.Label htmlFor="edit-group-title" className="fw-semibold text-body small">
                  Título del Grupo <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  id="edit-group-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="mb-3">
                <Form.Label htmlFor="edit-group-desc" className="fw-semibold text-body small">
                  Descripción del Grupo <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  id="edit-group-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="card p-3 mb-4 bg-body-tertiary border border-secondary-subtle rounded-3">
                <Form.Check
                  type="switch"
                  id="edit-group-enabled"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  label={
                    <div>
                      <span className="fw-semibold text-body d-block small">Grupo Habilitado</span>
                      <span className="text-body-secondary small">
                        {enabled ? 'Visible en vistas públicas.' : 'Oculto al público.'}
                      </span>
                    </div>
                  }
                />
              </div>

              <div className="d-flex justify-content-end">
                <Button variant="primary" type="submit" disabled={isLoading} className="rounded-pill px-4 fw-semibold">
                  Guardar Cambios del Grupo
                </Button>
              </div>
            </Form>
          </div>
        </div>

        {/* Columna Derecha: Videos del Grupo */}
        <div className="col-lg-7">
          <div className="card shadow-sm border border-secondary-subtle bg-body p-4 rounded-4">
            <div className="d-flex justify-content-between align-items-center border-bottom border-secondary-subtle pb-3 mb-4">
              <div>
                <h2 className="h4 fw-bold text-body-emphasis mb-1">
                  Videos en este Grupo ({videosList.length})
                </h2>
                <p className="text-body-secondary small mb-0">
                  Agrega, edita o elimina videos individuales pertenecientes a este grupo.
                </p>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleOpenAddVideo}
                className="rounded-pill px-3 fw-semibold"
              >
                + Agregar video
              </Button>
            </div>

            {videosList.length === 0 ? (
              <div className="p-4 text-center bg-body-tertiary rounded-3 border border-secondary-subtle">
                <p className="text-body-secondary mb-3">No hay videos en este grupo.</p>
                <Button variant="primary" size="sm" onClick={handleOpenAddVideo} className="rounded-pill px-3">
                  Añadir el primer video
                </Button>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {videosList.map((video) => {
                  const thumbnail = getYouTubeThumbnail(video.youTubeId);

                  return (
                    <div
                      key={video.id}
                      className="card border border-secondary-subtle bg-body p-3 shadow-sm rounded-3"
                    >
                      <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-center">
                        {/* Miniatura */}
                        <div
                          className="bg-dark rounded overflow-hidden flex-shrink-0"
                          style={{ width: '120px', height: '68px' }}
                        >
                          <img
                            src={thumbnail}
                            alt={video.name}
                            className="w-100 h-100"
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>

                        {/* Información */}
                        <div className="flex-grow-1">
                          <h4 className="h6 fw-bold text-body-emphasis mb-1">{video.name}</h4>
                          <div className="d-flex flex-wrap align-items-center gap-2 small text-body-secondary">
                            <span>ID: <code className="text-body">{video.youTubeId}</code></span>
                            <a
                              href={`https://www.youtube.com/watch?v=${video.youTubeId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary text-decoration-none"
                            >
                              ↗ Ver en YouTube
                            </a>
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="d-flex align-items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditVideo(video)}
                            className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-1"
                            title="Editar video"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => setVideoToDelete(video)}
                            className="btn btn-sm btn-outline-danger rounded-pill px-2 py-1"
                            title="Eliminar video"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGroupDetail;
