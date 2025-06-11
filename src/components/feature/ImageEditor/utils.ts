import { Canvas, FabricImage, Rect } from 'fabric';
import type { FrameType } from './types';

export const calculateImageDimensions = (imageWidth: number, imageHeight: number) => {
  const maxDisplayWidth = 320;
  const maxDisplayHeight = 380;
  
  const scaleX = maxDisplayWidth / imageWidth;
  const scaleY = maxDisplayHeight / imageHeight;
  const displayScale = Math.min(scaleX, scaleY, 1); // Don't scale up small images
  
  const displayWidth = imageWidth * displayScale;
  const displayHeight = imageHeight * displayScale;
  
  return {
    displayWidth,
    displayHeight,
    displayScale,
    originalWidth: imageWidth,
    originalHeight: imageHeight,
  };
};

export const setupCanvas = (
  canvas: Canvas,
  canvasElement: HTMLCanvasElement,
  dimensions: ReturnType<typeof calculateImageDimensions>
) => {
  const { displayWidth, displayHeight, originalWidth, originalHeight } = dimensions;
  
  // Set canvas internal size to original resolution
  canvas.setDimensions({
    width: originalWidth,
    height: originalHeight
  });
  
  // Wait for fabric.js to create all elements, then adjust sizes
  setTimeout(() => {
    // Find fabric.js canvas wrapper
    const canvasWrapper = canvasElement.parentElement;
    if (canvasWrapper && canvasWrapper.classList.contains('canvas-container')) {
      // Set wrapper size to display size
      canvasWrapper.style.width = `${displayWidth}px`;
      canvasWrapper.style.height = `${displayHeight}px`;
    }
    
    // Set both lower-canvas and upper-canvas display sizes
    const lowerCanvas = canvasWrapper?.querySelector('.lower-canvas') as HTMLCanvasElement;
    const upperCanvas = canvasWrapper?.querySelector('.upper-canvas') as HTMLCanvasElement;
    
    if (lowerCanvas) {
      lowerCanvas.style.width = `${displayWidth}px`;
      lowerCanvas.style.height = `${displayHeight}px`;
    }
    
    if (upperCanvas) {
      upperCanvas.style.width = `${displayWidth}px`;
      upperCanvas.style.height = `${displayHeight}px`;
    }
  }, 0);
};

export const createFrameRects = (
  canvas: Canvas,
  type: FrameType,
  width: number,
  originalImage: FabricImage | null
) => {
  if (!originalImage || width === 0) {
    // Remove existing frames
    const objects = canvas.getObjects();
    objects.forEach(obj => {
      if (obj.get('isFrame')) {
        canvas.remove(obj);
      }
    });
    canvas.renderAll();
    return;
  }

  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  const frameWidthPercent = width / 100;
  const maxFrameSize = Math.min(canvasWidth, canvasHeight) / 2;
  const framePixels = maxFrameSize * frameWidthPercent;

  // Remove existing frames
  const objects = canvas.getObjects();
  objects.forEach(obj => {
    if (obj.get('isFrame')) {
      canvas.remove(obj);
    }
  });

  const frames: Rect[] = [];

  if (type === 'horizontal') {
    // Top frame
    frames.push(new Rect({
      left: 0,
      top: 0,
      width: canvasWidth,
      height: framePixels,
      fill: '#ffffff',
      selectable: false,
      evented: false,
      isFrame: true,
    }));
    
    // Bottom frame
    frames.push(new Rect({
      left: 0,
      top: canvasHeight - framePixels,
      width: canvasWidth,
      height: framePixels,
      fill: '#ffffff',
      selectable: false,
      evented: false,
      isFrame: true,
    }));
  } else if (type === 'vertical') {
    // Left frame
    frames.push(new Rect({
      left: 0,
      top: 0,
      width: framePixels,
      height: canvasHeight,
      fill: '#ffffff',
      selectable: false,
      evented: false,
      isFrame: true,
    }));
    
    // Right frame
    frames.push(new Rect({
      left: canvasWidth - framePixels,
      top: 0,
      width: framePixels,
      height: canvasHeight,
      fill: '#ffffff',
      selectable: false,
      evented: false,
      isFrame: true,
    }));
  } else if (type === 'all') {
    // All four sides
    frames.push(
      new Rect({
        left: 0,
        top: 0,
        width: canvasWidth,
        height: framePixels,
        fill: '#ffffff',
        selectable: false,
        evented: false,
        isFrame: true,
      }),
      new Rect({
        left: 0,
        top: canvasHeight - framePixels,
        width: canvasWidth,
        height: framePixels,
        fill: '#ffffff',
        selectable: false,
        evented: false,
        isFrame: true,
      }),
      new Rect({
        left: 0,
        top: 0,
        width: framePixels,
        height: canvasHeight,
        fill: '#ffffff',
        selectable: false,
        evented: false,
        isFrame: true,
      }),
      new Rect({
        left: canvasWidth - framePixels,
        top: 0,
        width: framePixels,
        height: canvasHeight,
        fill: '#ffffff',
        selectable: false,
        evented: false,
        isFrame: true,
      })
    );
  }

  canvas.add(...frames);
  canvas.renderAll();
};

export const saveCanvasAsImage = (canvas: Canvas, filename?: string) => {
  // Get canvas as data URL (high resolution)
  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1.0,
    multiplier: 1, // Use original resolution
  });

  // Create download link
  const link = document.createElement('a');
  link.download = filename || `edited-image-${Date.now()}.png`;
  link.href = dataURL;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};