import { useState } from 'react';
import { basePath } from '../../../shared/api/api';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../../Auth/AuthContext/AuthContext';
import { toast } from '../../../shared/toast/toastManager';
import Loader from '../../../shared/components/Loader';
import TabsLayout from './TabsLayout';
import Default from './TabsComponents/Default';

const showConfirmationDialog = (message: string): Promise<boolean> => {
  return Promise.resolve(window.confirm(message));
};

const TabsPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Lee el parámetro "tab" de la URL. Si no existe, usa un valor predeterminado.
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'producto';

  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (selectedTab: string) => {
    if (selectedTab === 'videos') {
      navigate('/admin?tab=videos&subtab=facebook');
    } else {
      navigate(`/admin?tab=${selectedTab}`);
    }
    setActiveTab(selectedTab);
  };

  const landing = basePath ? basePath : '/';

  const sessionCleaner = async () => {
    const confirmed = await showConfirmationDialog(
      "¿Está seguro de cerrar sesión?"
    );
    if (confirmed) {
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
    }
  };

  return (
    <>
      {isLoading ? <Loader fullScreen={false} scale={0.7} text="Cerrando sesión..." /> : null}
      <TabsLayout
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        sessionCleaner={sessionCleaner}
        isLoading={isLoading}
      >
        {activeTab === 'producto' && (
          <Default />
        )}
        {activeTab === 'portada' && (
          <Default />
        )}
        {activeTab === 'users' && (
          <Default />
        )}
        {activeTab === 'imagenes' && (
          <Default />
        )}
        {activeTab === 'videos' && (
          <Default />
        )}
        {activeTab === 'config' && (
          <Default />
        )}
      </TabsLayout>
    </>
  );
};

export default TabsPage;
