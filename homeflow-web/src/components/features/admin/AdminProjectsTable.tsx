'use client';

import ProjectStatusBadge from '@/components/features/project/ProjectStatusBadge';
import { formatCurrency } from '@/components/features/project/ProjectCard';
import { Input } from '@/components/ui/input';
import { ProjectResponse } from '@/lib/api/api.type';
import { ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(
    new Date(value)
  );
}

export default function AdminProjectsTable({
  projects
}: {
  projects: ProjectResponse[];
}) {
  const [query, setQuery] = useState('');

  const filteredProjects = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return projects;

    return projects.filter((project) =>
      [
        project.projectName,
        project.customerName,
        project.projectManagerName ?? '',
        project.location,
        project.houseType
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }, [projects, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-outline" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาจากชื่อโครงการ ลูกค้า PM หรือที่ตั้ง"
          aria-label="ค้นหาโครงการ"
          className="pl-9"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        แสดง {filteredProjects.length} จาก {projects.length} โครงการ
      </p>

      {/* จอเล็กแสดงเป็นการ์ด เพราะตารางกว้างเกินไปจนต้องเลื่อนแนวนอน */}
      <div className="flex flex-col gap-3 lg:hidden">
        {filteredProjects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-surface-variant/40"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-bold text-on-surface">{project.projectName}</p>
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              ลูกค้า: {project.customerName}
            </p>
            <p className="text-sm text-muted-foreground">
              PM: {project.projectManagerName ?? '—'}
            </p>
            <p className="text-sm text-muted-foreground">{project.location}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                ความคืบหน้า {project.progressPercent}%
              </span>
              <span className="font-medium text-on-surface">
                {formatCurrency(project.estimatedBudget)}
              </span>
            </div>
          </Link>
        ))}
        {filteredProjects.length === 0 && (
          <p className="rounded-lg border border-border px-4 py-6 text-center text-muted-foreground">
            {query.trim()
              ? `ไม่พบโครงการที่ตรงกับ "${query.trim()}"`
              : 'ยังไม่มีโครงการในระบบ'}
          </p>
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border lg:block">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">โครงการ</th>
              <th className="px-4 py-3 font-medium">ลูกค้า</th>
              <th className="px-4 py-3 font-medium">ผู้จัดการโครงการ</th>
              <th className="px-4 py-3 font-medium">ที่ตั้ง</th>
              <th className="px-4 py-3 font-medium">งบประมาณ</th>
              <th className="px-4 py-3 font-medium">ความคืบหน้า</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project) => (
              <tr
                key={project.id}
                className="border-t border-border transition-colors last:border-b-0 hover:bg-surface-variant/40"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-medium text-on-surface hover:underline"
                  >
                    {project.projectName}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {project.houseType} · สร้างเมื่อ{' '}
                    {formatDate(project.createdAt)}
                  </p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {project.customerName}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {project.projectManagerName ?? '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {project.location}
                </td>
                <td className="px-4 py-3">
                  {formatCurrency(project.estimatedBudget)}
                  <p className="text-xs text-muted-foreground">
                    ใช้จริง {formatCurrency(project.actualCost)}
                  </p>
                </td>
                <td className="px-4 py-3">{project.progressPercent}%</td>
                <td className="px-4 py-3">
                  <ProjectStatusBadge status={project.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/projects/${project.id}`}
                    aria-label={`ดูรายละเอียดโครงการ ${project.projectName}`}
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    ดู
                    <ChevronRight className="size-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  {query.trim()
                    ? `ไม่พบโครงการที่ตรงกับ "${query.trim()}"`
                    : 'ยังไม่มีโครงการในระบบ'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
