import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Badge, Form, InputGroup, Table } from 'react-bootstrap';
import { configApi } from '../configApi';
import { toast } from '../../../../shared/toast/toastManager';
import Loader from '../../../../shared/components/Loader';
import ConfirmModal from '../../../../shared/modalComponents/ConfirmModal';
import type { IClientRecord, IApiKeySummary } from '../configTypes';

interface FlattenedKey extends IApiKeySummary {
  clientId: string;
  clientName: string;
  clientUrl: string;
  clientEnabled: boolean;
}

export const ApiKeysView = () => {
  const [clients, setClients] = useState<IClientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Key to delete
  const [keyToDelete, setKeyToDelete] = useState<FlattenedKey | null>(null);

  const fetchKeys = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get all clients to extract all active keys (first page with generous limit or pagination)
      const res = await configApi.getClients(1, 50);
      setClients(res.data || []);
    } catch (err: any) { // eslint-disable-line
      toast.error(err?.message || 'Error al obtener llaves de API');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  // Flatten keys from clients
  const allKeys = useMemo<FlattenedKey[]>(() => {
    const list: FlattenedKey[] = [];
    clients.forEach((client) => {
      if (client.keys && Array.isArray(client.keys)) {
        client.keys.forEach((k) => {
          list.push({
            ...k,
            clientId: client.clientId,
            clientName: client.clientName,
            clientUrl: client.clientUrl,
            clientEnabled: client.clientEnabled !== false,
          });
        });
      }
    });
    return list;
  }, [clients]);

  // Filter keys
  const filteredKeys = useMemo(() => {
    return allKeys.filter((k) => {
      const matchesSearch =
        !searchTerm.trim() ||
        k.keyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        k.clientUrl.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && k.apiKeyEnabled !== false) ||
        (statusFilter === 'inactive' && k.apiKeyEnabled === false);

      return matchesSearch && matchesStatus;
    });
  }, [allKeys, searchTerm, statusFilter]);

  const handleToggleKeyStatus = async (key: FlattenedKey) => {
    const nextStatus = !key.apiKeyEnabled;
    const actionText = nextStatus ? 'activar' : 'desactivar';

    setIsLoading(true);
    try {
      await configApi.toggleApiKeyStatus(key.apiKeyId, nextStatus);
      toast.success(`API Key ${actionText}da correctamente`);
      await fetchKeys();
    } catch (err: any) { // eslint-disable-line
      toast.error(err?.message || `Error al ${actionText} la API Key`);
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!keyToDelete) return;
    const targetKey = keyToDelete;
    setKeyToDelete(null);

    setIsLoading(true);
    try {
      await configApi.deleteApiKey(targetKey.apiKeyId);
      toast.success('API Key revocada y eliminada con éxito');
      await fetchKeys();
    } catch (err: any) { // eslint-disable-line
      toast.error(err?.message || 'Error al eliminar la API Key');
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label = 'Identificador') => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  return (
    <div className="w-100">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h4 className="fw-semibold mb-1">Monitoreo de API Keys</h4>
          <p className="text-secondary small mb-0">
            Control de llaves de acceso, activación/desactivación inmediata y revocación de permisos.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={fetchKeys}
            disabled={isLoading}
          >
            🔄 Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-5 col-lg-4">
          <InputGroup size="sm">
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              placeholder="Buscar por Key ID, Cliente o URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                ✕
              </Button>
            )}
          </InputGroup>
        </div>

        <div className="col-12 col-md-4 col-lg-3">
          <Form.Select
            size="sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Todas las llaves ({allKeys.length})</option>
            <option value="active">Solo Activas</option>
            <option value="inactive">Solo Inactivas</option>
          </Form.Select>
        </div>
      </div>

      {/* Contenido / Tabla */}
      {isLoading ? (
        <Loader fullScreen={false} scale={0.7} text="Cargando API Keys..." />
      ) : filteredKeys.length === 0 ? (
        <div className="text-center py-5 bg-body-tertiary rounded-4 border border-dashed">
          <div className="fs-1 mb-2">🔑</div>
          <h5 className="text-secondary">No se encontraron API Keys</h5>
          <p className="text-muted small">
            {allKeys.length === 0
              ? 'Aún no se han generado API Keys en el sistema. Registre un cliente para generar la primera.'
              : 'No hay llaves que coincidan con los filtros aplicados.'}
          </p>
        </div>
      ) : (
        <div className="card shadow-sm border-0 rounded-3 overflow-hidden bg-body">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="table-light small">
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Key ID</th>
                <th>Cliente Asociado</th>
                <th>Estado Llave</th>
                <th>Estado Cliente</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeys.map((key, idx) => {
                const isKeyActive = key.apiKeyEnabled !== false;

                return (
                  <tr key={key.apiKeyId || idx}>
                    <td className="text-muted small">{idx + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <code className="fw-semibold px-2 py-1 bg-body-secondary rounded">
                          {key.keyId}
                        </code>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-decoration-none text-secondary"
                          onClick={() => copyToClipboard(key.keyId, 'Key ID')}
                          title="Copiar Key ID"
                        >
                          📋
                        </Button>
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold">{key.clientName}</div>
                      <small className="text-muted">{key.clientUrl}</small>
                    </td>
                    <td>
                      <Badge bg={isKeyActive ? 'success' : 'secondary'}>
                        {isKeyActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={key.clientEnabled ? 'success-subtle' : 'danger-subtle'} className={key.clientEnabled ? 'text-success border border-success-subtle' : 'text-danger border border-danger-subtle'}>
                        {key.clientEnabled ? 'Cliente Activo' : 'Cliente Inactivo'}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <Button
                          variant={isKeyActive ? 'outline-warning' : 'outline-success'}
                          size="sm"
                          onClick={() => handleToggleKeyStatus(key)}
                          title={isKeyActive ? 'Deshabilitar esta API Key' : 'Habilitar esta API Key'}
                        >
                          {isKeyActive ? 'Deshabilitar' : 'Habilitar'}
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setKeyToDelete(key)}
                          title="Revocar permanentemente esta API Key"
                        >
                          🗑️ Revocar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={!!keyToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setKeyToDelete(null)}
        title="¿Revocar API Key?"
        message={`¿Está seguro de revocar la API Key con identificador "${keyToDelete?.keyId}" perteneciente al cliente "${keyToDelete?.clientName}"? Las aplicaciones que la utilicen perderán acceso inmediatamente.`}
        confirmText="Sí, revocar llave"
        cancelText="Cancelar"
        confirmVariant="btn-danger"
      />
    </div>
  );
};
