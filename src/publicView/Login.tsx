import { useState } from 'react';
import { basePath } from '../shared/api/api';
import { useAuth } from '../Auth/AuthContext/AuthContext'
import { useNavigate } from 'react-router';
import { validLogin } from './loginComponents/validate';
import Loader from '../shared/components/Loader';
import { toast } from '../shared/toast/toastManager';

// Componente visual de Loading respetando el renderizado condicional
const Loading = () => <Loader fullScreen={false} scale={0.7} text="Aguarde un momento..." />;

// Componente visual AlertLogin para cuando ya hay sesión iniciada
const AlertLogin = ({ logout, isLoading, setIsLoading }: { logout: () => Promise<void>; isLoading: boolean; setIsLoading: (val: boolean) => void }) => {
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

const Login = () => {
  const inicio = basePath ? basePath : '/';
  const navigate = useNavigate();
  const { authenticated, login, logout } = useAuth();
  console.log('autenticado: ', authenticated);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const closeLogin = () => window.location.href = (inicio);
  const succesLogin = () => { navigate('/admin'); };

  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState<any>({
    email: "",
    password: "",
  });

  function handleChange(event: any) {
    const { name, value } = event.target;
    setInput({
      ...input,
      [name]: value,
    });
    setError({
      ...error,
      [name]: validLogin({ ...input, [name]: value })[name],
    });
  }

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    if (isLoading || permit) return;
    setIsLoading(true);
    try {
      console.log(input)
      const response = await login(input);
      if (response) {
        setInput({
          email: "",
          password: "",
        });
        succesLogin();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const permit = (!input.email.trim() || !input.password.trim() || error.email || error.password || isLoading) ? true : false;

  return (
    <>
      <div className="backgroundPages">
        <div className='coverBack'>
          {isLoading ?
            <Loading />
            :
            <div className="container-md modal-content backgroundFormColor loginContainer rounded-4 shadow">
              <div className="form-signin m-auto p-3">
                {authenticated ?
                  <AlertLogin logout={logout} isLoading={isLoading} setIsLoading={setIsLoading} />
                  :
                  <form onSubmit={handleSubmit}>
                    <div className="d-flex justify-content-between align-items-center">
                      <img className="mb-4" src="/logo.png" alt="" width="95" height="93" />
                      <button type="button" onClick={closeLogin} className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <h1 className="h3 mb-3 fw-normal">Inicie sesion</h1>
                    <div className="form-floating">
                      <input type="email" className="form-control" value={input.email} name="email" placeholder="name@example.com" onChange={(event) => handleChange(event)} />
                      <label htmlFor="floatingInput">Email address</label>
                      {error.email && <p className='errorMsg'>{error.email}</p>}
                    </div>
                    <div className="form-floating d-flex justify-content-between align-items-center">
                      <input type={showPassword ? 'text' : 'password'} className="form-control" value={input.password} name="password" placeholder="Password" onChange={(event) => handleChange(event)} />
                      <label htmlFor="floatingPassword">Password</label>
                      <button type='button' onClick={() => { setShowPassword(!showPassword) }} className='buttonEye'>
                        <i className={showPassword ? 'bi-svg bi-eye-slash' : 'bi-svg bi-eye'}></i>
                      </button>
                      {error.password && <p className='errorMsg'>{error.password}</p>}
                    </div>
                    <button type="submit" className="btn btn-primary w-100 py-2" disabled={permit}>Iniciar</button>
                    <br></br>
                    <br></br>
                    <br></br>
                  </form>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </>
  );
};

export default Login;