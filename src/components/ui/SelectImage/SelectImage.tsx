'use client';

import { ChangeEvent, useRef } from 'react';
import { SelectImageProps } from './types';

export function SelectImage({ onImageSelectAction, className = '' }: SelectImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelectAction(file);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-2.5 p-12 bg-white border border-black border-dashed rounded-[23px] ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleClick}
        className="flex items-center justify-center gap-2.5 px-6 py-1 bg-[#1C6E8C] rounded-lg w-full"
      >
        <span className="text-white font-bold text-xs leading-[1.36] text-center">
          写真を選択
        </span>
      </button>
    </div>
  );
}