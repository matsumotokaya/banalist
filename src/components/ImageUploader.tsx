import { useState } from 'react';
import { ImageLibraryModal } from './ImageLibraryModal';

interface ImageUploaderProps {
  onAddImage: (src: string, width: number, height: number) => void;
}

export const ImageUploader = ({ onAddImage }: ImageUploaderProps) => {
  const [showLibrary, setShowLibrary] = useState(false);
  const [initialTab, setInitialTab] = useState<'default' | 'user'>('user');

  const handleOpenLibraryForUpload = () => {
    setInitialTab('user');
    setShowLibrary(true);
  };

  const handleOpenLibrary = () => {
    setInitialTab('default');
    setShowLibrary(true);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleOpenLibraryForUpload}
        className="block w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all text-center"
      >
        <div className="flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[20px]">upload</span>
          <span>画像をアップロード</span>
        </div>
      </button>

      <button
        onClick={handleOpenLibrary}
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
        initialTab={initialTab}
      />
    </div>
  );
};
