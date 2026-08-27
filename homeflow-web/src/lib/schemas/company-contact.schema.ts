import z from 'zod';

export const updateCompanyContactSchema = z.object({
  companyName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  // ยอมรับสตริงว่างเพื่อให้แอดมินลบค่าออกได้ (action จะแปลงเป็น null ก่อนส่ง)
  email: z.union([z.literal(''), z.email('Email is invalid.')]).optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  businessHours: z.string().optional(),
  lineId: z.string().optional(),
  facebook: z.string().optional()
});

export type UpdateCompanyContactInput = z.infer<
  typeof updateCompanyContactSchema
>;
