import { Suspense, useEffect } from 'react';
import AdminNav from './AdminNav';
import { Outlet } from 'react-router';
import { useAuth } from '../../Auth/AuthContext/AuthContext';
import { useUserStore } from '../features/user/userStore';
import Loader from '../../shared/components/Loader';

const Admin = () => {
  const { user } = useAuth();
  const fetchUserProfile = useUserStore((state) => state.fetchUserProfile);

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile(user.id);
    }
  }, [user?.id, fetchUserProfile]);

  return (
    <div className="backgroundOnlyImage">
      <AdminNav />
      <Suspense fallback={<Loader fullScreen={false} scale={0.7} text="Cargando..." />}>
        <Outlet />
      </Suspense>
    </div>
  );
};

export default Admin;