import { z } from "zod";

// Base schemas
export const itemBaseSchema = z.object({
    picture: z.string().min(1, { message: "Debe incluir una imagen"}),
    text: z.string().min(1, { message: "El texto es obligatorio" }),
    useImg: z.boolean().optional(),
    enabled: z.boolean().optional(),
});

export const productBaseSchema = z.object({
    title: z.string().min(1, { message: "El título es obligatorio" }),
    picture: z.string().min(1, { message: "Debe incluir una imagen"}),
    info_header: z.string().nullable().optional(),
    info_body: z.string().nullable().optional(),
    enabled: z.boolean().default(false),
    useImg: z.boolean().optional(),
});

// CREATE schemas
export const productCreateSchema = productBaseSchema.extend({
    items: z.array(itemBaseSchema).min(1, { message: "Debe incluir al menos un ítem" }),
});

export const itemCreateSchema = itemBaseSchema.extend({
    ProductId: z.number().positive(),
});

// UPDATE schemas
export const productUpdateSchema = productBaseSchema.extend({
    saver: z.boolean().optional(),
});

export const itemUpdateSchema = itemBaseSchema.extend({
    saver: z.boolean().optional(),
});

// Types from schemas
export type ProductCreateFormData = z.infer<typeof productCreateSchema>;
export type ProductUpdateFormData = z.infer<typeof productUpdateSchema>;
export type ItemCreateFormData = z.infer<typeof itemCreateSchema>;
export type ItemUpdateFormData = z.infer<typeof itemUpdateSchema>;

// Export old names as aliases for backwards compatibility or base reference if needed
export type ProductFormData = ProductCreateFormData;
export type ItemFormData = ItemUpdateFormData;
