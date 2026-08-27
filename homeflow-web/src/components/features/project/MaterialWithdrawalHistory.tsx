import { MaterialWithdrawalResponse } from '@/lib/api/api.type';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export default function MaterialWithdrawalHistory({
  withdrawals
}: {
  withdrawals: MaterialWithdrawalResponse[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-bold text-on-surface">
        ประวัติการเบิกวัสดุ
      </h3>
      {withdrawals.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          ยังไม่มีการเบิกวัสดุสำหรับโครงการนี้
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {withdrawals.map((withdrawal) => (
            <li
              key={withdrawal.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-outline-variant px-4 py-2 text-sm"
            >
              <span>
                <span className="font-bold text-on-surface">
                  {withdrawal.withdrawnByName}
                </span>{' '}
                เบิก <span className="font-bold">{withdrawal.qty}</span>{' '}
                {withdrawal.materialName}
              </span>
              <span className="text-xs text-on-surface-variant">
                {formatDateTime(withdrawal.withdrawnAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
