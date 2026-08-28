import {
  BudgetResponse,
  ChecklistItemResponse,
  MaterialWithdrawalResponse,
  ProjectMaterialResponse,
  ProjectResponse,
  ProjectStatus
} from './api.type';
import { authFetch } from './auth-fetch';
import {
  CreateChecklistItemInput,
  CreateProjectInput,
  UpdateChecklistItemInput,
  UpdateProjectDatesInput,
  UpdateProjectInfoInput,
  WithdrawMaterialInput
} from '../schemas/project.schema';

export const ProjectApi = {
  async create(data: CreateProjectInput) {
    return authFetch<ProjectResponse>('/projects', {
      method: 'POST',
      body: data
    });
  },

  async getMine() {
    return authFetch<ProjectResponse[]>('/projects');
  },

  async getManaged() {
    return authFetch<ProjectResponse[]>('/projects/managed');
  },

  async getAll() {
    return authFetch<ProjectResponse[]>('/projects/all');
  },

  async getById(projectId: string) {
    return authFetch<ProjectResponse>(`/projects/${projectId}`);
  },

  async updateDates(projectId: string, data: UpdateProjectDatesInput) {
    return authFetch<ProjectResponse>(`/projects/${projectId}`, {
      method: 'PATCH',
      body: data
    });
  },

  async updateInfo(projectId: string, data: UpdateProjectInfoInput) {
    return authFetch<ProjectResponse>(`/projects/${projectId}`, {
      method: 'PATCH',
      body: data
    });
  },

  async uploadImage(projectId: string, imageUrl: string) {
    return authFetch<ProjectResponse>(`/projects/${projectId}/image`, {
      method: 'PATCH',
      body: { imageUrl }
    });
  },

  async remove(projectId: string) {
    return authFetch<{ message: string }>(`/projects/${projectId}`, {
      method: 'DELETE'
    });
  },

  async close(projectId: string) {
    return authFetch<ProjectResponse>(`/projects/${projectId}`, {
      method: 'PATCH',
      body: { status: 'COMPLETED' satisfies ProjectStatus }
    });
  },

  // --- Material usage ---

  async getMaterials(projectId: string) {
    return authFetch<ProjectMaterialResponse[]>(
      `/projects/${projectId}/materials`
    );
  },

  // --- Material withdrawal ---

  async withdrawMaterial(
    projectId: string,
    materialId: string,
    data: WithdrawMaterialInput
  ) {
    return authFetch<MaterialWithdrawalResponse>(
      `/projects/${projectId}/materials/${materialId}/withdraw`,
      { method: 'POST', body: data }
    );
  },

  async getWithdrawalHistory(projectId: string) {
    return authFetch<MaterialWithdrawalResponse[]>(
      `/projects/${projectId}/withdrawals`
    );
  },

  // --- Progress checklist ---

  async addChecklistItem(projectId: string, data: CreateChecklistItemInput) {
    return authFetch<ChecklistItemResponse>(
      `/projects/${projectId}/checklist`,
      { method: 'POST', body: data }
    );
  },

  async getChecklist(projectId: string) {
    return authFetch<ChecklistItemResponse[]>(
      `/projects/${projectId}/checklist`
    );
  },

  async reorderChecklist(projectId: string, itemIds: string[]) {
    return authFetch<ChecklistItemResponse[]>(
      `/projects/${projectId}/checklist/reorder`,
      { method: 'PATCH', body: { itemIds } }
    );
  },

  async updateChecklistItem(
    projectId: string,
    itemId: string,
    data: UpdateChecklistItemInput
  ) {
    return authFetch<ChecklistItemResponse>(
      `/projects/${projectId}/checklist/${itemId}`,
      { method: 'PATCH', body: data }
    );
  },

  async toggleChecklistItem(
    projectId: string,
    itemId: string,
    isCompleted: boolean
  ) {
    return authFetch<ChecklistItemResponse>(
      `/projects/${projectId}/checklist/${itemId}/complete`,
      { method: 'PATCH', body: { isCompleted } }
    );
  },

  async removeChecklistItem(projectId: string, itemId: string) {
    return authFetch<{ message: string }>(
      `/projects/${projectId}/checklist/${itemId}`,
      { method: 'DELETE' }
    );
  },

  async uploadChecklistItemPhotos(
    projectId: string,
    itemId: string,
    imageUrls: string[]
  ) {
    return authFetch<ChecklistItemResponse>(
      `/projects/${projectId}/checklist/${itemId}/photos`,
      { method: 'POST', body: { imageUrls } }
    );
  },

  async removeChecklistItemPhoto(
    projectId: string,
    itemId: string,
    photoId: string
  ) {
    return authFetch<ChecklistItemResponse>(
      `/projects/${projectId}/checklist/${itemId}/photos/${photoId}`,
      { method: 'DELETE' }
    );
  },

  // --- Budget tracking ---

  async getBudget(projectId: string) {
    return authFetch<BudgetResponse>(`/projects/${projectId}/budget`);
  }
};
