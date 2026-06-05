'use client';

import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Post } from '@/types/post';
import { FeedGridItem } from './FeedGridItem';

interface FeedGridProps {
  posts: Post[];
  onReorder?: (activeId: string, overId: string) => void;
}

export function FeedGrid({ posts, onReorder }: FeedGridProps) {
  const sensors = useSensors(
    // Desktop: drag activates after 5px movement (instant feel for mouse)
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    // Mobile: long-press (250ms) then drag. Preserves scroll for short swipes.
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder?.(String(active.id), String(over.id));
    }
  }

  // Empty state — show 9 placeholder cells
  if (posts.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] bg-slate-100" />
        ))}
      </div>
    );
  }

  // If no reorder handler, render static (used in PC mockup if disabled)
  if (!onReorder) {
    return (
      <div className="grid grid-cols-3 gap-0.5">
        {posts.map((post, i) => (
          <FeedGridItem key={post.id} post={post} isNewest={i === 0} />
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={posts.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-0.5">
          {posts.map((post, i) => (
            <SortableFeedGridItem key={post.id} post={post} isNewest={i === 0} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableFeedGridItemProps {
  post: Post;
  isNewest: boolean;
}

function SortableFeedGridItem({ post, isNewest }: SortableFeedGridItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: post.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.6 : 1,
    // Allow scroll on the grid container by default; sensor handles drag activation
    touchAction: 'manipulation',
    cursor: isDragging ? 'grabbing' : 'grab',
    // Disable iOS Safari's image long-press callout (Save / Copy / Share menu)
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onContextMenu={(e) => e.preventDefault()}
      className={isDragging ? 'shadow-2xl ring-2 ring-blue-400 ring-offset-1' : ''}
    >
      <FeedGridItem post={post} isNewest={isNewest} />
    </div>
  );
}
