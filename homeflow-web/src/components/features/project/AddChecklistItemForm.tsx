'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addChecklistItemAction } from '@/lib/actions/project.action';
import { Loader2, Plus } from 'lucide-react';
import { useState, useTransition } from 'react';

export default function AddChecklistItemForm({
  projectId
}: {
  projectId: string;
}) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setError(null);
    startTransition(async () => {
      const result = await addChecklistItemAction(projectId, { title });
      if (result?.success === false) {
        setError(result.message);
        return;
      }
      setTitle('');
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <div className="flex-1">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="เช่น เทฐานรากเสร็จ"
          disabled={isPending}
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
      <Button
        type="submit"
        size="sm"
        className="whitespace-nowrap"
        disabled={isPending || !title.trim()}
      >
        {isPending ? (
          <Loader2 className="mr-1 size-4 animate-spin" />
        ) : (
          <Plus className="mr-1 size-4" />
        )}
        {isPending ? 'กำลังเพิ่ม...' : 'เพิ่มรายการ'}
      </Button>
    </form>
  );
}
