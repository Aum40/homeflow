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
import {
  createMaterialAction,
  updateMaterialAction,
  uploadMaterialImageAction
} from '@/lib/actions/material.action';
import { MaterialResponse } from '@/lib/api/api.type';
import {
  CreateMaterialInput,
  createMaterialSchema
} from '@/lib/schemas/material.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkUploadSize } from '@/lib/utils';
import { Camera, Pencil, Plus } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ImageWithPlaceholder from '@/components/shared/ImageWithPlaceholder';

export default function MaterialFormDialog({
  material
}: {
  material?: MaterialResponse;
}) {
  const isEdit = !!material;
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputEl = useRef<HTMLInputElement | null>(null);

  const { control, handleSubmit, reset } = useForm<CreateMaterialInput>({
    resolver: zodResolver(createMaterialSchema),
    defaultValues: {
      name: material?.name ?? '',
      category: material?.category ?? '',
      unit: material?.unit ?? '',
      price: material ? Number(material.price) : 0,
      stock: material?.stock ?? 0
    }
  });

  const previewSrc = imageFile
    ? URL.createObjectURL(imageFile)
    : (material?.imageUrl ?? null);

  const onSubmit = (data: CreateMaterialInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateMaterialAction(material.id, data)
        : await createMaterialAction(data);

      if (result && 'success' in result && result.success === false) {
        setErrorMessage(result.message);
        return;
      }

      const materialId = isEdit ? material.id : (result as MaterialResponse).id;

      if (imageFile) {
        const uploadResult = await uploadMaterialImageAction(
          materialId,
          imageFile
        );
        if (uploadResult?.success === false) {
          setErrorMessage(uploadResult.message);
          return;
        }
      }

      setOpen(false);
      if (!isEdit) {
        reset();
        setImageFile(null);
      }
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
          isEdit ? (
            <Button variant="ghost" size="icon-sm" aria-label="แก้ไขวัสดุ" />
          ) : (
            <Button className="w-fit">
              <Plus className="mr-1 size-4" />
              เพิ่มวัสดุ
            </Button>
          )
        }
      >
        {isEdit && <Pencil className="size-4" />}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'แก้ไขวัสดุ' : 'เพิ่มวัสดุใหม่'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <div className="flex items-center gap-4">
              <ImageWithPlaceholder
                src={previewSrc}
                alt="รูปวัสดุ"
                className="size-28 shrink-0 rounded-lg border border-outline-variant"
              />
              <div>
                <input
                  ref={fileInputEl}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const sizeError = checkUploadSize(file);
                    if (sizeError) {
                      setErrorMessage(sizeError);
                      e.target.value = '';
                      return;
                    }
                    setErrorMessage(null);
                    setImageFile(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputEl.current?.click()}
                >
                  <Camera className="mr-1 size-4" />
                  เลือกรูปภาพ
                </Button>
              </div>
            </div>
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field className="gap-1" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>ชื่อวัสดุ</FieldLabel>
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
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="category"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>หมวดหมู่</FieldLabel>
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
              <Controller
                control={control}
                name="unit"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>หน่วย</FieldLabel>
                    <Input
                      placeholder="เช่น ถุง, ลูกบาศก์เมตร"
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Controller
                control={control}
                name="price"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>ราคาต่อหน่วย (บาท)</FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      id={field.name}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="stock"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>คงเหลือในสต็อก</FieldLabel>
                    <Input
                      type="number"
                      id={field.name}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <Field>
              {errorMessage && (
                <p className="text-sm text-destructive">{errorMessage}</p>
              )}
            </Field>
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
