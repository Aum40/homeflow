'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import z from 'zod';
import { ApiError } from '../api/api-error';
import { ProjectApi } from '../api/project.api';
import {
  CreateChecklistItemInput,
  createChecklistItemSchema,
  CreateProjectInput,
  createProjectSchema,
  UpdateChecklistItemInput,
  updateChecklistItemSchema,
  UpdateProjectDatesInput,
  updateProjectDatesSchema,
  UpdateProjectInfoInput,
  updateProjectInfoSchema,
  WithdrawMaterialInput,
  withdrawMaterialSchema
} from '../schemas/project.schema';
import { ErrorActionResult } from './action.type';

export async function createProjectAction(
  input: CreateProjectInput
): Promise<ErrorActionResult> {
  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: z.flattenError(parsed.error),
      code: 'VALIDATION_ERROR'
    };
  }

  try {
    await ProjectApi.create(parsed.data);
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

  redirect('/');
}

export async function updateProjectDatesAction(
  projectId: string,
  input: UpdateProjectDatesInput
): Promise<ErrorActionResult | void> {
  const parsed = updateProjectDatesSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: z.flattenError(parsed.error),
      code: 'VALIDATION_ERROR'
    };
  }

  try {
    await ProjectApi.updateDates(projectId, parsed.data);
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
  revalidatePath(`/projects/${projectId}`);
}

export async function updateProjectInfoAction(
  projectId: string,
  input: UpdateProjectInfoInput
): Promise<ErrorActionResult | void> {
  const parsed = updateProjectInfoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: z.flattenError(parsed.error),
      code: 'VALIDATION_ERROR'
    };
  }

  try {
    await ProjectApi.updateInfo(projectId, parsed.data);
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
  revalidatePath('/');
  revalidatePath('/progress');
  revalidatePath(`/projects/${projectId}`);
}

export async function uploadProjectImageAction(
  projectId: string,
  file: File
): Promise<ErrorActionResult | void> {
  try {
    await ProjectApi.uploadImage(projectId, file);
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
  revalidatePath('/');
  revalidatePath('/progress');
  revalidatePath(`/projects/${projectId}`);
}

export async function closeProjectAction(
  projectId: string
): Promise<ErrorActionResult | void> {
  try {
    await ProjectApi.close(projectId);
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
  revalidatePath('/');
  revalidatePath('/progress');
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteProjectAction(
  projectId: string
): Promise<ErrorActionResult | void> {
  try {
    await ProjectApi.remove(projectId);
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
  revalidatePath('/');
  revalidatePath('/progress');
  redirect('/');
}

export async function withdrawMaterialAction(
  projectId: string,
  materialId: string,
  input: WithdrawMaterialInput
): Promise<ErrorActionResult | void> {
  const parsed = withdrawMaterialSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: z.flattenError(parsed.error),
      code: 'VALIDATION_ERROR'
    };
  }

  try {
    await ProjectApi.withdrawMaterial(projectId, materialId, parsed.data);
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
  revalidatePath(`/projects/${projectId}`);
}

export async function addChecklistItemAction(
  projectId: string,
  input: CreateChecklistItemInput
): Promise<ErrorActionResult | void> {
  const parsed = createChecklistItemSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: z.flattenError(parsed.error),
      code: 'VALIDATION_ERROR'
    };
  }

  try {
    await ProjectApi.addChecklistItem(projectId, parsed.data);
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
  revalidatePath(`/projects/${projectId}`);
}

export async function reorderChecklistItemAction(
  projectId: string,
  itemIds: string[]
): Promise<ErrorActionResult | void> {
  try {
    await ProjectApi.reorderChecklist(projectId, itemIds);
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
  revalidatePath(`/projects/${projectId}`);
}

export async function updateChecklistItemAction(
  projectId: string,
  itemId: string,
  input: UpdateChecklistItemInput
): Promise<ErrorActionResult | void> {
  const parsed = updateChecklistItemSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      errors: z.flattenError(parsed.error),
      code: 'VALIDATION_ERROR'
    };
  }

  try {
    await ProjectApi.updateChecklistItem(projectId, itemId, parsed.data);
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
  revalidatePath(`/projects/${projectId}`);
}

export async function toggleChecklistItemAction(
  projectId: string,
  itemId: string,
  isCompleted: boolean
): Promise<ErrorActionResult | void> {
  try {
    await ProjectApi.toggleChecklistItem(projectId, itemId, isCompleted);
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
  revalidatePath(`/projects/${projectId}`);
}

export async function removeChecklistItemAction(
  projectId: string,
  itemId: string
): Promise<ErrorActionResult | void> {
  try {
    await ProjectApi.removeChecklistItem(projectId, itemId);
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
  revalidatePath(`/projects/${projectId}`);
}

export async function removeChecklistItemPhotoAction(
  projectId: string,
  itemId: string,
  photoId: string
): Promise<ErrorActionResult | void> {
  try {
    await ProjectApi.removeChecklistItemPhoto(projectId, itemId, photoId);
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
  revalidatePath(`/projects/${projectId}`);
}

export async function uploadChecklistItemPhotosAction(
  projectId: string,
  itemId: string,
  files: File[]
): Promise<ErrorActionResult | void> {
  try {
    await ProjectApi.uploadChecklistItemPhotos(projectId, itemId, files);
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
  revalidatePath(`/projects/${projectId}`);
}
