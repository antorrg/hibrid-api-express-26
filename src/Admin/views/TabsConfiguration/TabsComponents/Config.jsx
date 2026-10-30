import { useState } from "react";
import LetterView from "../../Configuration/LetterView";
import ApiKeyView from "../../Configuration/ApiKeyView";

const Config = () => {
  // Pestaña por defecto: Cartas
  const [activeSubTab, setActiveSubTab] = useState("letters");

  return (
    <div className="w-100 py-3">
      {/* Selector de Sub-navegación dentro de Configuración */}
      <div className="d-flex justify-content-center mb-4">
        <div className="btn-group role-group p-1 bg-body-tertiary rounded-pill shadow-sm">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-4 ${
              activeSubTab === "letters"
                ? "btn-primary shadow-sm"
                : "btn-light text-secondary"
            }`}
            onClick={() => setActiveSubTab("letters")}
          >
            ✉️ Gestión de Cartas
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-4 ${
              activeSubTab === "apikeys"
                ? "btn-primary shadow-sm"
                : "btn-light text-secondary"
            }`}
            onClick={() => setActiveSubTab("apikeys")}
          >
            🔑 Clientes & API Keys
          </button>
        </div>
      </div>

      {/* Renderizado Condicional de Vistas */}
      <div className="container-fluid">
        {activeSubTab === "letters" && <LetterView />}
        {activeSubTab === "apikeys" && <ApiKeyView />}
      </div>
    </div>
  );
};

export default Config;