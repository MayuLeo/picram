import { Canvas, FabricImage, Rect } from 'fabric';
import { useCallback, useEffect, useState } from 'react';
import type { AspectRatio } from '../types';
import { calculateDisplaySize, setCanvasDisplaySize } from '../utils';

export const useTrimmingEditor = (
  fabricCanvasRef: React.RefObject<Canvas | null>,
  originalImage: FabricImage | null,
  originalImageDataURL: string,
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
    
    // トリミング処理のデバッグログ
    console.log('=== Trimming Debug Info ===');
    
    // 画面上でのトリミング座標（選択範囲）
    const displayCropX = selectionRect.left!;
    const displayCropY = selectionRect.top!;
    const displayCropWidth = selectionRect.getScaledWidth();
    const displayCropHeight = selectionRect.getScaledHeight();
    
    console.log(`1. Display crop area: x=${displayCropX}, y=${displayCropY}, w=${displayCropWidth}, h=${displayCropHeight}`);
    
    // 元画像の実際の配置情報を取得
    const originalImageScaleX = originalImage.scaleX || 1;
    const originalImageScaleY = originalImage.scaleY || 1;
    const originalImageLeft = originalImage.left || 0;
    const originalImageTop = originalImage.top || 0;
    
    console.log(`2. Original image info: scale=(${originalImageScaleX}, ${originalImageScaleY}), position=(${originalImageLeft}, ${originalImageTop})`);
    
    // Canvas情報
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    console.log(`3. Canvas size: ${canvasWidth}x${canvasHeight}`);
    
    // 重要：クロップエリアと元画像の相対位置を計算
    // クロップエリアの座標から元画像の位置を差し引いて、画像内での相対座標を取得
    const relativeX = displayCropX - originalImageLeft;
    const relativeY = displayCropY - originalImageTop;
    
    console.log(`4. Crop area relative to image: x=${relativeX}, y=${relativeY}, w=${displayCropWidth}, h=${displayCropHeight}`);
    
    // Remove the selection rectangle
    canvas.remove(selectionRect);
    
    // 元画像の実際の表示サイズを計算（スケール適用後）
    const scaledImageWidth = originalImage.getScaledWidth();
    const scaledImageHeight = originalImage.getScaledHeight();
    
    console.log(`5. Scaled image display size: ${scaledImageWidth}x${scaledImageHeight}`);
    
    // クロップ範囲が画像サイズを超えないように制限
    const actualCropWidth = Math.min(displayCropWidth, scaledImageWidth - relativeX);
    const actualCropHeight = Math.min(displayCropHeight, scaledImageHeight - relativeY);
    
    console.log(`6. Crop size: ${actualCropWidth}x${actualCropHeight}`);
    
    
    // プレビューでは実際のクロップサイズを使用（アスペクト比補正なし）
    // 保存時にアスペクト比を適用
    const cropWidth = Math.round(actualCropWidth);
    const cropHeight = Math.round(actualCropHeight);
    
    // setDimensensions で内部解像度と表示サイズを同期して設定
    canvas.setDimensions(
      { width: cropWidth, height: cropHeight }, // Canvas内部解像度
      { cssOnly: false } // CSS表示サイズも同時に設定
    );
    
    // プレビュー用の表示サイズを計算（スマホ対応）
    const { displayWidth, displayHeight, displayScale } = calculateDisplaySize(cropWidth, cropHeight);
    
    console.log(`7.5. Display size calculated: ${displayWidth}x${displayHeight} (scale: ${displayScale})`);
    
    // fabric.jsのsetDimensionsが正しく動作しない場合の手動設定
    const lowerCanvas = canvas.lowerCanvasEl;
    const upperCanvas = canvas.upperCanvasEl;
    
    // 内部解像度（HTMLCanvasElementのwidth/height属性）
    if (lowerCanvas) {
      lowerCanvas.width = cropWidth;
      lowerCanvas.height = cropHeight;
    }
    if (upperCanvas) {
      upperCanvas.width = cropWidth;
      upperCanvas.height = cropHeight;
    }
    
    // 表示サイズを設定
    setCanvasDisplaySize(canvas, displayWidth, displayHeight);
    
    console.log(`7. Canvas configured: internal=${cropWidth}x${cropHeight}, display=${displayWidth}x${displayHeight} (scale=${displayScale.toFixed(3)})`);
    
    
    // Clear and redraw with cropped area
    canvas.clear();
    
    FabricImage.fromURL(originalImageDataURL).then((previewImage) => {
      // プレビュー画像の元サイズを取得
      const imageNaturalWidth = previewImage.width!;
      const imageNaturalHeight = previewImage.height!;
      
      console.log(`8. Preview image: ${imageNaturalWidth}x${imageNaturalHeight}, positioning at (${-relativeX}, ${-relativeY})`);
      
      // 新しいキャンバスサイズ（実際のクロップサイズ）に画像を正しく配置
      const newLeft = -relativeX;
      const newTop = -relativeY;
      
      // 元画像のスケールを維持
      previewImage.set({
        left: newLeft,
        top: newTop,
        scaleX: originalImageScaleX,
        scaleY: originalImageScaleY,
        selectable: false,
        evented: false,
      });
      
      canvas.add(previewImage);
      
      // Canvas寸法変更後の描画を遅延実行
      setTimeout(() => {
        // Canvas寸法の再確認と強制更新（内部解像度のみ）
        canvas.setDimensions({ width: cropWidth, height: cropHeight }, { cssOnly: false });
        
        // 表示サイズを再度設定（setDimensionsで上書きされるため）
        setCanvasDisplaySize(canvas, displayWidth, displayHeight);
        
        canvas.calcOffset();
        canvas.renderAll();
        
        console.log(`9. Post-render: canvas=${canvas.getWidth()}x${canvas.getHeight()}, display=${displayWidth}x${displayHeight}`);
        
        console.log('=== Trimming Debug End ===');
      }, 10);
      
      setOriginalImage(previewImage);
    });
    
    setIsTrimmingMode(false);
    setSelectionRect(null);
    
    // 実際の処理で使用する座標（元画像ベース）を返す
    // 元画像内での相対座標をスケールで割って実際のピクセル座標に変換
    const realCropX = relativeX / originalImageScaleX;
    const realCropY = relativeY / originalImageScaleY;
    const realCropWidth = actualCropWidth / originalImageScaleX;
    const realCropHeight = actualCropHeight / originalImageScaleY;
    
    // 保存時にアスペクト比を適用するための計算
    const { width: aspectCorrectedWidth, height: aspectCorrectedHeight } = calculateAspectRatioDimensions(
      aspectRatio,
      realCropWidth,
      realCropHeight
    );
    
    console.log(`10. Save data: crop(${realCropX.toFixed(1)}, ${realCropY.toFixed(1)}, ${realCropWidth.toFixed(1)}, ${realCropHeight.toFixed(1)}) -> aspect(${aspectCorrectedWidth.toFixed(1)}x${aspectCorrectedHeight.toFixed(1)})`);
    
    return {
      x: realCropX,
      y: realCropY,
      width: aspectCorrectedWidth,
      height: aspectCorrectedHeight
    };
  }, [fabricCanvasRef, originalImage, selectionRect, originalImageDataURL, setOriginalImage, aspectRatio, calculateAspectRatioDimensions]);

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