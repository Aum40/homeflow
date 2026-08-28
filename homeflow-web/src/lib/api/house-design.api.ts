import { HouseDesignResponse } from './api.type';
import { authFetch } from './auth-fetch';
import {
  CreateHouseDesignInput,
  UpdateHouseDesignInput
} from '../schemas/house-design.schema';

export const HouseDesignApi = {
  async getAll() {
    return authFetch<HouseDesignResponse[]>('/house-designs');
  },

  async getById(houseDesignId: string) {
    return authFetch<HouseDesignResponse>(`/house-designs/${houseDesignId}`);
  },

  async create(data: CreateHouseDesignInput) {
    return authFetch<HouseDesignResponse>('/house-designs', {
      method: 'POST',
      body: data
    });
  },

  async update(houseDesignId: string, data: UpdateHouseDesignInput) {
    return authFetch<HouseDesignResponse>(`/house-designs/${houseDesignId}`, {
      method: 'PATCH',
      body: data
    });
  },

  async remove(houseDesignId: string) {
    return authFetch<{ message: string }>(
      `/house-designs/${houseDesignId}`,
      { method: 'DELETE' }
    );
  },

  async uploadImage(houseDesignId: string, imageUrl: string) {
    return authFetch<HouseDesignResponse>(
      `/house-designs/${houseDesignId}/image`,
      { method: 'PATCH', body: { imageUrl } }
    );
  }
};
