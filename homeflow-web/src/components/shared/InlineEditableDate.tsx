'use client';

import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';

// หน่วงพอให้พิมพ์วัน/ปีจนจบก่อน ค่อยยิงบันทึก (กด Enter หรือคลิกออกก็บันทึกทันที)
const AUTO_SAVE_DELAY_MS = 1200;
const BUDDHIST_YEAR_OFFSET = 543;
const MIN_BUDDHIST_YEAR = 2400;
const MAX_BUDDHIST_YEAR = 2700;

const THAI_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

type DateParts = { day: string; month: string; year: string };

const EMPTY_PARTS: DateParts = { day: '', month: '', year: '' };

// รับค่า ค.ศ. รูปแบบ YYYY-MM-DD แล้วแตกเป็นวัน/เดือน/ปี พ.ศ. สำหรับช่องกรอก
function toParts(value: string): DateParts {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return EMPTY_PARTS;
  const [year, month, day] = value.split('-');
  return {
    day: String(Number(day)),
    month: String(Number(month)),
    year: String(Number(year) + BUDDHIST_YEAR_OFFSET),
  };
}

// แปลงวัน/เดือน/ปี พ.ศ. กลับเป็น ค.ศ. รูปแบบ YYYY-MM-DD (null = ยังกรอกไม่ครบหรือไม่ถูกต้อง)
function toIsoDate(parts: DateParts): string | null {
  if (parts.year.length !== 4) return null;

  const day = Number(parts.day);
  const month = Number(parts.month);
  const buddhistYear = Number(parts.year);
  if (!day || !month || !buddhistYear) return null;
  if (buddhistYear < MIN_BUDDHIST_YEAR || buddhistYear > MAX_BUDDHIST_YEAR) {
    return null;
  }

  const year = buddhistYear - BUDDHIST_YEAR_OFFSET;
  const date = new Date(Date.UTC(year, month - 1, day));
  // กันวันที่ไม่มีอยู่จริง เช่น 31 ก.พ.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isEmptyParts(parts: DateParts) {
  return !parts.day && !parts.month && !parts.year;
}

export default function InlineEditableDate({
  value,
  onSave,
  min,
  max,
  rangeErrorMessage,
  className,
}: {
  value: string;
  onSave: (
    value: string,
  ) => Promise<{ success: false; message: string } | void>;
  min?: string;
  max?: string;
  rangeErrorMessage?: string;
  className?: string;
}) {
  // หลัง mount ให้ค่าที่กรอกในช่องนี้เป็นแหล่งข้อมูลหลัก
  // (revalidate ของเซิร์ฟเวอร์จะส่งค่าเดียวกับที่เพิ่งบันทึกกลับมาอยู่แล้ว)
  const [parts, setParts] = useState(() => toParts(value));
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState(0);
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCommittedRef = useRef(value);
  // ใช้ตัดผลลัพธ์ของการบันทึกที่ล้าสมัย เผื่อผู้ใช้แก้ค่าใหม่ระหว่างรอเซิร์ฟเวอร์
  const saveSeqRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!savedAt) return;
    const timer = setTimeout(() => setSavedAt(0), 2000);
    return () => clearTimeout(timer);
  }, [savedAt]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const commit = (isoDate: string) => {
    clearTimer();
    if (isoDate === lastCommittedRef.current) return;
    if ((min && isoDate < min) || (max && isoDate > max)) {
      setError(rangeErrorMessage ?? 'วันที่ไม่ถูกต้อง');
      return;
    }

    const previous = lastCommittedRef.current;
    const seq = ++saveSeqRef.current;
    lastCommittedRef.current = isoDate;
    setError(null);
    startTransition(async () => {
      const result = await onSave(isoDate);
      // มีการแก้ไขใหม่กว่าเกิดขึ้นแล้ว ให้ผลลัพธ์ของรอบนี้ตกไป
      if (seq !== saveSeqRef.current) return;
      if (result && result.success === false) {
        lastCommittedRef.current = previous;
        setError(result.message);
        return;
      }
      setSavedAt(Date.now());
    });
  };

  // ช่องกรอกต้องแก้ไขได้ตลอดแม้ระหว่างบันทึก ไม่งั้นโฟกัสหลุดและคีย์ที่พิมพ์ต่อจะหาย
  const update = (patch: Partial<DateParts>, saveNow = false) => {
    const next = { ...parts, ...patch };
    setParts(next);
    setError(null);
    clearTimer();

    const isoDate = toIsoDate(next);
    if (!isoDate) return;
    if (saveNow) {
      commit(isoDate);
      return;
    }
    timerRef.current = setTimeout(() => commit(isoDate), AUTO_SAVE_DELAY_MS);
  };

  // เรียกเมื่อโฟกัสออกจากกลุ่มช่องกรอก หรือกด Enter
  const flush = () => {
    clearTimer();

    const isoDate = toIsoDate(parts);
    if (isoDate) {
      commit(isoDate);
      return;
    }
    if (isEmptyParts(parts)) {
      if (!lastCommittedRef.current) return;
      // API ไม่รองรับการล้างค่าวันที่ จึงคืนค่าเดิมกลับไป
      setParts(toParts(lastCommittedRef.current));
      setError('ไม่สามารถลบวันที่ได้');
      return;
    }

    const buddhistYear = Number(parts.year);
    setError(
      parts.year.length === 4 &&
        (buddhistYear < MIN_BUDDHIST_YEAR || buddhistYear > MAX_BUDDHIST_YEAR)
        ? `กรุณากรอกปีเป็น พ.ศ. เช่น ${new Date().getFullYear() + BUDDHIST_YEAR_OFFSET}`
        : 'วันที่ไม่ถูกต้อง ยังไม่ได้บันทึก',
    );
  };

  const fieldClassName =
    'rounded-md border border-outline-variant bg-surface-container-lowest px-2 py-1 font-bold text-on-surface outline-none focus:border-primary';

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div
        className='flex flex-wrap items-center gap-2'
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) flush();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            flush();
          }
        }}
      >
        <input
          type='text'
          inputMode='numeric'
          maxLength={2}
          placeholder='วัน'
          aria-label='วัน'
          value={parts.day}
          onChange={(event) =>
            update({ day: event.target.value.replace(/\D/g, '').slice(0, 2) })
          }
          className={cn(fieldClassName, 'w-14 text-center')}
        />
        <select
          aria-label='เดือน'
          value={parts.month}
          onChange={(event) => update({ month: event.target.value }, true)}
          className={cn(fieldClassName, 'w-24')}
        >
          <option value=''>เดือน</option>
          {THAI_MONTHS.map((label, index) => (
            <option key={label} value={index + 1}>
              {label}
            </option>
          ))}
        </select>
        <input
          type='text'
          inputMode='numeric'
          maxLength={4}
          placeholder='พ.ศ.'
          aria-label='ปี พ.ศ.'
          value={parts.year}
          onChange={(event) =>
            update({ year: event.target.value.replace(/\D/g, '').slice(0, 4) })
          }
          className={cn(fieldClassName, 'w-20 text-center')}
        />
        <span className='text-xs text-on-surface-variant'>พ.ศ.</span>
        {isPending ? (
          <Loader2 className='size-4 shrink-0 animate-spin text-on-surface-variant' />
        ) : (
          savedAt > 0 && <Check className='size-4 shrink-0 text-green-600' />
        )}
      </div>
      {error && <p className='text-xs text-destructive'>{error}</p>}
    </div>
  );
}
