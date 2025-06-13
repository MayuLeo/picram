import type { AspectRatio } from '../types';

export type TrimmingControlsProps = {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (value: AspectRatio) => void;
  onCancel: () => void;
  onApply: () => void;
};