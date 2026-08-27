import { redirect } from 'next/navigation';
import { auth } from '../auth';
import { apiFetch, ApiFetchOptions } from './api-fetch';

export async function authFetch<T>(
  path: string,
  options: Omit<ApiFetchOptions, 'token'> = {}
): Promise<T> {
  const session = await auth();
  if (!session?.user?.access_token) {
    redirect('/login');
  }

  const access_token = session.user.access_token;
  return apiFetch(path, { ...options, token: access_token });
}
