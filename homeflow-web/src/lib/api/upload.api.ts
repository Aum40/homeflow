import { UploadSignatureResponse } from './api.type';
import { authFetch } from './auth-fetch';

export const UploadApi = {
  async createSignature() {
    return authFetch<UploadSignatureResponse>('/uploads/signature', {
      method: 'POST'
    });
  }
};
