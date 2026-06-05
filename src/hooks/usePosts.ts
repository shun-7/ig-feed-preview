'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { Post, PostType } from '@/types/post';
import { loadFeedState, saveFeedState } from '@/utils/storageUtils';
import { compressImage } from '@/utils/imageUtils';
import { generateId } from '@/utils/id';

export interface AddImagesResult {
  added: number;
  failed: { name: string; reason: string }[];
}

export interface UsePostsReturn {
  posts: Post[];
  addImages: (files: File[]) => Promise<AddImagesResult>;
  addImportedPosts: (imported: Post[]) => void;
  clearImported: () => void;
  removePost: (id: string) => void;
  updatePostType: (id: string, type: PostType) => void;
  reorderPosts: (activeId: string, overId: string) => void;
  storageWarning: boolean;
  dismissWarning: () => void;
}

export function usePosts(): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [storageWarning, setStorageWarning] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);
  const hydratedRef = useRef(false);

  // Load from IndexedDB on mount (client only). Migrates localStorage automatically.
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    loadFeedState()
      .then((saved) => {
        if (saved?.posts?.length) {
          setPosts(saved.posts.sort((a, b) => a.order - b.order));
        }
      })
      .finally(() => {
        hydratedRef.current = true;
      });
  }, []);

  // Debounced save — only after initial hydration completes (avoids overwriting saved data with [])
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveFeedState({ posts, updatedAt: new Date().toISOString() }).catch((e) => {
        if (e instanceof Error && e.message === 'QUOTA_EXCEEDED') {
          setStorageWarning(true);
        } else {
          console.error('Save failed:', e);
        }
      });
    }, 300);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [posts]);

  const addImages = useCallback(async (files: File[]): Promise<AddImagesResult> => {
    const newPosts: Post[] = [];
    const failed: { name: string; reason: string }[] = [];

    for (const file of files) {
      try {
        const dataUrl = await compressImage(file);
        newPosts.push({
          id: generateId(),
          imageDataUrl: dataUrl,
          fileName: file.name,
          type: 'photo',
          order: 0,
          createdAt: new Date().toISOString(),
          source: 'new',
        });
      } catch (e) {
        const reason = e instanceof Error ? e.message : String(e);
        failed.push({ name: file.name || 'unknown', reason });
        console.error('Failed to process image:', file.name, e);
      }
    }

    if (newPosts.length > 0) {
      setPosts((prev) => {
        const combined = [...newPosts, ...prev];
        return combined.map((p, i) => ({ ...p, order: i }));
      });
    }

    return { added: newPosts.length, failed };
  }, []);

  const addImportedPosts = useCallback((imported: Post[]) => {
    setPosts((prev) => {
      // Remove existing imported posts, keep only 'new' drafts; then append fresh imports below
      const newOnly = prev.filter((p) => p.source !== 'imported');
      const fresh = imported.map((p) => ({ ...p, source: 'imported' as const }));
      // Drafts (new) on top, imported below — matches "new posts above existing feed"
      const combined = [...newOnly, ...fresh];
      return combined.map((p, i) => ({ ...p, order: i }));
    });
  }, []);

  const clearImported = useCallback(() => {
    setPosts((prev) => {
      const newOnly = prev.filter((p) => p.source !== 'imported');
      return newOnly.map((p, i) => ({ ...p, order: i }));
    });
  }, []);

  const removePost = useCallback((id: string) => {
    setPosts((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      return filtered.map((p, i) => ({ ...p, order: i }));
    });
  }, []);

  const updatePostType = useCallback((id: string, type: PostType) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, type } : p)));
  }, []);

  const reorderPosts = useCallback((activeId: string, overId: string) => {
    setPosts((prev) => {
      const oldIndex = prev.findIndex((p) => p.id === activeId);
      const newIndex = prev.findIndex((p) => p.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((p, i) => ({ ...p, order: i }));
    });
  }, []);

  const dismissWarning = useCallback(() => setStorageWarning(false), []);

  return { posts, addImages, addImportedPosts, clearImported, removePost, updatePostType, reorderPosts, storageWarning, dismissWarning };
}
