
'use client';

import { useState } from 'react';
import { SelectImage } from '@/components/ui/SelectImage/SelectImage';
import { ImageEditor } from '@/components/feature/ImageEditor';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
  };

  const handleDelete = () => {
    setSelectedImage(null);
  };

  const handleSave = () => {
    console.log('画像を保存しました');
  };

  return (
    <div className="min-h-screen bg-[#FBFCFF] flex flex-col items-center gap-16 pt-32 px-6 pb-28">
      {!selectedImage && (
        <div className="w-full max-w-sm">
          <SelectImage onImageSelectAction={handleImageSelect} />
        </div>
      )}
      
      {selectedImage && (
        <div className="w-full max-w-md">
          <ImageEditor 
            imageFile={selectedImage} 
            onDelete={handleDelete}
            onSave={handleSave}
          />
        </div>
      )}
      
      <div className="w-full max-w-sm">
        <div className="flex items-stretch px-2 py-6">
          <p className="text-black font-bold text-xs leading-[1.36] w-full h-[27px] flex items-center">
            写真に枠をつけることのできるサービスです
          </p>
        </div>
      </div>
    </div>
  );
}
