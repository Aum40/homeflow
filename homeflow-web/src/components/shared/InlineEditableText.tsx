'use client';

import { cn } from '@/lib/utils';
import { Check, Loader2, Pencil, X } from 'lucide-react';
import { useState, useTransition } from 'react';

export default function InlineEditableText({
  value,
  onSave,
  inputClassName,
  placeholder
}: {
  value: string;
  onSave: (
    value: string
  ) => Promise<{ success: false; message: string } | void>;
  inputClassName?: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const startEdit = () => {
    setDraft(value);
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError(null);
  };

  const save = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setError('ห้ามเว้นว่าง');
      return;
    }
    startTransition(async () => {
      const result = await onSave(trimmed);
      if (result && result.success === false) {
        setError(result.message);
        return;
      }
      setEditing(false);
    });
  };

  if (!editing) {
    return (
      <span className="group inline-flex items-center gap-2">
        <span>{value}</span>
        <button
          type="button"
          onClick={startEdit}
          className="text-on-surface-variant opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary"
          aria-label="แก้ไข"
        >
          <Pencil className="size-3.5" />
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col gap-1 align-middle">
      <span className="inline-flex items-center gap-1.5">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') cancel();
          }}
          placeholder={placeholder}
          disabled={isPending}
          className={cn(
            'rounded border border-outline-variant bg-surface-container-lowest px-2 py-0.5 text-sm text-on-surface outline-none focus:border-primary',
            inputClassName
          )}
        />
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="text-green-600 hover:text-green-700 disabled:opacity-50"
          aria-label="บันทึก"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={isPending}
          className="text-destructive hover:text-destructive/80 disabled:opacity-50"
          aria-label="ยกเลิก"
        >
          <X className="size-4" />
        </button>
      </span>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </span>
  );
}
