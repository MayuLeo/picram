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
        <div className="w-full max-w-sm pt-32">
          <SelectImage onImageSelectAction={handleImageSelect} />
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
