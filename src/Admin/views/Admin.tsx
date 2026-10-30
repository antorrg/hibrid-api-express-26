import { useEffect } from 'react';
import AdminNav from './AdminNav';
import { Outlet } from 'react-router';
import { useAuth } from '../../Auth/AuthContext/AuthContext';
import { useUserStore } from '../features/user/userStore';

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
      <Outlet />
    </div>
  );
};

export default Admin;