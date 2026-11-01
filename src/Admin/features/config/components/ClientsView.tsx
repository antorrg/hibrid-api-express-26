import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { configApi } from '../configApi';
import { toast } from '../../../../shared/toast/toastManager';
import Loader from '../../../../shared/components/Loader';
import ConfirmModal from '../../../../shared/modalComponents/ConfirmModal';
import { CreateClientModal } from './CreateClientModal';
import { EditClientModal } from './EditClientModal';
import type { IClientRecord } from '../configTypes';

export const ClientsView = () => {
  const [clients, setClients] = useState<IClientRecord[]>([]);
  const [pageInfo, setPageInfo] = useState({ currentPage: 1, totalPages: 1, totalElements: 0 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<IClientRecord | null>(null);
  const [clientToDelete, setClientToDelete] = useState<IClientRecord | null>(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await configApi.getClients(page, 10);
      setClients(res.data || []);
      if (res.info) {
        setPageInfo(res.info);
      }
    } catch (err: any) { // eslint-disable-line
      toast.error(err?.message || 'Error al obtener clientes');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    const target = clientToDelete;
    setClientToDelete(null);
    setIsLoading(true);
    try {
      await configApi.deleteClient(target.clientId);
      toast.success(`Cliente "${target.clientName}" eliminado correctamente`);
      await fetchClients();
    } catch (err: any) { // eslint-disable-line
      toast.error(err?.message || 'Error al eliminar cliente');
      setIsLoading(false);
    }
  };

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter(
      (c) =>
        c.clientName.toLowerCase().includes(term) ||
        c.clientUrl.toLowerCase().includes(term) ||
        c.clientId.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

  return (
    <div className="w-100">
      {/* Barra de cabecera con acciones */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-semibold mb-1">Directorio de Clientes</h4>
          <p className="text-secondary small mb-0">
            Administra las aplicaciones y servicios cliente que consumen la API.
          </p>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={fetchClients}
            disabled={isLoading}
            title="Refrescar lista"
          >
            🔄 Actualizar
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Registrar Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="row mb-3">
        <div className="col-12 col-md-6 col-lg-4">
          <InputGroup size="sm">
            <InputGroup.Text id="search-addon">🔍</InputGroup.Text>
            <Form.Control
              placeholder="Buscar por nombre, URL o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-describedby="search-addon"
            />
            {searchTerm && (
              <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                ✕
              </Button>
            )}
          </InputGroup>
        </div>
      </div>

      {/* Contenido / Listado */}
      {isLoading ? (
        <Loader fullScreen={false} scale={0.7} text="Cargando clientes..." />
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-5 bg-body-tertiary rounded-4 border border-dashed">
          <div className="fs-1 mb-2">👥</div>
          <h5 className="text-secondary">No se encontraron clientes</h5>
          <p className="text-muted small">
            {searchTerm ? 'Intenta con otro término de búsqueda.' : 'Aún no hay clientes registrados.'}
          </p>
          {!searchTerm && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreateModal(true)}
            >
              Crear primer cliente
            </Button>
          )}
        </div>
      ) : (
        <div className="row g-3">
          {filteredClients.map((client) => {
            const isEnabled = client.clientEnabled !== false;
            const keysCount = client.keys?.length || 0;

            return (
              <div key={client.clientId} className="col-12">
                <div className="card shadow-sm border-0 rounded-3 p-3 bg-body">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h5 className="mb-0 fw-bold text-primary">{client.clientName}</h5>
                        <Badge bg={isEnabled ? 'success' : 'danger'}>
                          {isEnabled ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Badge bg="secondary-subtle" className="text-secondary border">
                          🔑 {keysCount} {keysCount === 1 ? 'llave' : 'llaves'}
                        </Badge>
                      </div>

                      <div className="text-muted small d-flex flex-wrap gap-3 mt-1">
                        <div>
                          🌐 <strong>URL:</strong>{' '}
                          <a href={client.clientUrl} target="_blank" rel="noreferrer" className="text-decoration-none">
                            {client.clientUrl}
                          </a>
                        </div>
                        <div>
                          🆔 <span className="font-monospace text-secondary">{client.clientId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 mt-2 mt-md-0">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => setClientToEdit(client)}
                        title="Editar cliente"
                      >
                        ✏️ Editar
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setClientToDelete(client)}
                        title="Eliminar cliente y todas sus llaves"
                      >
                        🗑️ Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {pageInfo.totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <span className="text-muted small">
            Página {pageInfo.currentPage} de {pageInfo.totalPages} ({pageInfo.totalElements} clientes en total)
          </span>
          <div className="btn-group">
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              disabled={page >= pageInfo.totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modales */}
      <CreateClientModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchClients}
      />

      <EditClientModal
        show={!!clientToEdit}
        client={clientToEdit}
        onClose={() => setClientToEdit(null)}
        onSuccess={fetchClients}
      />

      <ConfirmModal
        isOpen={!!clientToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setClientToDelete(null)}
        title="¿Eliminar Cliente?"
        message={`¿Está seguro de eliminar al cliente "${clientToDelete?.clientName}"? Se revocarán inmediatamente todas las API Keys asociadas.`}
        confirmText="Sí, eliminar cliente"
        cancelText="Cancelar"
        confirmVariant="btn-danger"
      />
    </div>
  );
};
