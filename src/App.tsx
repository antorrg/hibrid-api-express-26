import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './Auth/AuthContext/AuthContext';

function App() {
  const [theme, setTheme] = useState('auto');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <AuthProvider>
      <div className={`app ${theme}-mode`}>
        <div style={{ alignItems: 'center' }}>
          <button 
            onClick={toggleTheme} 
            className="btn btn-sm btn-outline-secondary mt-4"
          >
            {theme === 'light' ? '🌙 ' : '☀️'}
          </button> 
        </div>
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  );
}

export default App;
