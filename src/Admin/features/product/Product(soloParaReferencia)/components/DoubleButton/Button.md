# Creación y uso de GenericButton:
Un solo botón para toda la app
```javascript

import style from "../styles/GenericButton.module.css";

const GenericButton = ({ onClick, buttonText,  type='button' }) => {
  return (
    <div>
      <button type={type} onClick={onClick} className={style.button}>
        {buttonText}
      </button>
    </div>
  );
};

export default GenericButton;
```
En el componente...

```javascript
import { useNavigate } from "react-router-dom";
import GenericButton from "../ruta-donde-este-el-componente/GenericButton";

const MiComponente = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const handleOtraAccion = () => {
    // Lógica para otra acción
  };

  return (
    <div>
      <GenericButton onClick={goBack} buttonText="Volver" customClass="clase-especifica" />
      <GenericButton onClick={handleOtraAccion} buttonText="Otra Acción" customClass="otra-clase" />
      {/* Otros botones dinámicos */}
    </div>
  );
};

export default MiComponente;

```

El type del botón es para el caso en que deba usarse en un formulario:
 
 ```javascript
 // Ejemplo de uso en un formulario
import React from "react";
import { useNavigate } from "react-router-dom";
import GenericButton from "../ruta-donde-este-el-componente/GenericButton";

const MiFormulario = () => {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    // Lógica de envío del formulario
    navigate("/otra-ruta");
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Otros campos del formulario */}
      <GenericButton type="submit" buttonText="Enviar Formulario" customClass="clase-especifica" />
    </form>
  );
};

export default MiFormulario;

 ```