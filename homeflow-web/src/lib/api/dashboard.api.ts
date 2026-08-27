import { DashboardResponse } from './api.type';
import { authFetch } from './auth-fetch';

export const DashboardApi = {
  async get() {
    return authFetch<DashboardResponse>('/dashboard');
  }
};
