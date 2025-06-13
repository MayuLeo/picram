import { Canvas, FabricImage, Rect } from 'fabric';
import { useCallback, useEffect, useState } from 'react';
import type { AspectRatio } from '../types';
import { calculateImageDimensions, setupCanvas } from '../utils';

export const useTrimmingEditor = (
  fabricCanvasRef: React.RefObject<Canvas | null>,
  originalImage: FabricImage | null,
  originalImageDataURL: string,
  setImageDimensions: (dimensions: ReturnType<typeof calculateImageDimensions> | null) => void,
  setOriginalImage: (image: FabricImage | null) => void
) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isTrimmingMode, setIsTrimmingMode] = useState<boolean>(false);
  const [selectionRect, setSelectionRect] = useState<Rect | null>(null);

  const calculateAspectRatioDimensions = useCallback((
    ratio: AspectRatio, 
    canvasWidth: number, 
    canvasHeight: number
  ): { width: number; height: number } => {
    let ratioWidth: number, ratioHeight: number;
    
    switch (ratio) {
      case '1:1':
        ratioWidth = 1;
        ratioHeight = 1;
        break;
      case '16:9':
        ratioWidth = 16;
        ratioHeight = 9;
        break;
      case '5:4':
        ratioWidth = 5;
        ratioHeight = 4;
        break;
      case '7:5':
        ratioWidth = 7;
        ratioHeight = 5;
        break;
      default:
        ratioWidth = 1;
        ratioHeight = 1;
    }
    
    const aspectRatioValue = ratioWidth / ratioHeight;
    
    let width: number, height: number;
    
    width = canvasWidth;
    height = width / aspectRatioValue;
    
    if (height > canvasHeight) {
      height = canvasHeight;
      width = height * aspectRatioValue;
    }
    
    return { width, height };
  }, []);

  // Update crop area when aspect ratio changes during trimming
  useEffect(() => {
    if (isTrimmingMode && selectionRect && fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      
      const { width: newWidth, height: newHeight } = calculateAspectRatioDimensions(aspectRatio, canvasWidth, canvasHeight);
      
      selectionRect.set({
        width: newWidth,
        height: newHeight,
        scaleX: 1,
        scaleY: 1
      });
      
      canvas.centerObject(selectionRect);
      
      // Boundary checks
      const objLeft = selectionRect.left!;
      const objTop = selectionRect.top!;
      
      if (objLeft + newWidth > canvasWidth) {
        selectionRect.set({ left: canvasWidth - newWidth });
      }
      if (objTop + newHeight > canvasHeight) {
        selectionRect.set({ top: canvasHeight - newHeight });
      }
      if (objLeft < 0) {
        selectionRect.set({ left: 0 });
      }
      if (objTop < 0) {
        selectionRect.set({ top: 0 });
      }
      
      canvas.renderAll();
    }
  }, [aspectRatio, isTrimmingMode, selectionRect, fabricCanvasRef, calculateAspectRatioDimensions]);

  const startCrop = useCallback(() => {
    if (!fabricCanvasRef.current || !originalImage) return;
    
    setIsTrimmingMode(true);
    
    const canvas = fabricCanvasRef.current;
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    
    const { width: cropWidth, height: cropHeight } = calculateAspectRatioDimensions(aspectRatio, canvasWidth, canvasHeight);
    
    const cropRect = new Rect({
      fill: 'rgba(0,0,0,0.3)',
      originX: 'left',
      originY: 'top',
      stroke: 'black',
      opacity: 1,
      width: cropWidth,
      height: cropHeight,
      hasRotatingPoint: false,
      transparentCorners: false,
      cornerColor: 'white',
      cornerStrokeColor: 'black',
      borderColor: 'black',
      cornerSize: 120,
      padding: 0,
      cornerStyle: 'circle',
      borderDashArray: [5, 5],
      borderScaleFactor: 1.3,
      touchCornerSize: 120,
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
    });
    
    canvas.centerObject(cropRect);
    canvas.add(cropRect);
    canvas.setActiveObject(cropRect);
    
    // Add boundary constraints
    cropRect.on('moving', () => {
      const obj = cropRect;
      if (!obj) return;
      
      if (obj.left! < 0) obj.set({ left: 0 });
      if (obj.top! < 0) obj.set({ top: 0 });
      if (obj.left! + obj.getScaledWidth() > canvasWidth) {
        obj.set({ left: canvasWidth - obj.getScaledWidth() });
      }
      if (obj.top! + obj.getScaledHeight() > canvasHeight) {
        obj.set({ top: canvasHeight - obj.getScaledHeight() });
      }
    });
    
    cropRect.on('scaling', () => {
      const obj = cropRect;
      if (!obj) return;
      
      const objLeft = obj.left!;
      const objTop = obj.top!;
      const objWidth = obj.getScaledWidth();
      const objHeight = obj.getScaledHeight();
      
      let newScaleX = obj.scaleX!;
      let newScaleY = obj.scaleY!;
      
      if (objLeft + objWidth > canvasWidth) {
        newScaleX = (canvasWidth - objLeft) / obj.width!;
      }
      if (objTop + objHeight > canvasHeight) {
        newScaleY = (canvasHeight - objTop) / obj.height!;
      }
      if (objLeft < 0) {
        obj.set({ left: 0 });
        newScaleX = Math.min(newScaleX, canvasWidth / obj.width!);
      }
      if (objTop < 0) {
        obj.set({ top: 0 });
        newScaleY = Math.min(newScaleY, canvasHeight / obj.height!);
      }
      
      const minScale = 20 / Math.min(obj.width!, obj.height!);
      newScaleX = Math.max(newScaleX, minScale);
      newScaleY = Math.max(newScaleY, minScale);
      
      obj.set({
        scaleX: newScaleX,
        scaleY: newScaleY
      });
    });
    
    canvas.renderAll();
    setSelectionRect(cropRect);
  }, [fabricCanvasRef, originalImage, aspectRatio, calculateAspectRatioDimensions]);

  const applyCrop = useCallback(() => {
    if (!fabricCanvasRef.current || !originalImage || !selectionRect) {
      return null;
    }
    
    const canvas = fabricCanvasRef.current;
    
    const cropX = selectionRect.left!;
    const cropY = selectionRect.top!;
    const cropWidth = selectionRect.getScaledWidth();
    const cropHeight = selectionRect.getScaledHeight();
    
    // Remove the selection rectangle
    canvas.remove(selectionRect);
    
    // Update canvas display size
    canvas.setDimensions({
      width: cropWidth,
      height: cropHeight
    });
    
    const dimensions = calculateImageDimensions(cropWidth, cropHeight);
    setImageDimensions(dimensions);
    setupCanvas(canvas, canvas.getElement(), dimensions);
    
    // Clear and redraw with cropped area
    canvas.clear();
    
    FabricImage.fromURL(originalImageDataURL).then((previewImage) => {
      previewImage.set({
        left: -cropX,
        top: -cropY,
        selectable: false,
        evented: false,
      });
      
      canvas.add(previewImage);
      canvas.renderAll();
      setOriginalImage(previewImage);
    });
    
    setIsTrimmingMode(false);
    setSelectionRect(null);
    
    return {
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight
    };
  }, [fabricCanvasRef, originalImage, selectionRect, originalImageDataURL, setImageDimensions, setOriginalImage]);

  const cancelCrop = useCallback(() => {
    setIsTrimmingMode(false);
    if (selectionRect && fabricCanvasRef.current) {
      fabricCanvasRef.current.remove(selectionRect);
      setSelectionRect(null);
    }
  }, [selectionRect, fabricCanvasRef]);

  const handleAspectRatioChange = useCallback((value: AspectRatio) => {
    setAspectRatio(value);
  }, []);

  return {
    aspectRatio,
    isTrimmingMode,
    selectionRect,
    handleAspectRatioChange,
    startCrop,
    applyCrop,
    cancelCrop,
  };
};