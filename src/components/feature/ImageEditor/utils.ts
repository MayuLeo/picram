import { Canvas, FabricImage, Rect } from 'fabric';
import type { FrameColor, FrameType } from './types';

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
  color: FrameColor,
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

  // Map color type to hex value
  const frameColorValue = color === 'white' ? '#ffffff' : '#000000';

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
      fill: frameColorValue,
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
      fill: frameColorValue,
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
      fill: frameColorValue,
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
      fill: frameColorValue,
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
        fill: frameColorValue,
        selectable: false,
        evented: false,
        isFrame: true,
      }),
      new Rect({
        left: 0,
        top: canvasHeight - framePixels,
        width: canvasWidth,
        height: framePixels,
        fill: frameColorValue,
        selectable: false,
        evented: false,
        isFrame: true,
      }),
      new Rect({
        left: 0,
        top: 0,
        width: framePixels,
        height: canvasHeight,
        fill: frameColorValue,
        selectable: false,
        evented: false,
        isFrame: true,
      }),
      new Rect({
        left: canvasWidth - framePixels,
        top: 0,
        width: framePixels,
        height: canvasHeight,
        fill: frameColorValue,
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
  // Get canvas as data URL in JPEG format for smaller file size
  const dataURL = canvas.toDataURL({
    format: 'jpeg',
    quality: 0.85, // 85% quality for good balance of size and quality
    multiplier: 1, // Use 1x to avoid excessive file size
  });

  // Create download link
  const link = document.createElement('a');
  link.download = filename || `edited-image-${Date.now()}.jpg`;
  link.href = dataURL;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// On-demand processing function that applies edit history to original image
export const processImageWithHistory = async (
  originalImageDataURL: string,
  editHistory: import('./types').EditHistory,
  filename?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function() {
      // Create temporary canvas for processing
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Determine final canvas size based on crop history
      let finalWidth = img.width;
      let finalHeight = img.height;
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;

      if (editHistory.crop) {
        finalWidth = editHistory.crop.width;
        finalHeight = editHistory.crop.height;
        sourceX = editHistory.crop.x;
        sourceY = editHistory.crop.y;
        sourceWidth = editHistory.crop.width;
        sourceHeight = editHistory.crop.height;
      }

      tempCanvas.width = finalWidth;
      tempCanvas.height = finalHeight;

      // Draw cropped image
      tempCtx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, finalWidth, finalHeight
      );

      // Apply frame if present
      if (editHistory.frame && editHistory.frame.width > 0) {
        const frameWidthPercent = editHistory.frame.width / 100;
        const maxFrameSize = Math.min(finalWidth, finalHeight) / 2;
        const framePixels = maxFrameSize * frameWidthPercent;
        const frameColor = editHistory.frame.color === 'white' ? '#ffffff' : '#000000';

        tempCtx.fillStyle = frameColor;

        if (editHistory.frame.type === 'horizontal') {
          // Top frame
          tempCtx.fillRect(0, 0, finalWidth, framePixels);
          // Bottom frame
          tempCtx.fillRect(0, finalHeight - framePixels, finalWidth, framePixels);
        } else if (editHistory.frame.type === 'vertical') {
          // Left frame
          tempCtx.fillRect(0, 0, framePixels, finalHeight);
          // Right frame
          tempCtx.fillRect(finalWidth - framePixels, 0, framePixels, finalHeight);
        } else if (editHistory.frame.type === 'all') {
          // All four sides
          tempCtx.fillRect(0, 0, finalWidth, framePixels); // Top
          tempCtx.fillRect(0, finalHeight - framePixels, finalWidth, framePixels); // Bottom
          tempCtx.fillRect(0, 0, framePixels, finalHeight); // Left
          tempCtx.fillRect(finalWidth - framePixels, 0, framePixels, finalHeight); // Right
        }
      }

      // Get final image data in JPEG format
      const finalDataURL = tempCanvas.toDataURL('image/jpeg', 0.85);

      // Create download link
      const link = document.createElement('a');
      link.download = filename || `edited-image-${Date.now()}.jpg`;
      link.href = finalDataURL;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      tempCanvas.width = 0;
      tempCanvas.height = 0;

      resolve();
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = originalImageDataURL;
  });
};