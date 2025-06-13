'use client';

import { Button } from '@/components/ui/Button';
import { IconFrame, IconHorizontalFrame, IconVerticalFrame } from '@/components/ui/Icon';
import { IconRadioGroup, IconRadioItem } from '@/components/ui/RadioGroup/IconRadioGroup';
import { RadioGroup } from '@/components/ui/RadioGroup/RadioGroup';
import { Slider } from '@/components/ui/Slider';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Canvas, FabricImage, Rect } from 'fabric';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FrameColor, FrameType, ImageEditorProps, EditHistory } from './types';
import { calculateImageDimensions, createFrameRects, processImageWithHistory, setupCanvas } from './utils';

export const ImageEditor = ({ imageFile, onImageLoad, onDelete }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [frameType, setFrameType] = useState<FrameType>('horizontal');
  const [frameWidth, setFrameWidth] = useState<number>(0);
  const [frameColor, setFrameColor] = useState<FrameColor>('white');
  const [originalImage, setOriginalImage] = useState<FabricImage | null>(null);
  const [isTrimmingMode, setIsTrimmingMode] = useState<boolean>(false);
  const [selectionRect, setSelectionRect] = useState<Rect | null>(null);
  const [imageDimensions, setImageDimensions] = useState<ReturnType<typeof calculateImageDimensions> | null>(null);
  const [editHistory, setEditHistory] = useState<EditHistory>({});
  const [originalImageDataURL, setOriginalImageDataURL] = useState<string>('');

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
      setOriginalImageDataURL(imageUrl); // Store original image data for on-demand processing
      
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
        setImageDimensions(dimensions);
        
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
        
        // Reset edit history when new image is loaded
        setEditHistory({});
        
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
      
      // Update edit history for frame
      setEditHistory(prev => ({
        ...prev,
        frame: frameWidth > 0 ? { type: frameType, width: frameWidth, color: frameColor } : undefined
      }));
    }
  }, [frameWidth, frameType, frameColor, originalImage, createFrame]);

  const handleFrameTypeChange = (value: string) => {
    setFrameType(value as FrameType);
  };

  const handleFrameColorChange = (value: string) => {
    setFrameColor(value as FrameColor);
  };

  const startCrop = () => {
    if (!fabricCanvasRef.current || !originalImage) return;
    
    setIsTrimmingMode(true);
    
    const canvas = fabricCanvasRef.current;
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    
    // Calculate initial crop size - use a good portion of the canvas/image
    const cropWidth = Math.min(canvasWidth * 0.7, canvasHeight * 0.7);
    const cropHeight = cropWidth; // 正方形を基本とする
    
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
      cornerSize: 120, // ハンドルサイズを大きく（12→24）
      padding: 0,
      cornerStyle: 'circle',
      borderDashArray: [5, 5],
      borderScaleFactor: 1.3,
      // タッチ操作でも使いやすくするための設定
      touchCornerSize: 120, // タッチ時はさらに大きく
    });
    
    canvas.centerObject(cropRect);
    canvas.add(cropRect);
    canvas.setActiveObject(cropRect);
    canvas.renderAll();
    
    setSelectionRect(cropRect);
  };
  
  const applyCrop = () => {
    if (!fabricCanvasRef.current || !originalImage || !selectionRect || !imageDimensions) {
      return;
    }
    
    const canvas = fabricCanvasRef.current;
    
    // Store crop data in edit history instead of immediately processing
    const cropX = selectionRect.left!;
    const cropY = selectionRect.top!;
    const cropWidth = selectionRect.getScaledWidth();
    const cropHeight = selectionRect.getScaledHeight();
    
    // Update edit history with crop data
    setEditHistory(prev => ({
      ...prev,
      crop: {
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight
      }
    }));
    
    // Remove the selection rectangle
    canvas.remove(selectionRect);
    
    // Update canvas display size to show cropped area
    canvas.setDimensions({
      width: cropWidth,
      height: cropHeight
    });
    
    // Adjust display positioning for visual feedback
    const dimensions = calculateImageDimensions(cropWidth, cropHeight);
    setImageDimensions(dimensions);
    setupCanvas(canvas, canvas.getElement(), dimensions);
    
    // Clear canvas and redraw only the cropped area for preview
    canvas.clear();
    
    // Create a preview of the cropped area
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
  };

  const handleDelete = () => {
    if (onDelete) onDelete();
  };

  const handleSave = async () => {
    if (!originalImageDataURL) return;
    
    try {
      // Generate filename based on original file name and format
      const originalName = imageFile?.name || 'image';
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
      const filename = `${nameWithoutExt}-edited.jpg`;
      
      // Use on-demand processing with edit history
      await processImageWithHistory(originalImageDataURL, editHistory, filename);
    } catch (error) {
      console.error('Failed to save image:', error);
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

      {/* Trimming Controls */}
      {isTrimmingMode ? (
        <div className="w-full flex justify-center gap-4">
          <Button onClick={() => { 
            setIsTrimmingMode(false); 
            if (selectionRect && fabricCanvasRef.current) {
              fabricCanvasRef.current.remove(selectionRect);
            }
          }}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={applyCrop}>
            トリミング
          </Button>
        </div>
      ) : (
        <div className="w-full flex justify-center">
          <Button onClick={startCrop}>
            トリミング開始
          </Button>
        </div>
      )}

      {!isTrimmingMode && (
        <>
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
        </>
      )}
    </div>
  );
};