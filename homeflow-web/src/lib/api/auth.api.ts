import {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput
} from '../schemas/auth.schema';
import { apiFetch } from './api-fetch';
import { authFetch } from './auth-fetch';
import { LoginResponse, UserResponse } from './api.type';

export const AuthApi = {
  register(data: RegisterInput) {
    return apiFetch<void>('/auth/register', {
      method: 'POST',
      body: data
    });
  },

  login(data: LoginInput) {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: data
    });
  },

  getMe() {
    return authFetch<UserResponse>('/auth/me');
  },

  forgotPassword(data: ForgotPasswordInput) {
    return apiFetch<void>('/auth/forgot-password', {
      method: 'POST',
      body: data
    });
  },

  resetPassword(data: ResetPasswordInput) {
    return apiFetch<void>('/auth/reset-password', {
      method: 'POST',
      body: data
    });
  },

  verifyResetToken(token: string) {
    return apiFetch<{ valid: boolean }>(
      `/auth/verify-reset-token?token=${encodeURIComponent(token)}`
    );
  }
};
