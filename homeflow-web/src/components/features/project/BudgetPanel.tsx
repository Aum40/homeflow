import { BudgetResponse } from '@/lib/api/api.type';
import { formatCurrency } from './ProjectCard';

export default function BudgetPanel({ budget }: { budget: BudgetResponse }) {
  const barPercent = Math.min(budget.usagePercent, 100);
  const isNegative = Number(budget.remainingBudget) < 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border-t-4 border-tertiary bg-surface-container-lowest p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-on-surface">
          สรุปงบประมาณโครงการ
        </h3>
        {budget.isOverBudget && (
          <span className="rounded-full bg-destructive/15 px-3 py-1 text-xs font-bold text-destructive">
            เกินงบประมาณ
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-end justify-between">
            <span className="text-sm font-medium text-on-surface-variant">
              ยอดใช้จ่ายจริง
            </span>
            <span
              className={`text-lg font-bold ${budget.isOverBudget ? 'text-destructive' : 'text-primary'}`}
            >
              {formatCurrency(budget.actualCost)}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                budget.isOverBudget ? 'bg-destructive' : 'bg-primary'
              }`}
              style={{ width: `${barPercent}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">
            ใช้ไปแล้ว {budget.usagePercent.toFixed(1)}% ของงบประมาณ
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-surface-container-low p-4 transition-colors hover:bg-surface-container">
            <span className="block text-[11px] tracking-wider text-on-surface-variant uppercase">
              งบประมาณทั้งหมด
            </span>
            <span className="text-lg font-bold text-on-surface">
              {formatCurrency(budget.estimatedBudget)}
            </span>
          </div>
          <div className="rounded-lg bg-surface-container-low p-4 transition-colors hover:bg-surface-container">
            <span className="block text-[11px] tracking-wider text-on-surface-variant uppercase">
              งบคงเหลือ
            </span>
            <span
              className={`text-lg font-bold ${isNegative ? 'text-destructive' : 'text-secondary'}`}
            >
              {formatCurrency(budget.remainingBudget)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
