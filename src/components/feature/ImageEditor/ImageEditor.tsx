'use client';

import { Button } from '@/components/ui/Button';
import { IconFrame, IconHorizontalFrame, IconVerticalFrame } from '@/components/ui/Icon';
import { IconRadioGroup, IconRadioItem } from '@/components/ui/RadioGroup/IconRadioGroup';
import { RadioGroup } from '@/components/ui/RadioGroup/RadioGroup';
import { Slider } from '@/components/ui/Slider';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Canvas, FabricImage } from 'fabric';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FrameColor, FrameType, ImageEditorProps } from './types';
import { calculateImageDimensions, createFrameRects, saveCanvasAsImage, setupCanvas } from './utils';

export const ImageEditor = ({ imageFile, onImageLoad, onDelete }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [frameType, setFrameType] = useState<FrameType>('horizontal');
  const [frameWidth, setFrameWidth] = useState<number>(0);
  const [frameColor, setFrameColor] = useState<FrameColor>('white');
  const [originalImage, setOriginalImage] = useState<FabricImage | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric.js canvas with default size (will be resized when image loads)
    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 400,
      height: 400,
      backgroundColor: '#ffffff',
    });

    // Wait for canvas to be fully initialized
    fabricCanvas.renderAll();
    fabricCanvasRef.current = fabricCanvas;

    // Ensure canvas is ready before allowing image operations
    setTimeout(() => {
      fabricCanvas.renderAll();
    }, 0);

    // Cleanup function
    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!imageFile || !fabricCanvasRef.current || !canvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const canvasElement = canvasRef.current;
    const reader = new FileReader();

    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      
      FabricImage.fromURL(imageUrl).then((fabricImage) => {
        // Clear canvas safely
        try {
          canvas.clear();
        } catch (error) {
          console.warn('Canvas clear failed:', error);
          return;
        }
        
        const imageWidth = fabricImage.width || 1;
        const imageHeight = fabricImage.height || 1;
        
        // Calculate dimensions
        const dimensions = calculateImageDimensions(imageWidth, imageHeight);
        
        // Setup canvas
        setupCanvas(canvas, canvasElement, dimensions);
        
        // Set image at original size
        fabricImage.set({
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
        });
        
        // Add image to canvas
        canvas.add(fabricImage);
        setOriginalImage(fabricImage);
        canvas.renderAll();
        
        // Call callback if provided
        if (onImageLoad) {
          onImageLoad(canvas);
        }
      });
    };

    reader.readAsDataURL(imageFile);
  }, [imageFile, onImageLoad]);

  const createFrame = useCallback((canvas: Canvas, type: FrameType, width: number, color: FrameColor) => {
    createFrameRects(canvas, type, width, color, originalImage);
  }, [originalImage]);

  // Update frame when frameWidth, frameType, or frameColor changes
  useEffect(() => {
    if (fabricCanvasRef.current && originalImage) {
      createFrame(fabricCanvasRef.current, frameType, frameWidth, frameColor);
    }
  }, [frameWidth, frameType, frameColor, originalImage, createFrame]);

  const handleFrameTypeChange = (value: string) => {
    setFrameType(value as FrameType);
  };

  const handleFrameColorChange = (value: string) => {
    setFrameColor(value as FrameColor);
  };

  const handleDelete = () => {
    if (onDelete) onDelete();
  };

  const handleSave = () => {
    if (fabricCanvasRef.current) {
      // Generate filename based on original file name
      const originalName = imageFile?.name || 'image';
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
      const filename = `${nameWithoutExt}-edited.png`;
      
      saveCanvasAsImage(fabricCanvasRef.current, filename);
    }
  };

  return (
    <div className="w-full flex flex-col items-end gap-16">
      {/* Buttons */}
      <div className="w-full flex justify-between items-center px-4">
        <Button variant="danger" onClick={handleDelete}>
          削除
        </Button>
        <Button variant="primary" onClick={handleSave}>
          保存
        </Button>
      </div>

      {/* Canvas */}
      <div className="w-full flex justify-center">
        <canvas
          ref={canvasRef}
          className=""
        />
      </div>

      {/* IconRadioGroup */}
      <div className="w-full">
        <IconRadioGroup value={frameType} onValueChange={handleFrameTypeChange}>
          <IconRadioItem value="horizontal" icon={<IconHorizontalFrame />} />
          <IconRadioItem value="vertical" icon={<IconVerticalFrame />} />
          <IconRadioItem value="all" icon={<IconFrame />} />
        </IconRadioGroup>
      </div>

      {/* Frame Color Selection */}
      <div className="w-full">
        <RadioGroup value={frameColor} onValueChange={handleFrameColorChange}>
          <div className="flex justify-center gap-8">
            <div className="flex items-center space-x-2">
              <RadioGroupPrimitive.Item
                value="white"
                id="white"
                className="aspect-square h-4 w-4 rounded-full border border-gray-600 text-gray-600 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-600" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
              <label htmlFor="white" className="text-sm font-medium text-gray-700">
                白
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupPrimitive.Item
                value="black"
                id="black"
                className="aspect-square h-4 w-4 rounded-full border border-gray-600 text-gray-600 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-600" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
              <label htmlFor="black" className="text-sm font-medium text-gray-700">
                黒
              </label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Slider */}
      <div className="w-full">
        <Slider
          value={[frameWidth]}
          onValueChange={(value) => setFrameWidth(value[0])}
          max={100}
          min={0}
          step={1}
        />
      </div>
    </div>
  );
};