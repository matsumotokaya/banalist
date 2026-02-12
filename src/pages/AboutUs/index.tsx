import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EnglishContent } from './content/EnglishContent';
import { JapaneseContent } from './content/JapaneseContent';
import { KoreanContent } from './content/KoreanContent';
import { ChineseSimplifiedContent } from './content/ChineseSimplifiedContent';
import { ChineseTraditionalContent } from './content/ChineseTraditionalContent';

export function AboutUs() {
  const { i18n } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const ContentComponent = {
    'en': EnglishContent,
    'ja': JapaneseContent,
    'ko': KoreanContent,
    'zh-CN': ChineseSimplifiedContent,
    'zh-TW': ChineseTraditionalContent,
  }[i18n.language] || EnglishContent;

  const getTitle = () => {
    switch (i18n.language) {
      case 'ja': return 'サービスについて';
      case 'ko': return '서비스 소개';
      case 'zh-CN': return '关于我们';
      case 'zh-TW': return '關於我們';
      default: return 'About Us';
    }
  };

  const getSubtitle = () => {
    switch (i18n.language) {
      case 'ja': return 'サービスについて';
      case 'ko': return '우리의 서비스에 대하여';
      case 'zh-CN': return '关于我们的服务';
      case 'zh-TW': return '關於我們的服務';
      default: return 'About Our Service';
    }
  };

  const getBackText = () => {
    switch (i18n.language) {
      case 'ja': return 'ホームに戻る';
      case 'ko': return '홈으로 돌아가기';
      case 'zh-CN': return '返回首页';
      case 'zh-TW': return '返回首頁';
      default: return 'Back to Home';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← {getBackText()}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {getTitle()}
          </h1>
          <p className="text-gray-600 mt-2">
            {getSubtitle()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <ContentComponent
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
          />
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300"
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="拡大表示"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-200 pb-6 last:border-0">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="text-gray-700">{children}</div>
    </div>
  );
}

export { Section };
