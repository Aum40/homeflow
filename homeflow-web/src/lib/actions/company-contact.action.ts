'use server';

import { revalidatePath } from 'next/cache';
import z from 'zod';
import { ApiError } from '../api/api-error';
import { CompanyContactApi } from '../api/company-contact.api';
import {
  UpdateCompanyContactInput,
  updateCompanyContactSchema
} from '../schemas/company-contact.schema';
import { ErrorActionResult } from './action.type';

/** ช่องที่ผู้ใช้ลบข้อความออกจะกลายเป็น '' — ส่ง null เพื่อให้ backend เคลียร์เป็น NULL */
function emptyToNull(value?: string) {
  return value?.trim() ? value.trim() : null;
}

export async function updateCompanyContactAction(
  input: UpdateCompanyContactInput
): Promise<ErrorActionResult | void> {
  const parsed = updateCompanyContactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: z.flattenError(parsed.error),
      code: 'VALIDATION_ERROR'
    };
  }

  const data = {
    ...parsed.data,
    companyName: emptyToNull(parsed.data.companyName),
    address: emptyToNull(parsed.data.address),
    phone: emptyToNull(parsed.data.phone),
    email: emptyToNull(parsed.data.email),
    businessHours: emptyToNull(parsed.data.businessHours),
    lineId: emptyToNull(parsed.data.lineId),
    facebook: emptyToNull(parsed.data.facebook)
  };

  try {
    await CompanyContactApi.update(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        success: false,
        message: error.message,
        code: 'API_ERROR'
      };
    }
    throw error;
  }
  revalidatePath('/contact');
  revalidatePath('/admin/contact');
}
