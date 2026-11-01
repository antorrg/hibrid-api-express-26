import { useLocation, useNavigate } from 'react-router';
import { ClientsView } from './components/ClientsView';
import { ApiKeysView } from './components/ApiKeysView';
import { SystemLogsView } from './components/SystemLogsView';
import type { ConfigSubTab } from './configTypes';

const Config = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lee el parámetro "sub" de la URL. Si no existe o es inválido, usa 'clients'
  const queryParams = new URLSearchParams(location.search);
  const currentSub = queryParams.get('sub');
  const activeSubTab: ConfigSubTab =
    currentSub === 'apikeys' || currentSub === 'logs' ? currentSub : 'clients';

  const handleSubTabChange = (tab: ConfigSubTab) => {
    const params = new URLSearchParams(location.search);
    params.set('tab', 'config');
    params.set('sub', tab);
    navigate(`/admin?${params.toString()}`);
  };

  return (
    <div className="w-100 py-3">
      {/* Switch / Segmented Control moderno tipo píldoras */}
      <div className="d-flex justify-content-center mb-4">
        <div
          className="btn-group p-1 bg-body-tertiary rounded-pill shadow-sm border"
          role="group"
          aria-label="Selector de configuración"
        >
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold transition-all ${
              activeSubTab === 'clients'
                ? 'btn-primary shadow-sm'
                : 'btn-light text-secondary border-0 bg-transparent'
            }`}
            onClick={() => handleSubTabChange('clients')}
          >
            👥 Clientes
          </button>

          <button
            type="button"
            className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold transition-all ${
              activeSubTab === 'apikeys'
                ? 'btn-primary shadow-sm'
                : 'btn-light text-secondary border-0 bg-transparent'
            }`}
            onClick={() => handleSubTabChange('apikeys')}
          >
            🔑 API Keys
          </button>

          <button
            type="button"
            className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold transition-all ${
              activeSubTab === 'logs'
                ? 'btn-primary shadow-sm'
                : 'btn-light text-secondary border-0 bg-transparent'
            }`}
            onClick={() => handleSubTabChange('logs')}
          >
            📋 Registros (Logs)
          </button>
        </div>
      </div>

      {/* Ventana dinámica activa */}
      <div className="container-fluid px-0">
        {activeSubTab === 'clients' && <ClientsView />}
        {activeSubTab === 'apikeys' && <ApiKeysView />}
        {activeSubTab === 'logs' && <SystemLogsView />}
      </div>
    </div>
  );
};

export default Config;
