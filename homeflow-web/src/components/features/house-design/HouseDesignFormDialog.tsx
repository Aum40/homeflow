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
  createHouseDesignAction,
  updateHouseDesignAction,
  uploadHouseDesignImageAction
} from '@/lib/actions/house-design.action';
import { HouseDesignResponse } from '@/lib/api/api.type';
import {
  CreateHouseDesignInput,
  createHouseDesignSchema
} from '@/lib/schemas/house-design.schema';
import { checkUploadSize } from '@/lib/utils';
import { uploadImageToCloudinary } from '@/lib/upload/cloudinary-upload';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Camera, Pencil, Plus, X } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import ImageWithPlaceholder from '@/components/shared/ImageWithPlaceholder';

export default function HouseDesignFormDialog({
  houseDesign
}: {
  houseDesign?: HouseDesignResponse;
}) {
  const isEdit = !!houseDesign;
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [steps, setSteps] = useState<string[]>(houseDesign?.steps ?? []);
  const [isPending, startTransition] = useTransition();
  const fileInputEl = useRef<HTMLInputElement | null>(null);

  const addStep = () => setSteps((prev) => [...prev, '']);
  const removeStep = (index: number) =>
    setSteps((prev) => prev.filter((_, i) => i !== index));
  const updateStep = (index: number, value: string) =>
    setSteps((prev) => prev.map((step, i) => (i === index ? value : step)));
  const moveStep = (index: number, direction: -1 | 1) =>
    setSteps((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const { control, handleSubmit, reset } = useForm<CreateHouseDesignInput>({
    resolver: zodResolver(createHouseDesignSchema),
    defaultValues: {
      name: houseDesign?.name ?? '',
      description: houseDesign?.description ?? '',
      basePrice: houseDesign ? Number(houseDesign.basePrice) : 0
    }
  });

  const previewSrc = imageFile
    ? URL.createObjectURL(imageFile)
    : (houseDesign?.imageUrl ?? null);

  const onSubmit = (data: CreateHouseDesignInput) => {
    setErrorMessage(null);
    const payload = {
      ...data,
      steps: steps.map((step) => step.trim()).filter(Boolean)
    };
    startTransition(async () => {
      const result = isEdit
        ? await updateHouseDesignAction(houseDesign.id, payload)
        : await createHouseDesignAction(payload);

      if (result && 'success' in result && result.success === false) {
        setErrorMessage(result.message);
        return;
      }

      const houseDesignId = isEdit
        ? houseDesign.id
        : (result as HouseDesignResponse).id;

      if (imageFile) {
        let imageUrl: string;
        try {
          imageUrl = await uploadImageToCloudinary(imageFile);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'อัปโหลดรูปไม่สำเร็จ'
        );
        return;
      }

        const uploadResult = await uploadHouseDesignImageAction(houseDesignId, imageUrl);
        if (uploadResult?.success === false) {
          setErrorMessage(uploadResult.message);
          return;
        }
      }

      setOpen(false);
      if (!isEdit) {
        reset();
        setImageFile(null);
        setSteps([]);
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
            <Button variant="ghost" size="icon-sm" aria-label="แก้ไขแบบบ้าน" />
          ) : (
            <Button className="w-fit">
              <Plus className="mr-1 size-4" />
              เพิ่มแบบบ้าน
            </Button>
          )
        }
      >
        {isEdit && <Pencil className="size-4" />}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'แก้ไขแบบบ้าน' : 'เพิ่มแบบบ้านใหม่'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <div className="flex items-center gap-4">
              <ImageWithPlaceholder
                src={previewSrc}
                alt="รูปแบบบ้าน"
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
                  <FieldLabel htmlFor={field.name}>ชื่อแบบบ้าน</FieldLabel>
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
              name="description"
              render={({ field, fieldState }) => (
                <Field className="gap-1" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>รายละเอียด</FieldLabel>
                  <Input
                    placeholder="เช่น 2 ห้องนอน 1 ห้องน้ำ พื้นที่ใช้สอย 50 ตร.ม."
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
              name="basePrice"
              render={({ field, fieldState }) => (
                <Field className="gap-1" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    ราคาเริ่มต้น (บาท)
                  </FieldLabel>
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
            <Field className="gap-2">
              <FieldLabel>ขั้นตอนมาตรฐาน</FieldLabel>
              <p className="text-xs text-on-surface-variant">
                ขั้นตอนเหล่านี้จะถูกเพิ่มเป็นเช็คลิสต์ให้อัตโนมัติทุกครั้งที่
                PM สร้างโครงการจากแบบนี้
              </p>
              <div className="flex flex-col gap-2">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-sm text-on-surface-variant">
                      {index + 1}.
                    </span>
                    <Input
                      value={step}
                      onChange={(e) => updateStep(index, e.target.value)}
                      placeholder="เช่น เทฐานราก"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="เลื่อนขึ้น"
                      disabled={index === 0}
                      onClick={() => moveStep(index, -1)}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="เลื่อนลง"
                      disabled={index === steps.length - 1}
                      onClick={() => moveStep(index, 1)}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="ลบขั้นตอนนี้"
                      onClick={() => removeStep(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={addStep}
              >
                <Plus className="mr-1 size-4" />
                เพิ่มขั้นตอน
              </Button>
            </Field>
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
