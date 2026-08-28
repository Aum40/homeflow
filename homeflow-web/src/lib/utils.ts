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
 * เพดานขนาดต่อไฟล์ของ Cloudinary (บัญชี free)
 * ไม่ผูกกับ Server Action แล้ว เพราะเบราว์เซอร์อัปเข้า Cloudinary โดยตรง
 */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * คืนข้อความ error ถ้ามีไฟล์ใดไฟล์หนึ่งใหญ่เกินกำหนด, คืน null ถ้าผ่าน
 * เช็ครายไฟล์ไม่ใช่ผลรวม เพราะแต่ละไฟล์ถูกอัปแยก request กัน
 */
export function checkUploadSize(files: File | File[]): string | null {
  const list = Array.isArray(files) ? files : [files];
  const oversized = list.find((file) => file.size > MAX_UPLOAD_BYTES);
  if (!oversized) return null;

  const limit = formatFileSize(MAX_UPLOAD_BYTES);
  return `ไฟล์ขนาด ${formatFileSize(oversized.size)} ใหญ่เกิน ${limit} — กรุณาย่อขนาดรูปก่อนอัปโหลด`;
}
