import { Transform } from 'class-transformer';

/**
 * แปลงสตริงว่าง (หรือมีแต่ช่องว่าง) เป็น null เพื่อให้ field ที่ผู้ใช้ลบข้อมูลออก
 * ถูกเคลียร์เป็น NULL จริง แทนที่จะเก็บ '' ไว้ — และเพื่อให้ @IsOptional() ข้ามการ
 * ตรวจ (เช่น @IsEmail) ได้ เพราะ @IsOptional() ข้ามแค่ undefined/null ไม่ข้าม ''
 */
export function EmptyToNull() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  });
}
