import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { imagesApi } from "../../../AdminApi/imagesApi";
import InfoFormField from "../../../InfoFormField"; 
import { imageUpladmessage } from "../../../../utils/infoHelpers";
import Loader2 from "../../../../components/Loader2";

type ImageUploaderProps = {
  titleField?: string;
  value?: string | null;
  onChange: (value: string | null) => void;
}

const ImageUploader = ({ titleField = "Imagen:", value, onChange }: ImageUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [alert, setAlert] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const originalValue = useRef<string | null>(value || null); // Imagen con la que arrancó el componente

  // Actualiza previewUrl si el prop imageValue cambia
  useEffect(() => {
    if (value !== undefined) {
      setPreviewUrl(value);//eslint-disable-line
    }
  }, [value]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const selectedFile = input.files?.[0] || null;
    if (!selectedFile) return;

    // Previsualiza la imagen seleccionada mientras sube
    const fileReader = new FileReader();
    fileReader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    fileReader.readAsDataURL(selectedFile);

    setAlert(false);
    setUploading(true);
    try {
      const response = await imagesApi.upload(selectedFile);
      if (response.url) {
        setPreviewUrl(response.url);
        onChange(response.url);
        setAlert(true);
      }
    } catch (error) {
      console.error("Error al cargar la imagen:", error);
      setPreviewUrl(value || null); // Restaura la imagen original si falla la subida
    } finally {
      setUploading(false);
      input.value = ""; // Permite volver a seleccionar el mismo archivo
    }
  };

  const handleRestore = () => {
    setPreviewUrl(originalValue.current);
    onChange(originalValue.current);
    setAlert(false);
  };

  return (
    <div className="row">
      <div className="co-md-8 mb-3 me2">
        <section>
          <div className="d-flex justify-content-start align-items-center">
            <label className="form-label">{titleField}</label>
             <InfoFormField
              info={imageUpladmessage}
              place={"bottom"}
              action={"hover"}
            /> 
          </div>
          <input
            type="file"
            className="form-control"
            onChange={handleFileChange}
            accept="image/*"
            disabled={uploading}
          />
          {previewUrl && (
            <>
              {alert ? (
                <p className="text-success">Imagen cargada exitosamente</p>
              ) : (
                <p className="text-success">Imagen existente:</p>
              )}
              {alert && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger mt-1 mb-1"
                  onClick={handleRestore}
                  disabled={uploading}
                >
                  Quitar imagen
                </button>
              )}
            </>
          )}
        </section>
        {uploading? 
          <Loader2
            fullScreen={false}
            scale={0.4}
            text="Subiendo imagen..."
            className="loader2Working"
          />
          :
          <>
        {previewUrl &&(
          <img
            src={previewUrl}
            alt="Preview"
            style={{ maxWidth: "min(100%, 20rem)", height: "auto", marginTop: "10px", objectFit: "contain", opacity: uploading ? 0.5 : 1 }}
          />
        )}
        </>
       }
      </div>
    </div>
  );
};

export default ImageUploader;
