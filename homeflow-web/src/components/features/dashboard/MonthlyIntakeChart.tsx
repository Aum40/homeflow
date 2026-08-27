'use client';

import { ProjectResponse } from '@/lib/api/api.type';
import { cn } from '@/lib/utils';
import { useMemo, useRef, useState } from 'react';

type MonthBucket = {
  key: string;
  date: Date;
  count: number;
};

function getProjectYears(projects: ProjectResponse[]): number[] {
  const years = new Set(
    projects.map((project) => new Date(project.createdAt).getFullYear())
  );
  years.add(new Date().getFullYear());
  return Array.from(years).sort((a, b) => b - a);
}

function getMonthsForYear(
  projects: ProjectResponse[],
  year: number
): MonthBucket[] {
  const counts = new Map<number, number>();
  for (const project of projects) {
    const date = new Date(project.createdAt);
    if (date.getFullYear() !== year) continue;
    const month = date.getMonth() + 1;
    counts.set(month, (counts.get(month) ?? 0) + 1);
  }

  const now = new Date();
  const lastMonth = year === now.getFullYear() ? now.getMonth() + 1 : 12;

  return Array.from({ length: lastMonth }, (_, i) => {
    const month = i + 1;
    return {
      key: `${year}-${String(month).padStart(2, '0')}`,
      date: new Date(year, i, 1),
      count: counts.get(month) ?? 0
    };
  });
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(date);
}

const POINT_GAP = 64;
const PADDING_X = 24;
const CHART_HEIGHT = 160;
const TOP_MARGIN = 26;
const LABELS_HEIGHT = 24;

export default function MonthlyIntakeChart({
  projects
}: {
  projects: ProjectResponse[];
}) {
  const years = useMemo(() => getProjectYears(projects), [projects]);
  const [selectedYear, setSelectedYear] = useState<number>(
    () => years[0] ?? new Date().getFullYear()
  );
  const months = useMemo(
    () => getMonthsForYear(projects, selectedYear),
    [projects, selectedYear]
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const maxCount = Math.max(1, ...months.map((month) => month.count));
  const midCount = Math.ceil(maxCount / 2);

  const width = Math.max(months.length - 1, 0) * POINT_GAP + PADDING_X * 2;

  const xFor = (index: number) => PADDING_X + index * POINT_GAP;
  const yFor = (count: number) => {
    const usable = CHART_HEIGHT - TOP_MARGIN;
    return TOP_MARGIN + usable * (1 - count / maxCount);
  };

  const linePath = months
    .map(
      (month, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(month.count)}`
    )
    .join(' ');

  const areaPath =
    months.length > 0
      ? `M ${xFor(0)} ${CHART_HEIGHT} L ${months
          .map((month, index) => `${xFor(index)} ${yFor(month.count)}`)
          .join(' L ')} L ${xFor(months.length - 1)} ${CHART_HEIGHT} Z`
      : '';

  const handleMouseMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
    if (!svgRef.current || months.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const index = Math.round((mouseX - PADDING_X) / POINT_GAP);
    setHoveredIndex(Math.min(Math.max(index, 0), months.length - 1));
  };

  const hovered = hoveredIndex !== null ? months[hoveredIndex] : null;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-on-background">
          งานที่รับในแต่ละเดือน
        </h2>
        <div className="flex items-center gap-1 rounded-lg bg-surface-container p-1">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                year === selectedYear
                  ? 'bg-primary text-primary-foreground'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              {year + 543}
            </button>
          ))}
        </div>
      </div>
      {projects.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          ยังไม่มีข้อมูลโครงการ
        </p>
      ) : (
        <div className="relative overflow-x-auto">
          <svg
            ref={svgRef}
            width={width}
            height={CHART_HEIGHT + LABELS_HEIGHT}
            viewBox={`0 0 ${width} ${CHART_HEIGHT + LABELS_HEIGHT}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIndex(null)}
            className="block"
          >
            {[0, midCount, maxCount].map((tick) => (
              <line
                key={tick}
                x1={0}
                x2={width}
                y1={yFor(tick)}
                y2={yFor(tick)}
                className="stroke-outline-variant"
                strokeWidth={1}
              />
            ))}

            <path d={areaPath} className="fill-primary/10" stroke="none" />
            <path
              d={linePath}
              fill="none"
              className="stroke-primary"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {hoveredIndex !== null && (
              <line
                x1={xFor(hoveredIndex)}
                x2={xFor(hoveredIndex)}
                y1={TOP_MARGIN}
                y2={CHART_HEIGHT}
                className="stroke-outline"
                strokeWidth={1}
              />
            )}

            {months.map((month, index) => (
              <circle
                key={month.key}
                cx={xFor(index)}
                cy={yFor(month.count)}
                r={hoveredIndex === index ? 6 : 5}
                className="fill-primary stroke-surface-container-lowest"
                strokeWidth={2}
              />
            ))}

            {months.length > 0 && (
              <text
                x={xFor(months.length - 1)}
                y={yFor(months[months.length - 1].count) - 12}
                textAnchor="middle"
                className="fill-on-surface text-xs font-bold"
              >
                {months[months.length - 1].count}
              </text>
            )}

            {months.map((month, index) => (
              <text
                key={month.key}
                x={xFor(index)}
                y={CHART_HEIGHT + LABELS_HEIGHT - 6}
                textAnchor="middle"
                className="fill-on-surface-variant text-[10px]"
              >
                {formatMonthLabel(month.date)}
              </text>
            ))}
          </svg>

          {hovered && hoveredIndex !== null && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-inverse-surface px-2 py-1 text-xs font-medium whitespace-nowrap text-inverse-on-surface shadow-md"
              style={{
                left: xFor(hoveredIndex),
                top: yFor(hovered.count) - 8
              }}
            >
              {hovered.count} โครงการ
            </div>
          )}
        </div>
      )}
    </div>
  );
}
