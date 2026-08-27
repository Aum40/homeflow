'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';

type DatePickerInputProps = {
  id: string;
  isInValid: boolean;
  value: Date;
  onValueChange: (...event: unknown[]) => void;
};

export default function DatePickerInput({
  id,
  isInValid,
  value,
  onValueChange
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="justify-start font-normal"
        render={
          <Button variant="outline" aria-invalid={isInValid} id={id}>
            {value ? (
              <span>{format(value, 'd MMMM yyyy')}</span>
            ) : (
              <span className="text-muted-foreground">Select date</span>
            )}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-1" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={value}
          onSelect={(date) => {
            setOpen(false);
            if (date) {
              onValueChange(date);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
