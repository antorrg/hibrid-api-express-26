import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "react-bootstrap";
import { productUpdateSchema, type ProductUpdateFormData } from "../validations/productSchema";
import SelectImages from "../../Images/SelectImages/SelectImages";
import InfoFormField from "../../../InfoFormField";
import { aboutSeo } from "../../../../utils/infoHelpers";
import DoubleButton from "./DoubleButton/DoubleButton";
import Loader2 from "../../../../components/Loader2";

type ProductUpdateFormProps = {
    defaultValues: Partial<ProductUpdateFormData>;
    onSubmit: (data: ProductUpdateFormData) => void;
    onCancel: () => void;
    load: boolean
};

export function ProductUpdateForm({ defaultValues, onSubmit, onCancel, load }: ProductUpdateFormProps) {
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProductUpdateFormData>({
        resolver: zodResolver(productUpdateSchema) as any,
        defaultValues: defaultValues || {},
    });

    const useImg = watch("useImg");

    return (
        <div className="container mt-2">
            <form onSubmit={handleSubmit(onSubmit)} className="needs-validation" noValidate>
            {load?
            <Loader2
            fullScreen={false}
            scale={0.5}
            />
            :
                <>
                <SelectImages control={control as any} setValue={setValue as any}/>

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

                <div className="mb-3">
                    <label htmlFor="enabled" className="form-label">
                        Mostrar al publico
                    </label>
                    <Controller
                        name="enabled"
                        control={control}
                        render={({ field }) => (
                            <select
                                {...field}
                                className="form-select"
                                id="enabled"
                                value={field.value ? "true" : "false"}
                                onChange={(e) => field.onChange(e.target.value === "true")}
                            >
                                <option value="true">Mostrar</option>
                                <option value="false">No mostrar</option>
                            </select>
                        )}
                    />
                </div>

                <div className="mb-3 form-check form-switch">
                    <Controller
                        name="saver"
                        control={control}
                        render={({ field }) => (
                            <Form.Check
                                type="switch"
                                id="saver"
                                checked={field.value}
                                label={
                                    field.value
                                        ? "Desactive para eliminar imagen antigua"
                                        : "Active para conservar imagen antigua"
                                }
                                onChange={(e) => field.onChange(e.target.checked)}
                            />
                        )}
                    />
                </div>
                </>
                }

                <div className="d-flex flex-row mt-4 mb-5">
                    <DoubleButton
                        className1="btn btn-md btn-primary mb-3 me-2"
                        type1="submit"
                        id1="submitButton"
                        buttonText1={isSubmitting ? "Actualizando..." : "Actualizar"}
                        disabled1={isSubmitting || load}
                        onClick1={() => { }}
                        className2="btn btn-md btn-secondary mb-3"
                        type2="button"
                        onClick2={onCancel}
                        buttonText2="Cancelar"
                    />
                </div>
            </form>
        </div>
    );
}
