import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { authStore } from '../store/authStore';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(authStore.user);

  useEffect(() => {
    const unsub = authStore.subscribe(() => setUser(authStore.user));
    return unsub;
  }, []);

  const handleLogout = () => {
    authStore.clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        onLogout={handleLogout}
        currentPath={location.pathname}
      />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
