'use client';

import { Input } from '@/components/ui/input';
import { ProjectResponse, ProjectStatus } from '@/lib/api/api.type';
import { Search } from 'lucide-react';
import { useState } from 'react';
import ProjectCard from './ProjectCard';

const ONGOING_STATUSES: ProjectStatus[] = ['PLANNING', 'IN_PROGRESS'];

export default function PmProjectsList({
  projects
}: {
  projects: ProjectResponse[];
}) {
  const [query, setQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const trimmedQuery = query.trim().toLowerCase();

  const searchResults = trimmedQuery
    ? projects.filter(
        (project) =>
          project.projectName.toLowerCase().includes(trimmedQuery) ||
          project.customerName.toLowerCase().includes(trimmedQuery)
      )
    : null;

  const ongoing = projects.filter((project) =>
    ONGOING_STATUSES.includes(project.status)
  );
  const done = projects.filter(
    (project) => !ONGOING_STATUSES.includes(project.status)
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-on-surface-variant" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อโครงการหรือลูกค้า..."
          className="h-10 pl-9"
        />
      </div>

      {searchResults ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-on-surface-variant">
            พบ {searchResults.length} โครงการ
          </p>
          {searchResults.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              ไม่พบโครงการที่ตรงกับคำค้นหา
            </p>
          ) : (
            searchResults.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                viewerRole="PROJECT_MANAGER"
              />
            ))
          )}
        </div>
      ) : (
        <>
          {ongoing.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              ไม่มีโครงการที่กำลังดำเนินการอยู่ในขณะนี้
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {ongoing.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewerRole="PROJECT_MANAGER"
                />
              ))}
            </div>
          )}

          {done.length > 0 && (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setShowCompleted((prev) => !prev)}
                className="w-fit text-sm font-medium text-primary hover:underline"
              >
                {showCompleted
                  ? 'ซ่อนโครงการที่เสร็จแล้ว'
                  : `ดูโครงการที่เสร็จแล้ว (${done.length})`}
              </button>
              {showCompleted && (
                <div className="flex flex-col gap-4">
                  {done.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      viewerRole="PROJECT_MANAGER"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
