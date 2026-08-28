import { getUploadSignatureAction } from '../actions/upload.action';

/**
 * อัปไฟล์เข้า Cloudinary จากเบราว์เซอร์โดยตรง
 *
 * เดิมไฟล์วิ่งผ่าน Server Action ของ Next แล้วต่อไป backend แต่ Vercel
 * จำกัด request body ของ serverless function ไว้ที่ 4.5MB ซึ่ง config ของ
 * Next override ไม่ได้ รูปจากมือถือที่มักใหญ่ 2-8MB จึงอัปไม่ผ่านบน production
 * เส้นทางนี้ตัด Vercel ออกจากทางเดินของไฟล์ทั้งหมด
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const signature = await getUploadSignatureAction();
  if ('success' in signature) {
    throw new Error(signature.message);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signature.apiKey);
  formData.append('timestamp', String(signature.timestamp));
  formData.append('folder', signature.folder);
  formData.append('signature', signature.signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    throw new Error('อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
  }

  const result: { secure_url?: string } = await response.json();
  if (!result.secure_url) {
    throw new Error('อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
  }

  return result.secure_url;
}

/** อัปหลายไฟล์พร้อมกัน คืน URL ตามลำดับเดิม */
export function uploadImagesToCloudinary(files: File[]): Promise<string[]> {
  return Promise.all(files.map((file) => uploadImageToCloudinary(file)));
}
