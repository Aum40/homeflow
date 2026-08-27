import z from 'zod';

export const createMaterialSchema = z.object({
  name: z.string('Name must be a string.').min(1, 'Name is required.'),
  category: z
    .string('Category must be a string.')
    .min(1, 'Category is required.'),
  unit: z.string('Unit must be a string.').min(1, 'Unit is required.'),
  price: z.number('Price must be a number.').positive('Price must be positive.'),
  stock: z.number('Stock must be a number.').min(0).optional()
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;

export const updateMaterialSchema = createMaterialSchema.partial();

export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
