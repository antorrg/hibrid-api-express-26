import { useForm, Controller } from "react-hook-form";
import { Form } from "react-bootstrap";
import SelectImages from "../../Images/SelectImages/SelectImages";
import GenericButton from "../../../../components/GenericButton/GenericButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ItemCreateFormData, itemCreateSchema } from "../validations/productSchema";
import Loader2 from "../../../../components/Loader2";

interface ItemCreateFormProps {
    productId: number;
    onSubmit: (data: ItemCreateFormData) => void;
    onCancel: () => void;
    load:boolean
}

export function ItemCreateForm({ productId, onSubmit, onCancel, load }: ItemCreateFormProps) {
    const {
        register,
        handleSubmit,
        //watch,
        control,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ItemCreateFormData>({
        resolver: zodResolver(itemCreateSchema) as any,
        defaultValues: {
            ProductId: productId,
            text: "",
            picture: "",
            useImg: false
        },
    });

    //const useImg = watch("useImg");

    return (
        <div className="container mt-5">
            <form onSubmit={handleSubmit(onSubmit)} className="needs-validation" noValidate>
            {load?
            <Loader2
                fullScreen={false}
                scale={0.5}
            />
            :           
            <>
                {/* ProductId */}
                <input type="hidden" {...register("ProductId", { valueAsNumber: true })} />

            <SelectImages control={control as any} setValue={setValue as any}  />
             {errors.picture && <div className="text-danger small mt-1">{errors.picture.message}</div>}
{/* 
                <div className="mb-3 form-check form-switch">
                    <Controller
                        name="saver"
                        control={control}
                        render={({ field }) => (
                            <Form.Check
                                type="switch"
                                id="saver"
                                checked={field.value || false}
                                label="Active para guardar la imagen antigua"
                                onChange={(e) => {
                                    field.onChange(e.target.checked);
                                    setValue("picture", "");
                                }}
                            />
                        )}
                    />
                </div> */}

                <div className="mb-3">
                    <label htmlFor="text" className="form-label">
                        Texto del Item:
                    </label>
                    <textarea
                        {...register("text")}
                        className={`form-control ${errors.text ? "is-invalid" : ""}`}
                        rows={3}
                        id="text"
                        placeholder="Ej. Característica 1"
                    />
                    {errors.text && <div className="invalid-feedback">{errors.text.message}</div>}
                </div>
                </>
                }
                <div className="d-flex flex-row mt-4 mb-5">
                    <GenericButton
                        className="btn btn-md btn-secondary mb-3 me-2"
                        type="button"
                        buttonText="Cancelar"
                        onClick={onCancel}
                    />
                    <button
                        type="submit"
                        className="btn btn-md btn-primary mb-3"
                        disabled={isSubmitting || load}
                    >
                        {isSubmitting ? "Guardando..." : "Guardar Item"}
                    </button>
                </div>
            </form>
        </div>
    );
}
