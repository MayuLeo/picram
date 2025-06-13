import { Canvas, FabricImage } from 'fabric';
import { useCallback, useEffect, useRef, useState } from 'react';
import { calculateImageDimensions, setupCanvas } from '../utils';

export const useCanvasSetup = (
  imageFile: File | null,
  onImageLoad?: (canvas: Canvas) => void
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [originalImage, setOriginalImage] = useState<FabricImage | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ReturnType<typeof calculateImageDimensions> | null>(null);
  const [originalImageDataURL, setOriginalImageDataURL] = useState<string>('');

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 400,
      height: 400,
      backgroundColor: '#ffffff',
    });

    fabricCanvas.renderAll();
    fabricCanvasRef.current = fabricCanvas;

    setTimeout(() => {
      fabricCanvas.renderAll();
    }, 0);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Load image into canvas
  useEffect(() => {
    if (!imageFile || !fabricCanvasRef.current || !canvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const canvasElement = canvasRef.current;
    const reader = new FileReader();

    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setOriginalImageDataURL(imageUrl);
      
      FabricImage.fromURL(imageUrl).then((fabricImage) => {
        try {
          canvas.clear();
        } catch (error) {
          console.warn('Canvas clear failed:', error);
          return;
        }
        
        const imageWidth = fabricImage.width || 1;
        const imageHeight = fabricImage.height || 1;
        
        const dimensions = calculateImageDimensions(imageWidth, imageHeight);
        setImageDimensions(dimensions);
        
        setupCanvas(canvas, canvasElement, dimensions);
        
        fabricImage.set({
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
        });
        
        canvas.add(fabricImage);
        setOriginalImage(fabricImage);
        canvas.renderAll();
        
        if (onImageLoad) {
          onImageLoad(canvas);
        }
      });
    };

    reader.readAsDataURL(imageFile);
  }, [imageFile, onImageLoad]);

  const resetCanvas = useCallback(() => {
    setOriginalImage(null);
    setImageDimensions(null);
    setOriginalImageDataURL('');
  }, []);

  return {
    canvasRef,
    fabricCanvasRef,
    originalImage,
    imageDimensions,
    originalImageDataURL,
    resetCanvas,
    setOriginalImage,
    setImageDimensions,
  };
};