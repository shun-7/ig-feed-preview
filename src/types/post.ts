export type PostType = 'photo' | 'carousel' | 'reel';

export type PostSource = 'new' | 'imported';

export interface Post {
  id: string;
  imageDataUrl: string;
  fileName: string;
  type: PostType;
  order: number;
  createdAt: string; // ISO 8601 — when added to this app

  /** 'new' = draft being planned; 'imported' = already posted on Instagram */
  source?: PostSource;
  /** ISO 8601 — when the post was originally published on Instagram (imported only) */
  originalPostedAt?: string;
  /** Caption text from Instagram (imported only) */
  caption?: string;
}

export interface FeedState {
  posts: Post[];
  updatedAt: string;
}
