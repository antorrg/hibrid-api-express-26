import { useState, useEffect, useCallback } from 'react';
import { Button, Badge, Form, InputGroup, Table } from 'react-bootstrap';
import { configApi } from '../configApi';
import { toast } from '../../../../shared/toast/toastManager';
import Loader from '../../../../shared/components/Loader';
import ConfirmModal from '../../../../shared/modalComponents/ConfirmModal';
import { SystemLogDetailModal } from './SystemLogDetailModal';
import { SystemLogsPagination } from './SystemLogsPagination';
import type { ILogger, PaginatedLogsResponse } from '../configTypes';

export const SystemLogsView = () => {
  const [data, setData] = useState<PaginatedLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('message');
  const [selectedLog, setSelectedLog] = useState<ILogger | null>(null);

  // Deletion modals state
  const [logToDelete, setLogToDelete] = useState<ILogger | null>(null);
  const [showPurgeModal, setShowPurgeModal] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await configApi.getLogs({
        page,
        limit: 10,
        searchField: search.trim() ? searchField : undefined,
        search: search.trim() ? search.trim() : undefined,
        sortBy: 'time',
        order: 'DESC',
      });
      setData(res);
    } catch (err: any) { // eslint-disable-line
      toast.error(err?.message || 'Error al obtener registros');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, search, searchField]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleKeepToggle = async (log: ILogger) => {
    const nextKeep = !log.keep;
    try {
      await configApi.toggleLogKeep(log.id, nextKeep);
      toast.success(nextKeep ? 'Registro protegido contra purgas' : 'Registro desprotegido');
      await fetchLogs();
    } catch (err: any) { // eslint-disable-line
      toast.error(err?.message || 'Error al modificar protección');
    }
  };

  const handleConfirmDelete = async () => {
    if (!logToDelete) return;
    const target = logToDelete;
    setLogToDelete(null);

    setLoading(true);
    try {
      await configApi.deleteLog(target.id);
      toast.success('Registro eliminado');
      await fetchLogs();
    } catch (err: any) { // eslint-disable-line
      toast.error(err?.message || 'Error al eliminar el registro');
      setLoading(false);
    }
  };

  const handleConfirmPurge = async () => {
    setShowPurgeModal(false);
    setLoading(true);
    try {
      await configApi.deleteAllLogs();
      toast.success('Registros no protegidos purgados con éxito');
      setPage(1);
      await fetchLogs();
    } catch (err: any) { // eslint-disable-line
      toast.error(err?.message || 'Error al purgar registros');
      setLoading(false);
    }
  };

  const getBadgeColor = (levelName: string) => {
    switch (levelName.toUpperCase()) {
      case 'FATAL':
      case 'ERROR':
        return 'danger';
      case 'WARN':
        return 'warning';
      case 'INFO':
        return 'info';
      case 'DEBUG':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  const logsList = data?.data || [];

  return (
    <div className="w-100">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-semibold mb-1">Registros del Sistema (Logs)</h4>
          <p className="text-secondary small mb-0">
            Monitoreo en tiempo real de eventos, errores y actividad interna del backend.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
          >
            🔄 Actualizar
          </Button>

          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => setShowPurgeModal(true)}
            disabled={loading || logsList.length === 0}
            title="Eliminar todos los logs sin proteger"
          >
            🗑️ Purgar No Protegidos
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-3 col-lg-2">
          <Form.Select
            size="sm"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
          >
            <option value="message">Mensaje</option>
            <option value="levelName">Nivel (INFO, ERROR...)</option>
            <option value="status">Código Estado HTTP</option>
          </Form.Select>
        </div>

        <div className="col-12 col-md-5 col-lg-4">
          <InputGroup size="sm">
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              placeholder={`Filtrar por ${searchField}...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <Button variant="outline-secondary" onClick={() => setSearch('')}>
                ✕
              </Button>
            )}
          </InputGroup>
        </div>
      </div>

      {/* Contenido / Tabla */}
      {loading && !data ? (
        <Loader fullScreen={false} scale={0.7} text="Cargando registros..." />
      ) : logsList.length === 0 ? (
        <div className="text-center py-5 bg-body-tertiary rounded-4 border border-dashed">
          <div className="fs-1 mb-2">📋</div>
          <h5 className="text-secondary">No se encontraron logs</h5>
          <p className="text-muted small">
            {search
              ? 'No hay registros que coincidan con la búsqueda.'
              : 'El sistema no tiene eventos registrados en este momento.'}
          </p>
        </div>
      ) : (
        <div className="card shadow-sm border-0 rounded-3 overflow-hidden bg-body">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light small">
              <tr>
                <th style={{ width: '90px' }}>Nivel</th>
                <th style={{ width: '160px' }}>Fecha</th>
                <th style={{ width: '80px' }} className="text-center">Proteger</th>
                <th>Mensaje</th>
                <th style={{ width: '110px' }} className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {logsList.map((log) => (
                <tr key={log.id}>
                  <td>
                    <Badge bg={getBadgeColor(String(log.levelName))}>
                      {log.levelName}
                    </Badge>
                  </td>
                  <td className="small text-muted font-monospace">
                    {new Date(log.time).toLocaleString([], {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="text-center">
                    <Form.Check
                      type="switch"
                      id={`keep-switch-${log.id}`}
                      checked={log.keep}
                      onChange={() => handleKeepToggle(log)}
                      title={log.keep ? 'Registro protegido contra purgas masivas' : 'Marcar para proteger'}
                    />
                  </td>
                  <td className="text-truncate" style={{ maxWidth: '350px' }}>
                    <span className="small font-monospace" title={log.message}>
                      {log.message}
                    </span>
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="py-0 px-2"
                        onClick={() => setSelectedLog(log)}
                        title="Ver detalles completos del registro"
                      >
                        👁️
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="py-0 px-2"
                        onClick={() => setLogToDelete(log)}
                        title="Eliminar este registro"
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Paginación */}
      {data?.info && (
        <SystemLogsPagination
          info={data.info}
          page={page}
          loading={loading}
          onPageChange={setPage}
        />
      )}

      {/* Modales */}
      <SystemLogDetailModal
        show={!!selectedLog}
        onHide={() => setSelectedLog(null)}
        log={selectedLog}
      />

      <ConfirmModal
        isOpen={!!logToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setLogToDelete(null)}
        title="¿Eliminar Registro?"
        message={`¿Está seguro de eliminar el registro #${logToDelete?.id}? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmVariant="btn-danger"
      />

      <ConfirmModal
        isOpen={showPurgeModal}
        onConfirm={handleConfirmPurge}
        onCancel={() => setShowPurgeModal(false)}
        title="¿Purgar registros no protegidos?"
        message="Se eliminarán de forma permanente todos los registros que NO tengan el switch de protección activado. ¿Desea continuar?"
        confirmText="Sí, purgar logs"
        cancelText="Cancelar"
        confirmVariant="btn-danger"
      />
    </div>
  );
};
