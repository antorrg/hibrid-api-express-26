import { useState } from "react";
import { Dropdown } from 'react-bootstrap';
import { useReduxFetch } from "../../../../hooks/useReduxFetch";
import { getAllImages } from "../imagesAdminSlice";
import InfoFormField from '../../../InfoFormField'
import { imageSelector } from '../../../../utils/infoHelpers'

type ImageSelectProps = {
  value?: string | null;
  onChange: (value: string | null) => void;
}

const ImageSelector = ({ value, onChange }: ImageSelectProps) => {
 const { images } = useReduxFetch({
  action: getAllImages,
  selector: (state) => state.adminImages
 })

  const storedImages = images
  const [selectedImage, setSelectedImage] = useState<string | null>(value || null);



  // Función que maneja la selección de imagen
  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl); // Actualiza el estado con la imagen seleccionada
    onChange(imageUrl); // Llama al callback con la URL seleccionada
  };

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-start align-items-center">
        <label className="form-label">Selecciona una imagen almacenada</label>
        <InfoFormField info={imageSelector} place={'bottom'} action={'hover'}/>
      </div>

      <Dropdown>
        <Dropdown.Toggle variant="secondary" id="imageDropdown">
          {selectedImage ? "Imagen seleccionada" : "Seleccionar..."}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {storedImages?.map((image) => (
            <Dropdown.Item
              key={image.id}
              onClick={() => handleImageSelect(image.imageUrl)}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <img
                src={image.imageUrl}
                alt="preview"
                style={{ maxWidth: "6rem", marginRight: "10px" }}
              />
              <span>Imagen guardada Nº: {image.id}</span>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      {selectedImage && (
        <img
          src={selectedImage}
          alt="Imagen seleccionada"
          style={{ maxWidth: "20rem", marginTop: "10px" }}
        />
      )}
    </div>
  );
};

export default ImageSelector;
