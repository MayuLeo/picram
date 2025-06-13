import { Canvas, FabricImage } from 'fabric';
import { useCallback, useEffect, useState } from 'react';
import type { FrameColor, FrameType } from '../types';
import { createFrameRects } from '../utils';

export const useFrameEditor = (
  fabricCanvasRef: React.RefObject<Canvas | null>,
  originalImage: FabricImage | null
) => {
  const [frameType, setFrameType] = useState<FrameType>('horizontal');
  const [frameWidth, setFrameWidth] = useState<number>(0);
  const [frameColor, setFrameColor] = useState<FrameColor>('white');

  const createFrame = useCallback((canvas: Canvas, type: FrameType, width: number, color: FrameColor) => {
    createFrameRects(canvas, type, width, color, originalImage);
  }, [originalImage]);

  // Update frame when parameters change
  useEffect(() => {
    if (fabricCanvasRef.current && originalImage) {
      createFrame(fabricCanvasRef.current, frameType, frameWidth, frameColor);
    }
  }, [frameWidth, frameType, frameColor, originalImage, createFrame, fabricCanvasRef]);

  const handleFrameTypeChange = useCallback((value: FrameType) => {
    setFrameType(value);
  }, []);

  const handleFrameColorChange = useCallback((value: FrameColor) => {
    setFrameColor(value);
  }, []);

  const handleFrameWidthChange = useCallback((value: number) => {
    setFrameWidth(value);
  }, []);

  const getFrameData = useCallback(() => {
    return frameWidth > 0 ? { type: frameType, width: frameWidth, color: frameColor } : undefined;
  }, [frameType, frameWidth, frameColor]);

  return {
    frameType,
    frameWidth,
    frameColor,
    handleFrameTypeChange,
    handleFrameColorChange,
    handleFrameWidthChange,
    getFrameData,
  };
};