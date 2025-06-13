import type { FrameType, FrameColor } from '../types';

export type FrameControlsProps = {
  frameType: FrameType;
  frameColor: FrameColor;
  frameWidth: number;
  onFrameTypeChange: (value: FrameType) => void;
  onFrameColorChange: (value: FrameColor) => void;
  onFrameWidthChange: (value: number) => void;
};