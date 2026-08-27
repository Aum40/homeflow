import { UpdateCompanyContactInput } from '../schemas/company-contact.schema';
import { CompanyContactResponse } from './api.type';
import { authFetch } from './auth-fetch';

/** เหมือน input ของฟอร์ม แต่ยอมให้เป็น null ได้ เพราะ action แปลง '' เป็น null ก่อนส่ง */
export type UpdateCompanyContactPayload = {
  [K in keyof UpdateCompanyContactInput]: UpdateCompanyContactInput[K] | null;
};

export const CompanyContactApi = {
  async get() {
    return authFetch<CompanyContactResponse>('/company-contact');
  },

  async update(data: UpdateCompanyContactPayload) {
    return authFetch<CompanyContactResponse>('/company-contact', {
      method: 'PATCH',
      body: data
    });
  }
};
