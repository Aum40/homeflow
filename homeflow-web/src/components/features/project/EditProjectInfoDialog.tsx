'use client';

import ImageWithPlaceholder from '@/components/shared/ImageWithPlaceholder';
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
  updateProjectInfoAction,
  uploadProjectImageAction
} from '@/lib/actions/project.action';
import {
  UpdateProjectInfoInput,
  updateProjectInfoSchema
} from '@/lib/schemas/project.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkUploadSize } from '@/lib/utils';
import { Camera, Pencil } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRef, useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

const LocationMapPicker = dynamic(
  () => import('./LocationMapPicker'),
  { ssr: false }
);

export default function EditProjectInfoDialog({
  projectId,
  projectName,
  imageUrl,
  location,
  latitude,
  longitude
}: {
  projectId: string;
  projectName: string;
  imageUrl: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputEl = useRef<HTMLInputElement | null>(null);

  const { control, handleSubmit, setValue, watch } =
    useForm<UpdateProjectInfoInput>({
      resolver: zodResolver(updateProjectInfoSchema),
      defaultValues: {
        projectName,
        location,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined
      }
    });

  const watchedLatitude = watch('latitude');
  const watchedLongitude = watch('longitude');

  const previewSrc = imageFile ? URL.createObjectURL(imageFile) : imageUrl;

  const onSubmit = (data: UpdateProjectInfoInput) => {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await updateProjectInfoAction(projectId, data);
      if (result?.success === false) {
        setErrorMessage(result.message);
        return;
      }

      if (imageFile) {
        const uploadResult = await uploadProjectImageAction(
          projectId,
          imageFile
        );
        if (uploadResult?.success === false) {
          setErrorMessage(uploadResult.message);
          return;
        }
      }

      setOpen(false);
      setImageFile(null);
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
          <Button variant="ghost" size="icon-sm" aria-label="แก้ไขโครงการ" />
        }
      >
        <Pencil className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลโครงการ</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <div className="flex items-center gap-4">
              <ImageWithPlaceholder
                src={previewSrc}
                alt={projectName}
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
              name="projectName"
              render={({ field, fieldState }) => (
                <Field className="gap-1" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>ชื่อโครงการ</FieldLabel>
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
              name="location"
              render={({ field, fieldState }) => (
                <Field className="gap-1" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>ที่ตั้ง</FieldLabel>
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
            <Field className="gap-2">
              <FieldLabel>ปักหมุดตำแหน่งบนแผนที่ (ไม่บังคับ)</FieldLabel>
              <LocationMapPicker
                latitude={watchedLatitude ?? null}
                longitude={watchedLongitude ?? null}
                onChange={(lat, lng) => {
                  setValue('latitude', lat);
                  setValue('longitude', lng);
                }}
              />
              {watchedLatitude !== undefined && watchedLongitude !== undefined && (
                <p className="text-xs text-on-surface-variant">
                  พิกัด: {watchedLatitude.toFixed(6)}, {watchedLongitude.toFixed(6)}
                </p>
              )}
            </Field>
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
