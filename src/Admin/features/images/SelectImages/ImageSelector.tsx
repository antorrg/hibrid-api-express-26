import { useState, useEffect } from "react";
import { Dropdown, Spinner } from "react-bootstrap";
import { useImageStore } from "../imageStore";

type ImageSelectProps = {
  value?: string | null;
  onChange: (value: string | null) => void;
};

const ImageSelector = ({ value, onChange }: ImageSelectProps) => {
  const { images, fetchImages, isLoading } = useImageStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(value || null);

  useEffect(() => {
    if (images.length === 0) {
      fetchImages();
    }
  }, [fetchImages, images.length]);

  useEffect(() => {
    setSelectedImage(value || null);
  }, [value]);

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    onChange(imageUrl);
  };

  const handleClear = () => {
    setSelectedImage(null);
    onChange(null);
  };

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <label className="form-label text-body fw-medium mb-0">
          Seleccionar imagen guardada
        </label>
        {selectedImage && (
          <button
            type="button"
            className="btn btn-sm btn-link text-danger text-decoration-none p-0"
            onClick={handleClear}
          >
            Quitar selección
          </button>
        )}
      </div>

      <Dropdown className="w-100">
        <Dropdown.Toggle
          variant="outline-secondary"
          id="imageDropdown"
          className="w-100 d-flex justify-content-between align-items-center text-truncate"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="d-flex align-items-center gap-2">
              <Spinner size="sm" animation="border" /> Cargando galería...
            </span>
          ) : selectedImage ? (
            <span className="d-flex align-items-center gap-2 text-truncate">
              <img
                src={selectedImage}
                alt="Miniatura"
                style={{ width: "24px", height: "24px", objectFit: "cover", borderRadius: "4px" }}
              />
              <span className="text-truncate">Imagen seleccionada</span>
            </span>
          ) : (
            "Elegir de la galería..."
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu
          className="w-100 shadow-sm border border-secondary-subtle"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
          {images.length === 0 ? (
            <div className="p-3 text-center text-body-secondary small">
              No hay imágenes guardadas en la galería
            </div>
          ) : (
            images.map((image, index) => (
              <Dropdown.Item
                key={image.id}
                onClick={() => handleImageSelect(image.imageUrl)}
                className={`d-flex align-items-center gap-3 p-2 ${
                  selectedImage === image.imageUrl ? "active" : ""
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt={`Opción ${index + 1}`}
                  style={{
                    width: "48px",
                    height: "48px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                />
                <div className="d-flex flex-column text-truncate">
                  <span className="fw-semibold text-truncate small">
                    Imagen #{index + 1}
                  </span>
                  <span className="text-body-secondary text-truncate" style={{ fontSize: "0.75rem" }}>
                    {image.imageUrl.split("/").pop()}
                  </span>
                </div>
              </Dropdown.Item>
            ))
          )}
        </Dropdown.Menu>
      </Dropdown>

      {selectedImage && (
        <div className="mt-3">
          <span className="badge bg-secondary-subtle text-body-secondary border border-secondary-subtle mb-2">
            Vista previa seleccionada
          </span>
          <div className="d-block">
            <img
              src={selectedImage}
              alt="Seleccionada"
              className="img-thumbnail bg-body shadow-sm"
              style={{
                maxWidth: "min(100%, 22rem)",
                maxHeight: "14rem",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSelector;
