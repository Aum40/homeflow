import { UserResponse, UserRole } from './api.type';
import { authFetch } from './auth-fetch';
import {
  ChangePasswordInput,
  UpdateProfileInput
} from '../schemas/user.schema';

export const UserApi = {
  async getAll() {
    return authFetch<UserResponse[]>('/users');
  },

  async getCustomers() {
    return authFetch<UserResponse[]>('/users/customers');
  },

  async updateRole(userId: string, role: UserRole) {
    return authFetch<UserResponse>(`/users/${userId}/role`, {
      method: 'PATCH',
      body: { role }
    });
  },

  async updateStatus(userId: string, isActive: boolean) {
    return authFetch<UserResponse>(`/users/${userId}/status`, {
      method: 'PATCH',
      body: { isActive }
    });
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return authFetch<string>('/users/me/avatar', {
      method: 'PATCH',
      body: formData
    });
  },

  async updateProfile(data: UpdateProfileInput) {
    return authFetch<UserResponse>('/users/me', {
      method: 'PATCH',
      body: data
    });
  },

  async changePassword(data: ChangePasswordInput) {
    return authFetch<{ message: string }>('/users/me/password', {
      method: 'PATCH',
      body: data
    });
  }
};
