import { useRef, useState } from 'react';
import { ImageLibraryModal } from './ImageLibraryModal';

interface ImageUploaderProps {
  onAddImage: (src: string, width: number, height: number) => void;
}

export const ImageUploader = ({ onAddImage }: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Use original image dimensions (1:1 scale)
        const originalWidth = img.width;
        const originalHeight = img.height;

        onAddImage(event.target?.result as string, originalWidth, originalHeight);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
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
          <span>画像をアップロード</span>
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
