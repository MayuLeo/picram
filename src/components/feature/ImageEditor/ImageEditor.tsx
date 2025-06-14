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
  const [isSaving, setIsSaving] = useState(false);

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
    if (!originalImageDataURL || isSaving) return;
    
    setIsSaving(true);
    try {
      const originalName = imageFile?.name || 'image';
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
      const filename = `${nameWithoutExt}-edited.jpg`;
      
      await processImageWithHistory(originalImageDataURL, editHistory, filename);
    } catch (error) {
      console.error('Failed to save image:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-end gap-6">
      {/* Buttons */}
      <div className="w-full flex justify-between items-center px-4">
        <Button variant="danger" onClick={handleDelete} disabled={isSaving}>
          削除
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? '保存中...' : '保存'}
        </Button>
      </div>

      {/* Canvas */}
      <div className="w-full flex justify-center relative">
        <canvas 
          ref={canvasRef} 
          style={{ 
            display: 'block', 
            visibility: 'visible',
            maxWidth: '100%',
            height: 'auto' 
          }} 
        />
        {isSaving && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-900 font-medium">保存中...</span>
            </div>
          </div>
        )}
      </div>

      {/* Trimming Controls */}
      {isTrimmingMode && !isSaving && (
        <TrimmingControls
          aspectRatio={aspectRatio}
          onAspectRatioChange={handleAspectRatioChange}
          onCancel={handleCancelCrop}
          onApply={handleApplyCrop}
        />
      )}

      {/* Frame Controls */}
      {!isTrimmingMode && mode === 'frame' && !isSaving && (
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
      {!isTrimmingMode && !isSaving && (
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