import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeFirstCha(input?: string) {
  return (
    input && `${input.charAt(0).toUpperCase()}${input.slice(1).toLowerCase()}`
  );
}

export function toDownloadUrl(imageUrl: string) {
  return imageUrl.includes('/upload/')
    ? imageUrl.replace('/upload/', '/upload/fl_attachment/')
    : imageUrl;
}

/**
 * ต้องไม่เกิน experimental.serverActions.bodySizeLimit ใน next.config.ts
 * เพราะรูปถูกส่งผ่าน Server Action ถ้าเกินจะล้มเหลวก่อนถึง backend
 */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** คืนข้อความ error ถ้าไฟล์ใหญ่เกินกำหนด, คืน null ถ้าผ่าน */
export function checkUploadSize(files: File | File[]): string | null {
  const list = Array.isArray(files) ? files : [files];
  const total = list.reduce((sum, file) => sum + file.size, 0);
  if (total <= MAX_UPLOAD_BYTES) return null;

  const limit = formatFileSize(MAX_UPLOAD_BYTES);
  return list.length > 1
    ? `ไฟล์รวมกัน ${formatFileSize(total)} ใหญ่เกิน ${limit} — กรุณาเลือกจำนวนน้อยลงหรือย่อขนาดรูปก่อน`
    : `ไฟล์ขนาด ${formatFileSize(total)} ใหญ่เกิน ${limit} — กรุณาย่อขนาดรูปก่อนอัปโหลด`;
}
