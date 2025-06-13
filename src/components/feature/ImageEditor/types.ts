import type { Canvas } from 'fabric';

export type ImageEditorProps = {
  imageFile: File | null;
  onImageLoad?: (canvas: Canvas) => void;
  onDelete?: () => void;
};

export type FrameType = 'horizontal' | 'vertical' | 'all';

export type FrameColor = 'white' | 'black';

export type EditMode = 'frame' | 'trimming';

export type AspectRatio = '1:1' | '16:9' | '5:4' | '7:5';

export type CropData = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FrameData = {
  type: FrameType;
  width: number;
  color: FrameColor;
};

export type EditHistory = {
  crop?: CropData;
  frame?: FrameData;
};

