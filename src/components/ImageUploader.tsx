import { useRef, useState } from 'react';
import { ImageLibraryModal } from './ImageLibraryModal';

interface ImageUploaderProps {
  onAddImage: (src: string, width: number, height: number) => void;
}

export const ImageUploader = ({ onAddImage }: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert FileList to Array
    const fileArray = Array.from(files);

    // Check if all files are images
    const invalidFiles = fileArray.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      alert('画像ファイルのみ選択してください');
      return;
    }

    // Process each file
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];

      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            // Use original image dimensions
            const originalWidth = img.width;
            const originalHeight = img.height;
            const dataUrl = event.target?.result as string;

            // Add image to canvas (position is calculated in BannerEditor)
            onAddImage(dataUrl, originalWidth, originalHeight);

            resolve();
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    }

    // Reset input so same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className="block w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-all text-center"
      >
        <div className="flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[20px]">upload</span>
          <span>画像をアップロード（複数可）</span>
        </div>
      </label>

      <button
        onClick={() => setShowLibrary(true)}
        className="block w-full px-4 py-3 bg-white border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 text-sm font-medium rounded-lg transition-all text-center"
      >
        <div className="flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[20px]">photo_library</span>
          <span>ライブラリから選ぶ</span>
        </div>
      </button>

      <p className="text-xs text-gray-500 mt-2">
        JPG, PNG, GIF対応
      </p>

      <ImageLibraryModal
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        onSelectImage={onAddImage}
      />
    </div>
  );
};
