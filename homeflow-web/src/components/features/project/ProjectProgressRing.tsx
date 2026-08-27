export default function ProjectProgressRing({ percent }: { percent: number }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(percent, 0), 100);
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all hover:shadow-md">
      <p className="self-start text-xs font-medium tracking-wide text-on-surface-variant uppercase">
        ความคืบหน้าภาพรวม
      </p>
      <div className="relative flex size-48 items-center justify-center">
        <svg viewBox="0 0 192 192" className="size-full -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            className="text-surface-container-high"
          />
          <circle
            cx="96"
            cy="96"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="12"
            strokeLinecap="round"
            className="text-primary"
            style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
          />
        </svg>
        <div className="absolute text-center">
          <span className="block text-4xl font-bold text-primary">
            {clamped}%
          </span>
          <span className="text-xs text-on-surface-variant">เสร็จสมบูรณ์</span>
        </div>
      </div>
      <p className="text-center text-sm text-on-surface-variant">
        ความคืบหน้าล่าสุดที่ผู้จัดการโครงการรายงาน
      </p>
    </div>
  );
}
