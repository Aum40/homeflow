'use server';

import { ApiError } from '../api/api-error';
import { UploadSignatureResponse } from '../api/api.type';
import { UploadApi } from '../api/upload.api';
import { ErrorActionResult } from './action.type';

export async function getUploadSignatureAction(): Promise<
  ErrorActionResult | UploadSignatureResponse
> {
  try {
    return await UploadApi.createSignature();
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
