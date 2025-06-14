'use client';

import { Button } from '@/components/ui/Button';
import { IconHorizontalFrame, IconTrimming } from '@/components/ui/Icon';
import { IconRadioGroup, IconRadioItem } from '@/components/ui/RadioGroup/IconRadioGroup';
import { useEffect, useState } from 'react';
import { FrameControls } from './FrameControls';
import { useCanvasSetup, useFrameEditor, useTrimmingEditor } from './hooks';
import { TrimmingControls } from './TrimmingControls';
import type { EditHistory, EditMode, ImageEditorProps } from './types';
import { processImageWithHistory } from './utils';

export const ImageEditor = ({ imageFile, onImageLoad, onDelete }: ImageEditorProps) => {
  const [mode, setMode] = useState<EditMode>('frame');
  const [editHistory, setEditHistory] = useState<EditHistory>({});

  // Canvas setup hook
  const {
    canvasRef,
    fabricCanvasRef,
    originalImage,
    originalImageDataURL,
    setOriginalImage,
  } = useCanvasSetup(imageFile, onImageLoad);

  // Frame editor hook
  const {
    frameType,
    frameWidth,
    frameColor,
    handleFrameTypeChange,
    handleFrameColorChange,
    handleFrameWidthChange,
    getFrameData,
  } = useFrameEditor(fabricCanvasRef, originalImage);

  // Trimming editor hook
  const {
    aspectRatio,
    isTrimmingMode,
    handleAspectRatioChange,
    startCrop,
    applyCrop,
    cancelCrop,
  } = useTrimmingEditor(
    fabricCanvasRef,
    originalImage,
    originalImageDataURL,
    setOriginalImage
  );

  // Reset edit history when new image is loaded
  useEffect(() => {
    if (imageFile) {
      setEditHistory({});
    }
  }, [imageFile]);

  // Update edit history when frame changes
  useEffect(() => {
    const frameData = getFrameData();
    setEditHistory(prev => ({
      ...prev,
      frame: frameData
    }));
  }, [getFrameData]);

  const handleModeChange = (value: string) => {
    const newMode = value as EditMode;
    setMode(newMode);
    
    if (newMode === 'trimming') {
      startCrop();
    } else if (isTrimmingMode) {
      cancelCrop();
    }
  };

  const handleApplyCrop = () => {
    const cropData = applyCrop();
    if (cropData) {
      setEditHistory(prev => ({
        ...prev,
        crop: cropData
      }));
    }
  };

  const handleCancelCrop = () => {
    cancelCrop();
  };

  const handleDelete = () => {
    if (onDelete) onDelete();
  };

  const handleSave = async () => {
    if (!originalImageDataURL) return;
    
    try {
      const originalName = imageFile?.name || 'image';
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
      const filename = `${nameWithoutExt}-edited.jpg`;
      
      await processImageWithHistory(originalImageDataURL, editHistory, filename);
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  };

  return (
    <div className="w-full flex flex-col items-end gap-6">
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
          style={{ 
            display: 'block', 
            visibility: 'visible',
            maxWidth: '100%',
            height: 'auto' 
          }} 
        />
      </div>

      {/* Trimming Controls */}
      {isTrimmingMode && (
        <TrimmingControls
          aspectRatio={aspectRatio}
          onAspectRatioChange={handleAspectRatioChange}
          onCancel={handleCancelCrop}
          onApply={handleApplyCrop}
        />
      )}

      {/* Frame Controls */}
      {!isTrimmingMode && mode === 'frame' && (
        <FrameControls
          frameType={frameType}
          frameColor={frameColor}
          frameWidth={frameWidth}
          onFrameTypeChange={handleFrameTypeChange}
          onFrameColorChange={handleFrameColorChange}
          onFrameWidthChange={handleFrameWidthChange}
        />
      )}

      {/* Mode Selection */}
      {!isTrimmingMode && (
        <div className="w-full">
          <IconRadioGroup value={mode} onValueChange={handleModeChange}>
            <IconRadioItem value="frame" icon={<IconHorizontalFrame />} />
            <IconRadioItem value="trimming" icon={<IconTrimming />} />
          </IconRadioGroup>
        </div>
      )}
    </div>
  );
};