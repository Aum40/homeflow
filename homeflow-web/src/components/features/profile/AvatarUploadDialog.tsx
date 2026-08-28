'use client';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { uploadAvatar } from '@/lib/actions/user.action';
import { checkUploadSize } from '@/lib/utils';
import { uploadImageToCloudinary } from '@/lib/upload/cloudinary-upload';
import { Camera, Loader2 } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';

type AvatarUploadDialogProps = {
  avatarUrl?: string | null;
};

export default function AvatarUploadDialog({
  avatarUrl,
}: AvatarUploadDialogProps) {
  const fileInputEl = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const imageUrl = file ? URL.createObjectURL(file) : avatarUrl;

  const handleClickSave = () => {
    if (!file) return;
    setErrorMessage(null);
    startTransition(async () => {
      let imageUrl: string;
      try {
        imageUrl = await uploadImageToCloudinary(file);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'อัปโหลดรูปไม่สำเร็จ'
        );
        return;
      }

      const result = await uploadAvatar(imageUrl);
      if (result?.success === false) {
        setErrorMessage(result.message);
        return;
      }
      setOpen(false);
      setFile(null);
    });
  };

  return (
    <>
      <input
        type='file'
        accept='image/*'
        className='hidden'
        ref={fileInputEl}
        onChange={(e) => {
          const picked = e.target.files?.[0];
          if (!picked) return;
          const sizeError = checkUploadSize(picked);
          if (sizeError) {
            setErrorMessage(sizeError);
            e.target.value = '';
            return;
          }
          setErrorMessage(null);
          setFile(picked);
        }}
      />
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (isPending) return;
          setOpen(next);
          if (!next) {
            setFile(null);
            setErrorMessage(null);
          }
        }}
      >
        {/* Trigger */}
        <DialogTrigger
          render={
            <Button
              variant='outline'
              className='rounded-full size-9 shadow absolute bottom-3 right-2'
              data-slot='dialog-trigger'
            >
              <Camera className='size-4' />
            </Button>
          }
        />

        {/* Content */}
        <DialogContent className='sm:max-w-3xl'>
          <DialogHeader>
            <DialogTitle>ตั้งค่ารูปภาพประจำตัว</DialogTitle>
          </DialogHeader>

          <div className='flex justify-center'>
            <Avatar className='size-75 border'>
              <AvatarImage alt='User' src={imageUrl ?? '/user.svg'} />
            </Avatar>
          </div>

          {errorMessage && (
            <p className='text-center text-sm text-destructive'>
              {errorMessage}
            </p>
          )}

          <DialogFooter>
            <div className='flex-1'>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => fileInputEl.current?.click()}
                disabled={isPending}
              >
                เลือกรูปภาพประจำตัว
              </Button>
            </div>
            {file && (
              <div className='flex-1'>
                <Button
                  className='w-full'
                  onClick={handleClickSave}
                  disabled={isPending}
                >
                  {isPending && (
                    <Loader2 className='mr-1 size-4 animate-spin' />
                  )}
                  {isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
