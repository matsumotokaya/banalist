import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import type { DefaultImage, UserImage } from '../types/image-library';

interface ImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string, width: number, height: number) => void;
}

type TabType = 'default' | 'user';

export const ImageLibraryModal = ({ isOpen, onClose, onSelectImage }: ImageLibraryModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('default');
  const [defaultImages, setDefaultImages] = useState<DefaultImage[]>([]);
  const [userImages, setUserImages] = useState<UserImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch default images
  const fetchDefaultImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('default_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching default images:', error);
    } else {
      setDefaultImages(data || []);
    }
    setLoading(false);
  };

  // Fetch user images
  const fetchUserImages = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('user_images')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user images:', error);
    } else {
      setUserImages(data || []);
    }
    setLoading(false);
  };

  // Check if current user is admin by querying profiles table
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data?.role === 'admin');
      }
    };
    checkAdmin();
  }, []);

  // Load images when modal opens or tab changes
  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'default') {
        fetchDefaultImages();
      } else {
        fetchUserImages();
      }
    }
  }, [isOpen, activeTab]);

  // Handle file upload (works for both default and user images)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('ログインが必要です');
      return;
    }

    setUploading(true);

    try {
      // Get image dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });

      const width = img.width;
      const height = img.height;
      URL.revokeObjectURL(objectUrl);

      const fileName = `${Date.now()}-${file.name}`;

      if (activeTab === 'default') {
        // Upload to default-images bucket
        const filePath = fileName; // No user folder for default images

        const { error: uploadError } = await supabase.storage
          .from('default-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save metadata to default_images table
        const { error: dbError } = await supabase
          .from('default_images')
          .insert({
            name: file.name,
            storage_path: filePath,
            width,
            height,
            file_size: file.size,
            tags: [],
          });

        if (dbError) throw dbError;

        // Refresh default images list
        await fetchDefaultImages();
      } else {
        // Upload to user-images bucket
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('user-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save metadata to user_images table
        const { error: dbError } = await supabase
          .from('user_images')
          .insert({
            user_id: user.id,
            name: file.name,
            storage_path: filePath,
            width,
            height,
            file_size: file.size,
          });

        if (dbError) throw dbError;

        // Refresh user images list
        await fetchUserImages();
      }

      alert('画像をアップロードしました');
    } catch (error) {
      console.error('Upload error:', error);
      alert('アップロードに失敗しました');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Get public URL for image
  const getImageUrl = (storagePath: string, bucketName: 'default-images' | 'user-images') => {
    const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
    return data.publicUrl;
  };

  // Handle image selection
  const handleSelectDefaultImage = (image: DefaultImage) => {
    const url = getImageUrl(image.storage_path, 'default-images');
    onSelectImage(url, image.width || 800, image.height || 600);
    onClose();
  };

  const handleSelectUserImage = (image: UserImage) => {
    const url = getImageUrl(image.storage_path, 'user-images');
    onSelectImage(url, image.width || 800, image.height || 600);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">画像ライブラリ</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-gray-600">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b px-6">
          <button
            onClick={() => setActiveTab('default')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'default'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            デフォルト
          </button>
          <button
            onClick={() => setActiveTab('user')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'user'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            マイライブラリ
          </button>
        </div>

        {/* Upload button (admin only for default tab, all users for user tab) */}
        {(activeTab === 'user' || isAdmin) && (
          <div className="px-6 py-3 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors">
                <span className="material-symbols-outlined text-[20px]">upload</span>
                <span className="text-sm font-medium">{uploading ? 'アップロード中...' : '画像をアップロード'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {activeTab === 'default' && isAdmin && (
                <span className="text-xs text-green-600 font-medium">
                  👑 管理者権限
                </span>
              )}
            </div>
          </div>
        )}

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : activeTab === 'default' ? (
            defaultImages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                デフォルト画像がまだありません
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {defaultImages.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => handleSelectDefaultImage(image)}
                    className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-600 transition-all"
                  >
                    <img
                      src={getImageUrl(image.storage_path, 'default-images')}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 text-4xl">
                        add_circle
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-2 truncate">
                      {image.name}
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : (
            userImages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                画像をアップロードしてライブラリに追加しましょう
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {userImages.map((image) => (
                  <button
                    key={image.id}
                    onClick={() => handleSelectUserImage(image)}
                    className="group relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-600 transition-all"
                  >
                    <img
                      src={getImageUrl(image.storage_path, 'user-images')}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 text-4xl">
                        add_circle
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-2 truncate">
                      {image.name}
                    </div>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
