import z from 'zod';

export const createHouseDesignSchema = z.object({
  name: z.string('Name must be a string.').min(1, 'Name is required.'),
  description: z.string().optional(),
  basePrice: z
    .number('Base price must be a number.')
    .positive('Base price must be positive.'),
  steps: z.array(z.string().min(1, 'Step title is required.')).optional()
});

export type CreateHouseDesignInput = z.infer<typeof createHouseDesignSchema>;

export const updateHouseDesignSchema = createHouseDesignSchema.partial();

export type UpdateHouseDesignInput = z.infer<typeof updateHouseDesignSchema>;
