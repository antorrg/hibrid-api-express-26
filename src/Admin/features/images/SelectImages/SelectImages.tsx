import { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import ImageSelector from "./ImageSelector";
import ImageUploader from "./ImageUploader";

export interface SelectImagesProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  useImg?: boolean;
  onUseImgChange?: (useImg: boolean) => void;
  titleField?: string;
  id?: string;
}

const SelectImages = ({
  value,
  onChange,
  useImg,
  onUseImgChange,
  titleField = "Imagen:",
  id = "selectImagesSwitch",
}: SelectImagesProps) => {
  const [internalUseImg, setInternalUseImg] = useState<boolean>(useImg || false);

  useEffect(() => {
    if (useImg !== undefined) {
      setInternalUseImg(useImg);
    }
  }, [useImg]);

  const handleSwitchChange = (checked: boolean) => {
    setInternalUseImg(checked);
    onChange(null);
    onUseImgChange?.(checked);
  };

  return (
    <div className="select-images-container mb-3">
      <div className="mb-2 form-check form-switch">
        <Form.Check
          type="switch"
          id={id}
          checked={internalUseImg}
          label="Elegir imagen existente de la galería"
          className="text-body fw-normal"
          onChange={(e) => handleSwitchChange(e.target.checked)}
        />
      </div>

      {internalUseImg ? (
        <ImageSelector value={value} onChange={onChange} />
      ) : (
        <ImageUploader titleField={titleField} value={value} onChange={onChange} />
      )}
    </div>
  );
};

export default SelectImages;