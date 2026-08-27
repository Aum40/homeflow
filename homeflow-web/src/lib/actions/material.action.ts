'use server';

import { revalidatePath } from 'next/cache';
import z from 'zod';
import { ApiError } from '../api/api-error';
import { MaterialApi } from '../api/material.api';
import { MaterialResponse } from '../api/api.type';
import {
  CreateMaterialInput,
  createMaterialSchema,
  UpdateMaterialInput,
  updateMaterialSchema
} from '../schemas/material.schema';
import { ErrorActionResult } from './action.type';

export async function createMaterialAction(
  input: CreateMaterialInput
): Promise<ErrorActionResult | MaterialResponse> {
  const parsed = createMaterialSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: z.flattenError(parsed.error),
      code: 'VALIDATION_ERROR'
    };
  }

  let material: MaterialResponse;
  try {
    material = await MaterialApi.create(parsed.data);
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
  revalidatePath('/admin/materials');
  return material;
}

export async function updateMaterialAction(
  materialId: string,
  input: UpdateMaterialInput
): Promise<ErrorActionResult | void> {
  const parsed = updateMaterialSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: z.flattenError(parsed.error),
      code: 'VALIDATION_ERROR'
    };
  }

  try {
    await MaterialApi.update(materialId, parsed.data);
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
  revalidatePath('/admin/materials');
}

export async function uploadMaterialImageAction(
  materialId: string,
  file: File
): Promise<ErrorActionResult | void> {
  try {
    await MaterialApi.uploadImage(materialId, file);
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
  revalidatePath('/admin/materials');
}

export async function removeMaterialAction(
  materialId: string
): Promise<ErrorActionResult | void> {
  try {
    await MaterialApi.remove(materialId);
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
  revalidatePath('/admin/materials');
}
