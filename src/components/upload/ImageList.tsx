'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Post, PostType } from '@/types/post';
import { ImageListItem } from './ImageListItem';

interface ImageListProps {
  posts: Post[];
  onRemove: (id: string) => void;
  onTypeChange: (id: string, type: PostType) => void;
  onReorder: (activeId: string, overId: string) => void;
}

export function ImageList({ posts, onRemove, onTypeChange, onReorder }: ImageListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  }

  if (posts.length === 0) {
    return (
      <p className="text-center text-sm text-slate-400 py-8">
        画像をアップロードしてください
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={posts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {posts.map((post) => (
            <ImageListItem
              key={post.id}
              post={post}
              onRemove={onRemove}
              onTypeChange={onTypeChange}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
