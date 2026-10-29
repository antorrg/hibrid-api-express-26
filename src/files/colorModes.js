export const colorModes = () => {
    const getStoredTheme = () => {
      const theme = localStorage.getItem('theme');
      //console.log('Stored theme:', theme);
      return theme;
    };
  
    const setStoredTheme = (theme) => {
      //console.log('Setting theme in localStorage:', theme);
      localStorage.setItem('theme', theme);
    };
  
    const getPreferredTheme = () => {
      const storedTheme = getStoredTheme();
      if (storedTheme) {
        return storedTheme;
      }
      const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      //console.log('Preferred theme:', preferredTheme);
      return preferredTheme;
    };
  
    const setTheme = (theme) => {
      //console.log('Setting theme:', theme);
      if (theme === 'auto') {
        document.documentElement.setAttribute(
          'data-bs-theme',
          window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        );
      } else {
        document.documentElement.setAttribute('data-bs-theme', theme);
      }
    };
  
    const updateThemeButton = (theme) => {
      const themeToggleBtn = document.getElementById('themeToggleBtn');
      if (!themeToggleBtn) return;
      switch (theme) {
        case 'dark':
          themeToggleBtn.textContent = '🌙';
          themeToggleBtn.setAttribute('title', 'Tema oscuro (clic para cambiar a claro)');
          themeToggleBtn.setAttribute('aria-label', 'Tema oscuro. Clic para cambiar a claro');
          break;
        case 'light':
        default:
          themeToggleBtn.textContent = '☀️';
          themeToggleBtn.setAttribute('title', 'Tema claro (clic para cambiar a oscuro)');
          themeToggleBtn.setAttribute('aria-label', 'Tema claro. Clic para cambiar a oscuro');
          break;
      }
    };
  
    const showActiveTheme = (theme, focus = false) => {
      //console.log('Showing active theme:', theme);
      const themeSwitcher = document.querySelector('#bd-theme');
  
      if (!themeSwitcher) {
        return;
      }
  
      const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`);
      if (!btnToActive) return;
  
      document.querySelectorAll('[data-bs-theme-value]').forEach((element) => {
        element.classList.remove('active');
        element.setAttribute('aria-pressed', 'false');
      });
  
      btnToActive.classList.add('active');
      btnToActive.setAttribute('aria-pressed', 'true');
  
      if (focus) {
        themeSwitcher.focus();
      }
    };
  
    // Initialize the theme
    const initializeTheme = () => {
      const preferredTheme = getPreferredTheme();
      setTheme(preferredTheme);
      updateThemeButton(preferredTheme);
      showActiveTheme(preferredTheme);
    };
  
    // Add event listeners
    const setupEventListeners = () => {
      const themeToggleBtn = document.getElementById('themeToggleBtn');
      if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
          const currentTheme = document.documentElement.getAttribute('data-bs-theme') || getPreferredTheme();
          const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
          setStoredTheme(nextTheme);
          setTheme(nextTheme);
          updateThemeButton(nextTheme);
          showActiveTheme(nextTheme, true);
        });
      }

      const themeOptions = document.querySelectorAll('[data-bs-theme-value]');
      themeOptions.forEach((option) => {
        option.addEventListener('click', () => {
          const theme = option.getAttribute('data-bs-theme-value');
          setStoredTheme(theme);
          setTheme(theme);
          updateThemeButton(theme);
          showActiveTheme(theme, true);
        });
      });
  
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const storedTheme = getStoredTheme();
        if (storedTheme !== 'light' && storedTheme !== 'dark') {
          const newTheme = getPreferredTheme();
          setTheme(newTheme);
          updateThemeButton(newTheme);
        }
      });
    };
  
    const initialize = () => {
      initializeTheme();
      setupEventListeners();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initialize, { once: true });
    } else {
      initialize();
    }
  };
  