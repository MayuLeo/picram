'use client';

import { Button } from '@/components/ui/Button';
import { IconFrame, IconHorizontalFrame, IconTrimming, IconVerticalFrame } from '@/components/ui/Icon';
import { IconRadioGroup, IconRadioItem } from '@/components/ui/RadioGroup/IconRadioGroup';
import { RadioGroup } from '@/components/ui/RadioGroup/RadioGroup';
import { Slider } from '@/components/ui/Slider';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Canvas, FabricImage, Rect } from 'fabric';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AspectRatio, EditHistory, EditMode, FrameColor, FrameType, ImageEditorProps } from './types';
import { calculateImageDimensions, createFrameRects, processImageWithHistory, setupCanvas } from './utils';

export const ImageEditor = ({ imageFile, onImageLoad, onDelete }: ImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [mode, setMode] = useState<EditMode>('frame');
  const [frameType, setFrameType] = useState<FrameType>('horizontal');
  const [frameWidth, setFrameWidth] = useState<number>(0);
  const [frameColor, setFrameColor] = useState<FrameColor>('white');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
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

  // Update crop area when aspect ratio changes during trimming
  useEffect(() => {
    if (isTrimmingMode && selectionRect && fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      
      const { width: newWidth, height: newHeight } = calculateAspectRatioDimensions(aspectRatio, canvasWidth, canvasHeight);
      
      // Update the selection rectangle size
      selectionRect.set({
        width: newWidth,
        height: newHeight,
        scaleX: 1,
        scaleY: 1
      });
      
      // Center the rectangle and ensure it's within bounds
      canvas.centerObject(selectionRect);
      
      // 境界チェック
      const objLeft = selectionRect.left!;
      const objTop = selectionRect.top!;
      
      // 右端・下端チェック
      if (objLeft + newWidth > canvasWidth) {
        selectionRect.set({ left: canvasWidth - newWidth });
      }
      if (objTop + newHeight > canvasHeight) {
        selectionRect.set({ top: canvasHeight - newHeight });
      }
      // 左端・上端チェック
      if (objLeft < 0) {
        selectionRect.set({ left: 0 });
      }
      if (objTop < 0) {
        selectionRect.set({ top: 0 });
      }
      
      canvas.renderAll();
    }
  }, [aspectRatio, isTrimmingMode, selectionRect]);

  const handleFrameTypeChange = (value: string) => {
    setFrameType(value as FrameType);
  };

  const handleFrameColorChange = (value: string) => {
    setFrameColor(value as FrameColor);
  };

  const handleModeChange = (value: string) => {
    const newMode = value as EditMode;
    setMode(newMode);
    
    if (newMode === 'trimming') {
      startCrop();
    } else if (isTrimmingMode) {
      // Reset trimming mode when switching to frame mode
      setIsTrimmingMode(false);
      if (selectionRect && fabricCanvasRef.current) {
        fabricCanvasRef.current.remove(selectionRect);
        setSelectionRect(null);
      }
    }
  };

  const handleAspectRatioChange = (value: string) => {
    setAspectRatio(value as AspectRatio);
  };

  const calculateAspectRatioDimensions = (ratio: AspectRatio, canvasWidth: number, canvasHeight: number): { width: number; height: number } => {
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
    
    // Calculate dimensions that fit the canvas (image) while maintaining aspect ratio
    let width: number, height: number;
    
    // Try fitting by width first
    width = canvasWidth;
    height = width / aspectRatioValue;
    
    // If height exceeds canvas height, fit by height instead
    if (height > canvasHeight) {
      height = canvasHeight;
      width = height * aspectRatioValue;
    }
    
    return { width, height };
  };

  const startCrop = () => {
    if (!fabricCanvasRef.current || !originalImage) return;
    
    setIsTrimmingMode(true);
    
    const canvas = fabricCanvasRef.current;
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    
    // Calculate initial crop size based on selected aspect ratio to fit the image
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
      cornerSize: 120, // ハンドルサイズを大きく（12→24）
      padding: 0,
      cornerStyle: 'circle',
      borderDashArray: [5, 5],
      borderScaleFactor: 1.3,
      // タッチ操作でも使いやすくするための設定
      touchCornerSize: 120, // タッチ時はさらに大きく
      // 境界制限の設定
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
    });
    
    canvas.centerObject(cropRect);
    canvas.add(cropRect);
    canvas.setActiveObject(cropRect);
    
    // 境界制限のイベントリスナーを追加
    cropRect.on('moving', () => {
      const obj = cropRect;
      if (!obj) return;
      
      // 左端制限
      if (obj.left! < 0) {
        obj.set({ left: 0 });
      }
      // 上端制限
      if (obj.top! < 0) {
        obj.set({ top: 0 });
      }
      // 右端制限
      if (obj.left! + obj.getScaledWidth() > canvasWidth) {
        obj.set({ left: canvasWidth - obj.getScaledWidth() });
      }
      // 下端制限
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
      
      // スケール後のサイズが画像を超えないよう制限
      let newScaleX = obj.scaleX!;
      let newScaleY = obj.scaleY!;
      
      // 右端チェック
      if (objLeft + objWidth > canvasWidth) {
        newScaleX = (canvasWidth - objLeft) / obj.width!;
      }
      // 下端チェック
      if (objTop + objHeight > canvasHeight) {
        newScaleY = (canvasHeight - objTop) / obj.height!;
      }
      // 左端チェック
      if (objLeft < 0) {
        obj.set({ left: 0 });
        newScaleX = Math.min(newScaleX, canvasWidth / obj.width!);
      }
      // 上端チェック
      if (objTop < 0) {
        obj.set({ top: 0 });
        newScaleY = Math.min(newScaleY, canvasHeight / obj.height!);
      }
      
      // 最小サイズ制限（20px）
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
      {isTrimmingMode && (
        <>
          {/* Aspect Ratio Selection */}
          <div className="w-full">
            <RadioGroup value={aspectRatio} onValueChange={handleAspectRatioChange}>
              <div className="flex justify-center gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupPrimitive.Item
                    value="1:1"
                    id="1:1"
                    className="aspect-square h-4 w-4 rounded-full border border-gray-600 text-gray-600 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-gray-600" />
                    </RadioGroupPrimitive.Indicator>
                  </RadioGroupPrimitive.Item>
                  <label htmlFor="1:1" className="text-sm font-medium text-gray-700">
                    1:1
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupPrimitive.Item
                    value="16:9"
                    id="16:9"
                    className="aspect-square h-4 w-4 rounded-full border border-gray-600 text-gray-600 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-gray-600" />
                    </RadioGroupPrimitive.Indicator>
                  </RadioGroupPrimitive.Item>
                  <label htmlFor="16:9" className="text-sm font-medium text-gray-700">
                    16:9
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupPrimitive.Item
                    value="5:4"
                    id="5:4"
                    className="aspect-square h-4 w-4 rounded-full border border-gray-600 text-gray-600 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-gray-600" />
                    </RadioGroupPrimitive.Indicator>
                  </RadioGroupPrimitive.Item>
                  <label htmlFor="5:4" className="text-sm font-medium text-gray-700">
                    5:4
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupPrimitive.Item
                    value="7:5"
                    id="7:5"
                    className="aspect-square h-4 w-4 rounded-full border border-gray-600 text-gray-600 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-gray-600" />
                    </RadioGroupPrimitive.Indicator>
                  </RadioGroupPrimitive.Item>
                  <label htmlFor="7:5" className="text-sm font-medium text-gray-700">
                    7:5
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Trimming Action Buttons */}
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
        </>
      )}

      {!isTrimmingMode && (
        <>
          {mode === 'frame' && (
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

          {/* Mode Selection */}
          <div className="w-full">
            <IconRadioGroup value={mode} onValueChange={handleModeChange}>
              <IconRadioItem value="frame" icon={<IconHorizontalFrame />} />
              <IconRadioItem value="trimming" icon={<IconTrimming />} />
            </IconRadioGroup>
          </div>
        </>
      )}
    </div>
  );
};