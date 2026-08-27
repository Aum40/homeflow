'use server';

import z from 'zod';
import {
  ForgotPasswordInput,
  forgotPasswordSchema,
  LoginInput,
  RegisterInput,
  registerSchema,
  ResetPasswordInput,
  resetPasswordSchema
} from '../schemas/auth.schema';
import { ErrorActionResult } from './action.type';
import { AuthApi } from '../api/auth.api';
import { ApiError } from '../api/api-error';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '../auth';
import { CredentialsSignin } from 'next-auth';

export async function registerAction(
  input: RegisterInput
): Promise<ErrorActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: z.flattenError(parsed.error),
      code: 'VALIDATION_ERROR'
    };
  }
  try {
    await AuthApi.register(parsed.data);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.statusCode === 409) {
        return {
          success: false,
          message: 'Email already in use',
          code: 'EMAIL_ALREADY_EXISTS'
        };
      }
    }
    throw error;
  }

  redirect('/login');
}

export async function loginAction(
  input: LoginInput
): Promise<ErrorActionResult> {
  try {
    await signIn('credentials', { ...input, redirect: false });
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return {
        success: false,
        message: 'Email or password is invalid.',
        code: 'INVALID_CREDENTIALS'
      };
    }
    throw error;
  }
  redirect('/');
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: '/login' });
}

type ForgotPasswordResult = ErrorActionResult | { success: true };

export async function forgotPasswordAction(
  input: ForgotPasswordInput
): Promise<ForgotPasswordResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: z.flattenError(parsed.error),
      code: 'VALIDATION_ERROR'
    };
  }

  try {
    await AuthApi.forgotPassword(parsed.data);
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

  return { success: true };
}

export async function resetPasswordAction(
  input: ResetPasswordInput
): Promise<ErrorActionResult | void> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: z.flattenError(parsed.error),
      code: 'VALIDATION_ERROR'
    };
  }

  try {
    await AuthApi.resetPassword(parsed.data);
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

  redirect('/login');
}
