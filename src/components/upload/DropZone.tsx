'use client';

import { useState, useRef } from 'react';

interface DropZoneProps {
  onFilesAccepted: (files: File[]) => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Native <label> + <input type="file"> based dropzone.
 * - iOS Safari opens the photo picker reliably via the implicit label→input click.
 * - Desktop drag-and-drop is preserved via onDragOver/onDrop handlers on the label.
 */
export function DropZone({ onFilesAccepted }: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList).filter((f) =>
      ACCEPTED_TYPES.includes(f.type) || f.type.startsWith('image/')
    );
    if (files.length > 0) onFilesAccepted(files);
    // Reset so the same file can be selected again
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <label
      htmlFor="dropzone-file-input"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragActive(true);
      }}
      onDragLeave={() => setIsDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`
        block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
        transition-colors touch-manipulation select-none
        ${isDragActive
          ? 'border-slate-500 bg-slate-50'
          : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100'}
      `}
    >
      <input
        ref={inputRef}
        id="dropzone-file-input"
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="sr-only"
      />
      <div className="flex flex-col items-center gap-2 text-slate-400 pointer-events-none">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 16v-8m0 0-3 3m3-3 3 3M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
        </svg>
        <p className="text-sm font-medium text-slate-500">
          {isDragActive ? 'ドロップして追加' : 'タップして画像を選択'}
        </p>
        <p className="text-xs text-slate-400">JPG / PNG / WebP</p>
      </div>
    </label>
  );
}
