'use server';

import { revalidatePath } from 'next/cache';
import { ApiError } from '../api/api-error';
import { UserApi } from '../api/user.api';
import { UserRole } from '../api/api.type';
import {
  ChangePasswordInput,
  changePasswordSchema,
  UpdateProfileInput,
  updateProfileSchema
} from '../schemas/user.schema';
import { ErrorActionResult } from './action.type';
import { unstable_update } from '../auth';
import z from 'zod';

export async function updateUserRoleAction(
  userId: string,
  role: UserRole
): Promise<ErrorActionResult | void> {
  try {
    await UserApi.updateRole(userId, role);
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
  revalidatePath('/admin/manage-users');
}

export async function updateUserStatusAction(
  userId: string,
  isActive: boolean
): Promise<ErrorActionResult | void> {
  try {
    await UserApi.updateStatus(userId, isActive);
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
  revalidatePath('/admin/manage-users');
}

export async function updateProfileAction(
  input: UpdateProfileInput
): Promise<ErrorActionResult | void> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: z.flattenError(parsed.error),
      code: 'VALIDATION_ERROR'
    };
  }

  try {
    const user = await UserApi.updateProfile(parsed.data);
    await unstable_update({
      user: { firstName: user.firstName, lastName: user.lastName }
    });
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
  revalidatePath('/profile');
}

export async function changePasswordAction(
  input: ChangePasswordInput
): Promise<ErrorActionResult | void> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: z.flattenError(parsed.error),
      code: 'VALIDATION_ERROR'
    };
  }

  try {
    await UserApi.changePassword(parsed.data);
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
}

export async function uploadAvatar(
  imageUrl: string
): Promise<ErrorActionResult | void> {
  try {
    const avatarUrl = await UserApi.uploadAvatar(imageUrl);
    await unstable_update({ user: { avatarUrl } });
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
  revalidatePath('/profile');
}
