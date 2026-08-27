'use server';

import { revalidatePath } from 'next/cache';
import z from 'zod';
import { ApiError } from '../api/api-error';
import { HouseDesignApi } from '../api/house-design.api';
import { HouseDesignResponse } from '../api/api.type';
import {
  CreateHouseDesignInput,
  createHouseDesignSchema,
  UpdateHouseDesignInput,
  updateHouseDesignSchema
} from '../schemas/house-design.schema';
import { ErrorActionResult } from './action.type';

export async function createHouseDesignAction(
  input: CreateHouseDesignInput
): Promise<ErrorActionResult | HouseDesignResponse> {
  const parsed = createHouseDesignSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: z.flattenError(parsed.error),
      code: 'VALIDATION_ERROR'
    };
  }

  let houseDesign: HouseDesignResponse;
  try {
    houseDesign = await HouseDesignApi.create(parsed.data);
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
  revalidatePath('/admin/house-designs');
  return houseDesign;
}

export async function updateHouseDesignAction(
  houseDesignId: string,
  input: UpdateHouseDesignInput
): Promise<ErrorActionResult | void> {
  const parsed = updateHouseDesignSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: z.flattenError(parsed.error),
      code: 'VALIDATION_ERROR'
    };
  }

  try {
    await HouseDesignApi.update(houseDesignId, parsed.data);
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
  revalidatePath('/admin/house-designs');
}

export async function uploadHouseDesignImageAction(
  houseDesignId: string,
  file: File
): Promise<ErrorActionResult | void> {
  try {
    await HouseDesignApi.uploadImage(houseDesignId, file);
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
  revalidatePath('/admin/house-designs');
}

export async function removeHouseDesignAction(
  houseDesignId: string
): Promise<ErrorActionResult | void> {
  try {
    await HouseDesignApi.remove(houseDesignId);
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
  revalidatePath('/admin/house-designs');
}
