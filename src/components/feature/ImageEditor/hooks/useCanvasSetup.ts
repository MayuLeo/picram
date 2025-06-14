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
    if (!canvasRef.current) {
      return;
    }

    // 既にfabric canvasが初期化されている場合は処理を停止
    if (fabricCanvasRef.current) {
      return;
    }
    
    // iPhone Safari対応: Canvas要素の事前設定
    const canvasElement = canvasRef.current;
    canvasElement.style.display = 'block';
    canvasElement.style.visibility = 'visible';
    canvasElement.style.position = 'relative';
    
    // iPhone Safari対応: 短い遅延後にfabric Canvasを作成
    const initFabricCanvas = () => {
      // 再度確認（非同期処理中に初期化されている可能性）
      if (fabricCanvasRef.current) {
        return;
      }
      
      try {
        const fabricCanvas = new Canvas(canvasRef.current!, {
          width: 400,
          height: 400,
          backgroundColor: '#ffffff',
          renderOnAddRemove: true,
          skipTargetFind: false,
        });

        fabricCanvasRef.current = fabricCanvas;

        // iPhone Safari対応: Canvas作成直後の積極的なレンダリング
        const forceInitialRender = () => {
          try {
            fabricCanvas.renderAll();
          } catch (error) {
            console.error('Initial render failed:', error);
          }
        };

        forceInitialRender();
        
        // iPhone Safari対応: 段階的なレンダリング
        setTimeout(forceInitialRender, 10);
        setTimeout(forceInitialRender, 50);
        setTimeout(forceInitialRender, 100);
        setTimeout(forceInitialRender, 200);
        
      } catch (error) {
        console.error('Failed to create fabric canvas:', error);
        // エラーが発生した場合はfabricCanvasRefをクリア
        fabricCanvasRef.current = null;
      }
    };

    // iPhone Safari対応: DOM準備を待ってからCanvas初期化
    setTimeout(initFabricCanvas, 10);

    return () => {
      if (fabricCanvasRef.current) {
        try {
          fabricCanvasRef.current.dispose();
        } catch (error) {
          console.warn('Canvas disposal failed:', error);
        } finally {
          fabricCanvasRef.current = null;
        }
      }
    };
  }, []);

  // Load image into canvas
  useEffect(() => {
    if (!imageFile || !canvasRef.current) {
      return;
    }

    // Fabric canvasが準備できるまで待機
    if (!fabricCanvasRef.current) {
      const checkCanvas = () => {
        if (fabricCanvasRef.current) {
          loadImageToCanvas();
        } else {
          setTimeout(checkCanvas, 100);
        }
      };
      setTimeout(checkCanvas, 100);
      return;
    }

    loadImageToCanvas();

    function loadImageToCanvas() {
      if (!imageFile || !fabricCanvasRef.current || !canvasRef.current) {
        return;
      }

      const canvas = fabricCanvasRef.current;
      const canvasElement = canvasRef.current;
      const reader = new FileReader();

    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setOriginalImageDataURL(imageUrl);
      
      // iPhone Safari対応: HTMLImageElementを直接使用してからFabricImageに変換
      const htmlImage = new Image();
      htmlImage.crossOrigin = 'anonymous';
      
      htmlImage.onload = () => {
        try {
          canvas.clear();
        } catch (error) {
          console.warn('Canvas clear failed:', error);
          return;
        }
        
        const imageWidth = htmlImage.width || 1;
        const imageHeight = htmlImage.height || 1;
        
        const dimensions = calculateImageDimensions(imageWidth, imageHeight);
        setImageDimensions(dimensions);
        
        setupCanvas(canvas, canvasElement, dimensions);
        
        // iPhone Safari対応: Canvas内部サイズに合わせてFabricImageをスケール
        const fabricImage = new FabricImage(htmlImage, {
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
          scaleX: dimensions.canvasScale,
          scaleY: dimensions.canvasScale,
        });
        
        canvas.add(fabricImage);
        setOriginalImage(fabricImage);
        
        // iPhone Safari対応: より積極的なレンダリングとDOM操作
        const forceRender = () => {
          try {
            canvas.renderAll();
            
            // Safari対応: Canvas要素を強制的に再描画
            const lowerCanvas = canvasElement.parentElement?.querySelector('.lower-canvas') as HTMLCanvasElement;
            if (lowerCanvas) {
              const ctx = lowerCanvas.getContext('2d');
              if (ctx) {
                // 強制的に再描画をトリガー
                ctx.save();
                ctx.restore();
              }
            }
          } catch (error) {
            console.error('Render failed:', error);
          }
        };
        
        // 即座にレンダリング
        forceRender();
        
        // 遅延レンダリング（複数回）
        setTimeout(forceRender, 10);
        setTimeout(forceRender, 50);
        setTimeout(() => {
          forceRender();
          if (onImageLoad) {
            onImageLoad(canvas);
          }
        }, 100);
        setTimeout(forceRender, 200);
        setTimeout(forceRender, 500);
      };
      
      htmlImage.onerror = (error) => {
        console.error('Image load failed:', error);
      };
      
      htmlImage.src = imageUrl;
    };

    reader.readAsDataURL(imageFile);
    }
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