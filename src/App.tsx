import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [theme, setTheme] = useState('auto')

     useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme); // Usa el tema guardado
    } else {
      // Si no hay tema guardado, determinar el tema por defecto
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      setTheme(defaultTheme);
     
    }
  }, []);

  useEffect(()=>{
    document.documentElement.setAttribute('data-bs-theme', theme);
  },[theme])

    const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme); // Guarda el tema en localStorage
  };

  return (
    <div className={`app ${theme}-mode`}>
      <div style={{alignItems:'center'}}>
      <div>
       <button 
         onClick={toggleTheme} 
         className="btn btn-sm btn-outline-secondary mt-4"
       >
         {theme === 'light' ? '🌙 ' : '☀️'}
       </button> 
    
        <a href="https://vite.dev" target="_blank" >
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card" style={{alignItems:'center'}}>
        <button onClick={() => setCount((count) => count + 1)} className='btn btn-sm btn-outline-primary' style={{maxWidth:'30%'}}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      </div>
    </div>
  )
}

export default App
