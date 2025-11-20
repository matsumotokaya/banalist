import { useRef } from 'react';

interface ImageUploaderProps {
  onAddImage: (src: string, width: number, height: number) => void;
}

export const ImageUploader = ({ onAddImage }: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        // Get original dimensions
        const originalWidth = img.width;
        const originalHeight = img.height;

        // Calculate scaled dimensions (max 400px for initial placement)
        const maxSize = 400;
        let width = originalWidth;
        let height = originalHeight;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        onAddImage(event.target?.result as string, width, height);
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
    <div>
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
      <p className="text-xs text-gray-500 mt-2">
        JPG, PNG, GIF対応
      </p>
    </div>
  );
};
