'use client';

import { reorderChecklistItemAction } from '@/lib/actions/project.action';
import { ChecklistItemResponse } from '@/lib/api/api.type';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { useState, useTransition } from 'react';
import AddChecklistItemForm from './AddChecklistItemForm';
import ChecklistItemRow from './ChecklistItemRow';

export default function ProjectStagesCard({
  projectId,
  projectName,
  items,
  isManager
}: {
  projectId: string;
  projectName: string;
  items: ChecklistItemResponse[];
  isManager: boolean;
}) {
  const [prevItems, setPrevItems] = useState(items);
  const [orderedItems, setOrderedItems] = useState(items);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (items !== prevItems) {
    setPrevItems(items);
    setOrderedItems(items);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const completedCount = orderedItems.filter(
    (item) => item.isCompleted
  ).length;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedItems.findIndex((item) => item.id === active.id);
    const newIndex = orderedItems.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previousItems = orderedItems;
    const newItems = arrayMove(orderedItems, oldIndex, newIndex);
    setOrderedItems(newItems);
    setError(null);

    startTransition(async () => {
      const result = await reorderChecklistItemAction(
        projectId,
        newItems.map((item) => item.id)
      );
      if (result?.success === false) {
        setOrderedItems(previousItems);
        setError(result.message);
      }
    });
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-on-surface">
          รายการความคืบหน้า
        </h3>
        <p className="text-sm font-bold text-primary">
          โครงการ: {projectName} · เสร็จแล้ว {completedCount}/
          {orderedItems.length} รายการ
        </p>
      </div>

      {isManager && (
        <div className="mb-4">
          <AddChecklistItemForm projectId={projectId} />
        </div>
      )}

      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

      {orderedItems.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          ยังไม่มีรายการความคืบหน้าสำหรับโครงการนี้
        </p>
      ) : isManager ? (
        <DndContext
          // Stable id: dnd-kit otherwise derives the rendered aria-describedby
          // from a module-level counter, which drifts between server and
          // client and breaks hydration.
          id={`checklist-dnd-${projectId}`}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={orderedItems.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {orderedItems.map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  projectId={projectId}
                  item={item}
                  isManager={isManager}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-3">
          {orderedItems.map((item) => (
            <ChecklistItemRow
              key={item.id}
              projectId={projectId}
              item={item}
              isManager={isManager}
            />
          ))}
        </div>
      )}
    </div>
  );
}
