import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    role?: 'ADMIN' | 'PROJECT_MANAGER' | 'CUSTOMER';
    access_token?: string;
    avatarUrl?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
    firstName?: string;
    lastName?: string;
    role?: 'ADMIN' | 'PROJECT_MANAGER' | 'CUSTOMER';
    access_token?: string;
    avatarUrl?: string | null;
  }
}
