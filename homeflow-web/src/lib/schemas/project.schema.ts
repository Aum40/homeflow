import z from 'zod';

export const createProjectSchema = z.object({
  customerId: z
    .string('Please select a customer.')
    .min(1, 'Please select a customer.'),
  houseDesignId: z
    .string('Please select a house design.')
    .min(1, 'Please select a house design.'),
  projectName: z
    .string('Project name must be a string.')
    .min(1, 'Project name is required.'),
  location: z
    .string('Location must be a string.')
    .min(1, 'Location is required.'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  description: z.string().optional()
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectInfoSchema = z.object({
  projectName: z
    .string('Project name must be a string.')
    .min(1, 'Project name is required.')
    .optional(),
  location: z
    .string('Location must be a string.')
    .min(1, 'Location is required.')
    .optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
});

export type UpdateProjectInfoInput = z.infer<typeof updateProjectInfoSchema>;

export const withdrawMaterialSchema = z.object({
  qty: z
    .number('Quantity must be a number.')
    .int('Quantity must be an integer.')
    .positive('Quantity must be positive.')
});

export type WithdrawMaterialInput = z.infer<typeof withdrawMaterialSchema>;

export const createChecklistItemSchema = z.object({
  title: z.string('Title must be a string.').min(1, 'Title is required.')
});

export type CreateChecklistItemInput = z.infer<
  typeof createChecklistItemSchema
>;

export const updateChecklistItemSchema = z.object({
  title: z.string('Title must be a string.').min(1, 'Title is required.')
});

export type UpdateChecklistItemInput = z.infer<
  typeof updateChecklistItemSchema
>;

export const updateProjectDatesSchema = z
  .object({
    startDate: z.string().optional(),
    endDate: z.string().optional()
  })
  .refine(
    (data) =>
      !data.startDate ||
      !data.endDate ||
      new Date(data.endDate) >= new Date(data.startDate),
    {
      message: 'วันที่คาดว่าจะเสร็จต้องไม่ก่อนวันที่เริ่มต้น',
      path: ['endDate']
    }
  );

export type UpdateProjectDatesInput = z.infer<typeof updateProjectDatesSchema>;
