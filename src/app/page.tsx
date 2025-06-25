'use client';

import { ImageEditor } from '@/components/feature/ImageEditor';
import { SelectImage } from '@/components/ui/SelectImage/SelectImage';
import { useState } from 'react';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
  };

  const handleDelete = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-[#e4e4e4] flex flex-col items-center gap-16 px-6 pb-28">
      {!selectedImage && (
        <div className="w-full max-w-sm pt-32 flex flex-col items-center gap-8">
          <SelectImage onImageSelectAction={handleImageSelect} />
          
          {/* アプリの説明 */}
          <div className="w-full text-center space-y-4">
            <div className="border border-gray-200 rounded-lg p-5">
              <h2 className="text-base font-medium text-gray-800 mb-4">
                Picram について
              </h2>
              <div className="text-sm text-gray-600 space-y-2 text-left">
                <p>
                  <span className="font-medium text-gray-700">📱 簡単画像編集</span><br />
                  スマートフォンでも使いやすい直感的な操作で、画像のトリミングやフレーム追加ができます。
                </p>
                <p>
                  <span className="font-medium text-gray-700">🔒 プライバシー保護</span><br />
                  画像はすべてお使いの端末内で処理され、インターネットに送信されることはありません。
                </p>
                <p>
                  <span className="font-medium text-gray-700">⚡ 高速処理</span><br />
                  ブラウザ上で動作するため、アプリのダウンロードやアカウント登録は不要です。
                </p>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              対応形式：JPEG、PNG、WebP
            </div>
          </div>
        </div>
      )}
      
      {selectedImage && (
        <div className="w-full max-w-md pt-4">
          <ImageEditor 
            imageFile={selectedImage} 
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}
