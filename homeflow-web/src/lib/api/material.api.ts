import { MaterialResponse } from './api.type';
import { authFetch } from './auth-fetch';
import {
  CreateMaterialInput,
  UpdateMaterialInput
} from '../schemas/material.schema';

export const MaterialApi = {
  async getAll() {
    return authFetch<MaterialResponse[]>('/materials');
  },

  async getById(materialId: string) {
    return authFetch<MaterialResponse>(`/materials/${materialId}`);
  },

  async create(data: CreateMaterialInput) {
    return authFetch<MaterialResponse>('/materials', {
      method: 'POST',
      body: data
    });
  },

  async update(materialId: string, data: UpdateMaterialInput) {
    return authFetch<MaterialResponse>(`/materials/${materialId}`, {
      method: 'PATCH',
      body: data
    });
  },

  async remove(materialId: string) {
    return authFetch<{ message: string }>(`/materials/${materialId}`, {
      method: 'DELETE'
    });
  },

  async uploadImage(materialId: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return authFetch<MaterialResponse>(`/materials/${materialId}/image`, {
      method: 'PATCH',
      body: formData
    });
  }
};
