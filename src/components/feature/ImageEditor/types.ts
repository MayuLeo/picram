import type { Canvas } from 'fabric';

export type ImageEditorProps = {
  imageFile: File | null;
  onImageLoad?: (canvas: Canvas) => void;
  onDelete?: () => void;
};

export type FrameType = 'horizontal' | 'vertical' | 'all';

export type FrameColor = 'white' | 'black';