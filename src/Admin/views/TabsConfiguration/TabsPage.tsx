import { useState } from 'react';
import { basePath } from '../../../shared/api/api';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../../Auth/AuthContext/AuthContext';
import { toast } from '../../../shared/toast/toastManager';
import Loader from '../../../shared/components/Loader';
import ConfirmModal from './../../../shared/modalComponents/ConfirmModal';
import TabsLayout from './TabsLayout';
import Config from '../../features/config/Config';
import ViewImages from '../../features/images/ViewImages';
import Products from '../../features/product/Products';
import Users from '../../features/user/Users';
import FrontPage from '../../features/frontPage/FrontPage';
import Videos from '../../features/videos/Videos';


const TabsPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [logoutAction, setLogoutAction] = useState(false)

  // Lee el parámetro "tab" de la URL. Si no existe, usa un valor predeterminado.
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'producto';

  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (selectedTab: string) => {
    if (selectedTab === 'videos') {
      navigate('/admin?tab=videos');
    } else {
      navigate(`/admin?tab=${selectedTab}`);
    }
    setActiveTab(selectedTab);
  };

  const landing = basePath ? basePath : '/';

  const handleOpenLogoutModal = () => {
    setLogoutAction(true);
  };

  const handleConfirmLogout = async () => {
    setLogoutAction(false);
    if (isLoading) return; // Prevenir múltiples clics
    setIsLoading(true);
    try {
      await logout();
      toast.success("Sesión cerrada");
      window.location.href = landing;
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={logoutAction}
        onConfirm={handleConfirmLogout}
        onCancel={() => setLogoutAction(false)}
        title="Cerrar sesión"
        message="¿Está seguro de cerrar sesión?"
        confirmText="Sí, cerrar sesión"
        cancelText="Cancelar"
      />

      {isLoading ? <Loader fullScreen={false} scale={0.7} text="Cerrando sesión..." /> : null}
      <TabsLayout
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        sessionCleaner={handleOpenLogoutModal}
        isLoading={isLoading}
      >
        {activeTab === 'producto' && (
          <Products />
        )}
        {activeTab === 'portada' && (
          <FrontPage />
        )}
        {activeTab === 'users' && (
          <Users />
        )}
        {activeTab === 'imagenes' && (
          <ViewImages />
        )}
        {activeTab === 'videos' && (
          <Videos />
        )}
        {activeTab === 'config' && (
          <Config />
        )}
      </TabsLayout>
    </>
  );
};

export default TabsPage;
