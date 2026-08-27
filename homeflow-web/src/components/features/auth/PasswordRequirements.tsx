'use client';

import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

const PASSWORD_RULES = [
  { label: 'อย่างน้อย 8 ตัวอักษร', test: (v: string) => v.length >= 8 },
  { label: 'มีตัวพิมพ์เล็ก (a-z)', test: (v: string) => /[a-z]/.test(v) },
  { label: 'มีตัวพิมพ์ใหญ่ (A-Z)', test: (v: string) => /[A-Z]/.test(v) },
  {
    label: 'มีอักขระพิเศษ (!@#$%)',
    test: (v: string) => /[!-\/:-@[-`{-~]/.test(v),
  },
  {
    // ต้องเป็นอักขระ ASCII ที่พิมพ์ได้เท่านั้น (ห้ามภาษาไทยและช่องว่าง)
    label: 'ใช้ภาษาอังกฤษเท่านั้น',
    test: (v: string) => v.length > 0 && /^[!-~]+$/.test(v),
  },
];

export default function PasswordRequirements({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        'grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-1',
        className
      )}
    >
      {PASSWORD_RULES.map(({ label, test }) => {
        const passed = test(value ?? '');
        return (
          <li
            key={label}
            className={cn(
              'flex items-center gap-1.5 text-xs transition-colors',
              passed ? 'text-green-600' : 'text-on-surface-variant'
            )}
          >
            {passed ? (
              <Check className='size-3.5 shrink-0' aria-hidden />
            ) : (
              <X className='size-3.5 shrink-0 text-outline' aria-hidden />
            )}
            <span>{label}</span>
            <span className='sr-only'>
              {passed ? '(ผ่านเงื่อนไข)' : '(ยังไม่ผ่านเงื่อนไข)'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
