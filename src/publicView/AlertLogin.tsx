import { useNavigate } from 'react-router';

type AlertLoginProps = {
  logout: () => Promise<void>;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
};

const AlertLogin = ({ logout, isLoading, setIsLoading }: AlertLoginProps) => {
  const navigate = useNavigate();
  return (
    <div className="text-center p-2">
      <h2 className="h4 mb-3">Ya has iniciado sesión</h2>
      <p className="text-secondary mb-4">Puedes acceder al panel de administración o cerrar la sesión activa.</p>
      <div className="d-flex justify-content-center gap-2">
        <button type="button" className="btn btn-primary px-3" onClick={() => navigate('/admin')}>
          Ir al Panel
        </button>
        <button
          type="button"
          className="btn btn-outline-danger px-3"
          onClick={async () => {
            setIsLoading(true);
            await logout();
            setIsLoading(false);
          }}
          disabled={isLoading}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default AlertLogin