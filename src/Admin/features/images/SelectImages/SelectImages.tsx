import { Controller, type Control, type UseFormSetValue, useWatch } from "react-hook-form";
import { Form } from "react-bootstrap";
import ImageSelector from "./ImageSelector";
import ImageUploader from "./ImageUploader";

interface SelectImagesProps {
    control: Control<any>;
    setValue: UseFormSetValue<any>;
    namePicture?: string;
    nameUseImg?: string;
}

const SelectImages = ({ 
    control, 
    setValue, 
    namePicture = "picture", 
    nameUseImg = "useImg" 
}: SelectImagesProps) => {
    const useImg = useWatch({ control, name: nameUseImg, defaultValue: false });
    return (
        <>
            <div className="row">
                {useImg ? (
                    <div className="col-md-6 mb-3">
                        <Controller
                            name={namePicture}
                            control={control}
                            render={({ field }) => (
                                <ImageSelector value={field.value} onChange={field.onChange} />
                            )}
                        />
                    </div>
                ) : (
                    <div className="col-md-6 mb-3">
                        <Controller
                            name={namePicture}
                            control={control}
                            render={({ field }) => (
                                <ImageUploader
                                    titleField="Imagen:"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </div>
                )}
            </div>

            <div className="mb-3 form-check form-switch">
                <Controller
                    name={nameUseImg}
                    control={control}
                    render={({ field }) => (
                        <Form.Check
                            type="switch"
                            id={`${nameUseImg}Switch`}
                            checked={field.value || false}
                            label="Active para elegir imagen guardada"
                            onChange={(e) => {
                                field.onChange(e.target.checked);
                                setValue(namePicture, null);
                            }}
                        />
                    )}
                />
            </div>
        </>
    );
};

export default SelectImages;