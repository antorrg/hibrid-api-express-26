import { useState, useEffect, useCallback } from 'react';
import { Card, Badge, Button, Form, Row, Col } from 'react-bootstrap';
import { useLetterStore } from './letterStore';
import { TEMAS_DISPONIBLES, type ILetter } from './letterTypes';
import { LetterDetailModal } from './LetterDetailModal';
import Loader from '../../../shared/components/Loader';
import ConfirmModal from '../../../shared/modalComponents/ConfirmModal';

export const LetterView = () => {
  const {
    letters,
    pageInfo,
    isLoading,
    fetchLetters,
    moderateLetter,
    deleteLetter,
  } = useLetterStore();

  const [page, setPage] = useState(1);
  const [aprobadaFilter, setAprobadaFilter] = useState(false); // false = Pendientes por defecto
  const [selectedTema, setSelectedTema] = useState('');

  // Modals state
  const [letterDetail, setLetterDetail] = useState<ILetter | null>(null);
  const [letterToModerate, setLetterToModerate] = useState<{
    id: string;
    newStatus: boolean;
    tema: string;
  } | null>(null);
  const [letterToDelete, setLetterToDelete] = useState<string | null>(null);

  const loadData = useCallback(() => {
    fetchLetters(page, 9, aprobadaFilter, selectedTema);
  }, [page, aprobadaFilter, selectedTema, fetchLetters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (statusBool: boolean) => {
    setAprobadaFilter(statusBool);
    setPage(1);
  };

  const handleTemaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTema(e.target.value);
    setPage(1);
  };

  const handleOpenModerate = (letter: ILetter) => {
    setLetterToModerate({
      id: letter.id,
      newStatus: !letter.aprobada,
      tema: letter.tema || 'General',
    });
  };

  const handleConfirmModerate = async () => {
    if (!letterToModerate) return;
    const { id, newStatus } = letterToModerate;
    setLetterToModerate(null);
    await moderateLetter(id, newStatus);
    loadData();
  };

  const handleOpenDelete = (id: string) => {
    setLetterToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!letterToDelete) return;
    const id = letterToDelete;
    setLetterToDelete(null);
    await deleteLetter(id);
    loadData();
  };

  const totalPages = pageInfo?.totalPages || 1;

  return (
    <section className="container py-2 mb-3">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <div>
          <h3 className="fw-normal mb-1">Gestión de Cartas</h3>
          <p className="text-body-secondary small mb-0">
            Administración y moderación de cartas enviadas por los usuarios.
          </p>
        </div>

        <Button
          variant="outline-primary"
          size="sm"
          className="align-self-end align-self-md-center d-flex align-items-center gap-1"
          onClick={loadData}
          disabled={isLoading}
        >
          <span>🔄</span> Actualizar
        </Button>
      </div>

      {/* Barra de Filtros */}
      <Card className="border-0 shadow-sm backgroundElements mb-4 p-3 rounded-3">
        <Row className="g-3 align-items-center">
          {/* Filtro por Estado (Pendientes / Aprobadas) */}
          <Col xs={12} md={6} className="d-flex align-items-center gap-2">
            <span className="small fw-bold text-secondary text-nowrap">Estado:</span>
            <div className="btn-group btn-group-sm bg-body-tertiary rounded-pill p-1 shadow-sm w-100">
              <button
                type="button"
                className={`btn rounded-pill px-3 w-50 fw-semibold transition-all ${
                  !aprobadaFilter
                    ? 'btn-warning text-dark shadow-sm'
                    : 'btn-light text-secondary border-0 bg-transparent'
                }`}
                onClick={() => handleFilterChange(false)}
              >
                ⏳ Pendientes
              </button>
              <button
                type="button"
                className={`btn rounded-pill px-3 w-50 fw-semibold transition-all ${
                  aprobadaFilter
                    ? 'btn-success text-white shadow-sm'
                    : 'btn-light text-secondary border-0 bg-transparent'
                }`}
                onClick={() => handleFilterChange(true)}
              >
                ✅ Aprobadas
              </button>
            </div>
          </Col>

          {/* Filtro por Tema */}
          <Col xs={12} md={6} className="d-flex align-items-center gap-2">
            <Form.Label htmlFor="temaSelect" className="small fw-bold text-secondary text-nowrap mb-0">
              Tema:
            </Form.Label>
            <Form.Select
              id="temaSelect"
              size="sm"
              value={selectedTema}
              onChange={handleTemaChange}
            >
              <option value="">🏷️ Todos los temas</option>
              {TEMAS_DISPONIBLES.map((tema) => (
                <option key={tema} value={tema}>
                  {tema}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      </Card>

      {/* Contenido / Lista de Cartas */}
      {isLoading ? (
        <div className="py-5">
          <Loader scale={0.7} text="Cargando cartas..." />
        </div>
      ) : (
        <>
          <Row className="g-3">
            {letters.length === 0 ? (
              <Col xs={12} className="text-center py-5">
                <p className="text-muted fs-6 mb-0">
                  {aprobadaFilter
                    ? 'No hay cartas aprobadas con los filtros seleccionados.'
                    : 'No hay cartas pendientes de revisión con los filtros seleccionados.'}
                </p>
              </Col>
            ) : (
              letters.map((letter) => (
                <Col key={letter.id} xs={12} md={6} lg={4}>
                  <Card className="h-100 shadow-sm backgroundElements border-0" style={{ borderRadius: '0.75rem' }}>
                    <Card.Header className="bg-transparent d-flex justify-content-between align-items-center border-0 pt-3 px-3">
                      <Badge bg="secondary" className="text-truncate fw-normal" style={{ maxWidth: '65%' }}>
                        {letter.tema || 'General'}
                      </Badge>
                      <Badge bg={letter.aprobada ? 'success' : 'warning'} text={letter.aprobada ? undefined : 'dark'}>
                        {letter.aprobada ? 'Aprobada' : 'Pendiente'}
                      </Badge>
                    </Card.Header>

                    <Card.Body className="px-3 py-2">
                      <p
                        className="card-text text-body"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.92rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {letter.mensaje}
                      </p>
                    </Card.Body>

                    <Card.Footer className="bg-transparent border-0 d-flex justify-content-between align-items-center pb-3 px-3">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => setLetterDetail(letter)}
                      >
                        👁️ Ver
                      </Button>

                      <div className="btn-group btn-group-sm">
                        <Button
                          variant={letter.aprobada ? 'outline-warning' : 'outline-success'}
                          size="sm"
                          onClick={() => handleOpenModerate(letter)}
                        >
                          {letter.aprobada ? 'Desaprobar' : 'Aprobar'}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleOpenDelete(letter.id)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              ))
            )}
          </Row>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                ◀ Anterior
              </Button>

              <span className="small text-muted fw-semibold">
                Página {pageInfo.currentPage || page} de {totalPages} ({pageInfo.totalElements} cartas)
              </span>

              <Button
                variant="outline-secondary"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Siguiente ▶
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal de Lectura Completa */}
      <LetterDetailModal
        show={!!letterDetail}
        onHide={() => setLetterDetail(null)}
        letter={letterDetail}
        onToggleApproval={handleOpenModerate}
        onDelete={handleOpenDelete}
      />

      {/* ConfirmModal para Moderación */}
      <ConfirmModal
        isOpen={!!letterToModerate}
        onConfirm={handleConfirmModerate}
        onCancel={() => setLetterToModerate(null)}
        title={letterToModerate?.newStatus ? 'Aprobar Carta' : 'Desaprobar Carta'}
        message={
          letterToModerate?.newStatus
            ? `¿Desea aprobar esta carta sobre "${letterToModerate?.tema}" para que sea visible públicamente en Cartas Abiertas?`
            : `¿Desea desaprobar esta carta sobre "${letterToModerate?.tema}"? Dejará de ser visible públicamente.`
        }
        confirmText={letterToModerate?.newStatus ? 'Sí, aprobar' : 'Sí, desaprobar'}
        confirmVariant={letterToModerate?.newStatus ? 'btn-success' : 'btn-warning'}
      />

      {/* ConfirmModal para Eliminación */}
      <ConfirmModal
        isOpen={!!letterToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setLetterToDelete(null)}
        title="Eliminar Carta"
        message="¿Está seguro de que desea eliminar permanentemente esta carta? Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        confirmVariant="btn-danger"
      />
    </section>
  );
};

export default LetterView;

