import { useEffect } from "react";
import { useForm, useFieldArray} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productCreateSchema, type ProductCreateFormData } from "../validations/productSchema";
import InfoFormField from "../../../InfoFormField";
import { aboutSeo, createItemProd } from "../../../../utils/infoHelpers";
import GenericButton from "../../../../components/GenericButton/GenericButton";
import SelectImages from "../../Images/SelectImages/SelectImages";
import Loader2 from "../../../../components/Loader2";

type ProductCreateFormProps = {
    defaultValues?: Partial<ProductCreateFormData>;
    onSubmit: (data: ProductCreateFormData) => void;
    onCancel: () => void;
    load: boolean
};

export function ProductCreateForm({ defaultValues, onSubmit, onCancel, load }: ProductCreateFormProps) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProductCreateFormData>({
        resolver: zodResolver(productCreateSchema) as any,
        defaultValues: {
            title: defaultValues?.title ?? "",
            picture: defaultValues?.picture ?? "",
            info_header: defaultValues?.info_header ?? "",
            info_body: defaultValues?.info_body ?? "",
            enabled: defaultValues?.enabled ?? false,
            useImg: defaultValues?.useImg ?? false,
            items: defaultValues?.items ?? [{ text: "", picture: "", useImg: false }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const useImg = watch("useImg");
    const watchedItems = watch("items");

    useEffect(() => {
        setValue("picture", "");
    }, [useImg, setValue]);

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
            <SelectImages control={control as any} setValue={setValue as any} />
             {errors.picture && <div className="text-danger small mt-1">{errors.picture.message}</div>}

                <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                        Título:
                    </label>
                    <input
                        {...register("title")}
                        className={`form-control ${errors.title ? "is-invalid" : ""}`}
                        type="text"
                        id="title"
                    />
                    {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
                </div>

                <div className="mb-3">
                    <label htmlFor="info_header" className="form-label">
                        Info posicionamiento:
                    </label>
                    <InfoFormField info={aboutSeo} place="bottom" />
                    <textarea
                        {...register("info_header")}
                        className="form-control"
                        id="info_header"
                        rows={3}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="info_body" className="form-label">
                        Descripción:
                    </label>
                    <textarea
                        {...register("info_body")}
                        className="form-control"
                        id="info_body"
                        rows={3}
                    />
                </div>

                <div>
                    <div className="d-flex justify-content-start align-items-center mt-4">
                        <h4>Items:</h4>
                        <InfoFormField info={createItemProd} place="bottom" />
                    </div>

                    {fields.map((item, index) => {
                        const itemUseImg = watchedItems?.[index]?.useImg;
                        return (
                            <div key={item.id} className="border p-3 mb-3 rounded-2">
                                <SelectImages 
                                    control={control as any} 
                                    setValue={setValue as any} 
                                    namePicture={`items.${index}.picture`}
                                    nameUseImg={`items.${index}.useImg`}
                                />
                                {errors.items?.[index]?.picture && (
                                    <div className="text-danger small mt-1 mb-2">{errors.items[index]?.picture?.message}</div>
                                )}
                                <div className="mb-3">
                                    <label>Texto: </label>
                                    <textarea
                                        {...register(`items.${index}.text` as const)}
                                        className={`form-control ${errors.items?.[index]?.text ? "is-invalid" : ""}`}
                                    />
                                    {errors.items?.[index]?.text && (
                                        <div className="invalid-feedback">{errors.items[index]?.text?.message}</div>
                                    )}
                                </div>

                                <GenericButton
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="btn btn-sm btn-outline-danger mb-3"
                                    buttonText="Eliminar"
                                    disabled={fields.length === 1}
                                />
                            </div>
                        )
                    })}

                    <GenericButton
                        className="btn btn-sm btn-outline-success mb-3 me-2"
                        type="button"
                        onClick={() => append({ text: "", picture: "", useImg: false })}
                        buttonText="Agregar Item"
                    />
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
                        {isSubmitting ? "Creando..." : "Crear"}
                    </button>
                </div>
            </form>
        </div>
    );
}
