import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { imagesApi } from "../imagesApi";
import Loader from "../../../../shared/components/Loader";

type ImageUploaderProps = {
  titleField?: string;
  value?: string | null;
  onChange: (value: string | null) => void;
};

const ImageUploader = ({ titleField = "Imagen:", value, onChange }: ImageUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const originalValue = useRef<string | null>(value || null);

  useEffect(() => {
    if (value !== undefined) {
      setPreviewUrl(value);
    }
  }, [value]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const selectedFile = input.files?.[0] || null;
    if (!selectedFile) return;

    // Previsualización instantánea con FileReader
    const fileReader = new FileReader();
    fileReader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    fileReader.readAsDataURL(selectedFile);

    setIsUploaded(false);
    setUploading(true);
    try {
      const response = await imagesApi.upload(selectedFile);
      if (response?.url) {
        setPreviewUrl(response.url);
        onChange(response.url);
        setIsUploaded(true);
      }
    } catch (error) {
      console.error("Error al cargar la imagen:", error);
      setPreviewUrl(originalValue.current);
      onChange(originalValue.current);
    } finally {
      setUploading(false);
      input.value = "";
    }
  };

  const handleRestore = () => {
    setPreviewUrl(originalValue.current);
    onChange(originalValue.current);
    setIsUploaded(false);
  };

  const handleClear = () => {
    setPreviewUrl(null);
    onChange(null);
    setIsUploaded(false);
  };

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <label htmlFor="imageFileInput" className="form-label text-body fw-medium mb-0">{titleField}</label>
        {previewUrl && (
          <button
            type="button"
            className="btn btn-sm btn-link text-danger text-decoration-none p-0"
            onClick={isUploaded ? handleRestore : handleClear}
            disabled={uploading}
          >
            {isUploaded ? "Restaurar original" : "Quitar imagen"}
          </button>
        )}
      </div>

      <input
        id="imageFileInput"
        type="file"
        className="form-control"
        onChange={handleFileChange}
        accept="image/*"
        disabled={uploading}
      />

      {uploading ? (
        <div className="mt-3 d-flex justify-content-center p-3 border border-secondary-subtle rounded bg-body-tertiary">
          <Loader fullScreen={false} scale={0.4} text="Subiendo imagen..." />
        </div>
      ) : (
        previewUrl && (
          <div className="mt-3">
            {isUploaded ? (
              <span className="badge bg-success-subtle text-success border border-success-subtle mb-2">
                ✓ Imagen subida exitosamente
              </span>
            ) : (
              <span className="badge bg-secondary-subtle text-body-secondary border border-secondary-subtle mb-2">
                Imagen actual
              </span>
            )}
            <div className="d-block">
              <img
                src={previewUrl}
                alt="Vista previa"
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
        )
      )}
    </div>
  );
};

export default ImageUploader;
