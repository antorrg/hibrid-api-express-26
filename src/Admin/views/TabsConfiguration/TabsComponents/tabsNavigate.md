El problema ocurre porque la pestaña activa se almacena en el estado del componente (`activeTab`), pero ese estado se pierde al cambiar la URL y volver a cargar el componente. Para solucionar esto, puedes sincronizar la pestaña activa con la URL utilizando el objeto `useLocation` y el objeto `useNavigate` de **React Router**.

### **Solución**
1. **Sincroniza la pestaña con la URL:**
   Usa un parámetro en la URL para indicar la pestaña activa (por ejemplo, `/admin/page?tab=producto`). De esta forma, la pestaña activa se determina por el parámetro `tab` en la URL.

2. **Usa `useLocation` para leer la URL:**
   Cuando vuelvas a la página, lee el parámetro `tab` para establecer la pestaña activa.

3. **Actualiza la URL al cambiar de pestaña:**
   Usa `useNavigate` para actualizar el parámetro `tab` en la URL cuando el usuario cambie de pestaña.

---

### **Implementación**

Actualiza tu componente para que se vea así:

```jsx
import { useLocation, useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lee el parámetro "tab" de la URL. Si no existe, usa un valor predeterminado.
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'producto';

  // Estado para la pestaña activa.
  const [activeTab, setActiveTab] = React.useState(initialTab);

  // Maneja el cambio de pestaña y actualiza la URL.
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/page?tab=${tab}`); // Actualiza la URL.
  };

  const sessionCleaner = () => {
    // Implementa tu lógica de limpieza de sesión aquí.
  };

  return (
    <TabsLayout
      activeTab={activeTab}
      handleTabChange={handleTabChange}
      sessionCleaner={sessionCleaner}
    >
      {activeTab === 'producto' && <Comp.Producto />}
      {activeTab === 'portada' && <Comp.LandingView />}
      {activeTab === 'work' && <Comp.AdminAlbumWork />}
      {activeTab === 'about' && <Portada />}
      {activeTab === 'users' && <Usuario />}
      {activeTab === 'imagenes' && <Comp.ImagesComponent />}
      {activeTab === 'videos' && <Comp.Videos />}
      {activeTab === 'config' && <Usuario />}
    </TabsLayout>
  );
};
```

---

### **Cambios Realizados**

1. **`useLocation` para leer la URL:**
   La pestaña activa inicial se determina en función del parámetro `tab` de la URL (`initialTab`).

2. **`useNavigate` para cambiar la URL:**
   Cada vez que cambie la pestaña, la URL se actualiza con el nuevo valor del parámetro `tab`.

3. **Mantiene el estado al volver:**
   Cuando el usuario navegue hacia y desde esta página, el parámetro `tab` en la URL asegurará que la pestaña activa sea la misma que antes.

---

### **Ejemplo de Comportamiento**
- Si estás en la pestaña `producto`, la URL será `/admin/page?tab=producto`.
- Si cambias a la pestaña `portada`, la URL se actualizará a `/admin/page?tab=portada`.
- Si navegas a otro enlace y luego regresas a `/admin/page`, React Router usará el parámetro `tab` para restaurar la pestaña activa.

Este enfoque asegura que la pestaña activa esté siempre sincronizada con la URL.