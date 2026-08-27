'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { updateChecklistItemAction } from '@/lib/actions/project.action';
import { ChecklistItemResponse } from '@/lib/api/api.type';
import {
  UpdateChecklistItemInput,
  updateChecklistItemSchema
} from '@/lib/schemas/project.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function EditChecklistItemDialog({
  projectId,
  item
}: {
  projectId: string;
  item: ChecklistItemResponse;
}) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit } = useForm<UpdateChecklistItemInput>({
    resolver: zodResolver(updateChecklistItemSchema),
    defaultValues: { title: item.title }
  });

  const onSubmit = (data: UpdateChecklistItemInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await updateChecklistItemAction(projectId, item.id, data);
      if (result?.success === false) {
        setErrorMessage(result.message);
        return;
      }
      setOpen(false);
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setErrorMessage(null);
      }}
    >
      <DialogTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label="แก้ไขรายการ" />}
      >
        <Pencil className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขรายการ</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Controller
              control={control}
              name="title"
              render={({ field, fieldState }) => (
                <Field className="gap-1" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>ชื่อรายการ</FieldLabel>
                  <Input
                    id={field.name}
                    {...field}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
