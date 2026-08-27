'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { withdrawMaterialAction } from '@/lib/actions/project.action';
import {
  WithdrawMaterialInput,
  withdrawMaterialSchema
} from '@/lib/schemas/project.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { PackageMinus } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

export default function WithdrawMaterialDialog({
  projectId,
  materialId,
  materialName,
  unit,
  stock
}: {
  projectId: string;
  materialId: string;
  materialName: string;
  unit: string;
  stock: number;
}) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<WithdrawMaterialInput>({
    resolver: zodResolver(withdrawMaterialSchema),
    defaultValues: { qty: 1 }
  });

  const onSubmit = (data: WithdrawMaterialInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await withdrawMaterialAction(projectId, materialId, data);
      if (result?.success === false) {
        setErrorMessage(result.message);
        return;
      }
      setOpen(false);
      reset();
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
        render={
          <Button
            variant="outline"
            size="sm"
            disabled={stock <= 0}
            aria-label="เบิกวัสดุ"
          />
        }
      >
        <PackageMinus className="mr-1 size-4" />
        เบิกวัสดุ
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เบิกวัสดุ: {materialName}</DialogTitle>
          <DialogDescription>
            คงเหลือในสต็อก {stock} {unit}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Controller
              control={control}
              name="qty"
              render={({ field, fieldState }) => (
                <Field className="gap-1" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    จำนวนที่ต้องการเบิก ({unit})
                  </FieldLabel>
                  <Input
                    type="number"
                    max={stock}
                    id={field.name}
                    {...field}
                    value={Number.isNaN(field.value) ? '' : field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
              {isPending ? 'กำลังเบิก...' : 'ยืนยันการเบิก'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
