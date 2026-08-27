'use client';

import { Input } from '@/components/ui/input';
import { UserResponse } from '@/lib/api/api.type';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function CustomerCombobox({
  id,
  customers,
  value,
  onChange
}: {
  id?: string;
  customers: UserResponse[];
  value: string;
  onChange: (customerId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = customers.find((customer) => customer.id === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((customer) =>
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(q)
    );
  }, [customers, query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        value={
          open ? query : selected ? `${selected.firstName} ${selected.lastName}` : ''
        }
        onChange={(e) => {
          setQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          setQuery('');
          setOpen(true);
        }}
        placeholder="พิมพ์ค้นหาชื่อลูกค้า..."
        autoComplete="off"
      />
      {open && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-outline-variant bg-surface-container-lowest shadow-md">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-on-surface-variant">
              ไม่พบลูกค้าที่ตรงกับคำค้นหา
            </li>
          ) : (
            filtered.map((customer) => (
              <li key={customer.id}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-surface-container"
                  onClick={() => {
                    onChange(customer.id);
                    setQuery('');
                    setOpen(false);
                  }}
                >
                  {customer.firstName} {customer.lastName}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
