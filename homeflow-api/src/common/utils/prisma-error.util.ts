import { PrismaClientKnownRequestError } from '@/database/generated/prisma/internal/prismaNamespace';

/**
 * Prisma 7's driver-adapter runtime surfaces an explicit `onDelete: Restrict`
 * FK violation as a raw Postgres error (SQLSTATE 23001, restrict_violation)
 * instead of wrapping it into `PrismaClientKnownRequestError` (P2003) like a
 * default (no onDelete specified) FK violation (SQLSTATE 23503) does. Check
 * both so delete-guards behave the same regardless of which path fired.
 */
export function isForeignKeyRestrictViolation(error: unknown): boolean {
  if (
    error instanceof PrismaClientKnownRequestError &&
    error.code === 'P2003'
  ) {
    return true;
  }

  const pgCode = (error as { cause?: { code?: string } })?.cause?.code;
  return pgCode === '23503' || pgCode === '23001';
}
