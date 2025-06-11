export type ImageEditorProps = {
  imageFile: File | null;
  onImageLoad?: (canvas: fabric.Canvas) => void;
  onDelete?: () => void;
  onSave?: () => void;
};

export type FrameType = 'horizontal' | 'vertical' | 'all';