import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EnglishContent } from './content/EnglishContent';
import { JapaneseContent } from './content/JapaneseContent';
import { KoreanContent } from './content/KoreanContent';
import { ChineseSimplifiedContent } from './content/ChineseSimplifiedContent';
import { ChineseTraditionalContent } from './content/ChineseTraditionalContent';

export function SecurityPolicy() {
  const { i18n } = useTranslation();

  const ContentComponent = {
    'en': EnglishContent,
    'ja': JapaneseContent,
    'ko': KoreanContent,
    'zh-CN': ChineseSimplifiedContent,
    'zh-TW': ChineseTraditionalContent,
  }[i18n.language] || EnglishContent;

  const getTitle = () => {
    switch (i18n.language) {
      case 'ja': return 'セキュリティポリシー';
      case 'ko': return '보안 정책';
      case 'zh-CN': return '安全政策';
      case 'zh-TW': return '安全政策';
      default: return 'Security Policy';
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

  const getLastUpdated = () => {
    switch (i18n.language) {
      case 'ja': return '最終更新日: 2026年2月8日';
      case 'ko': return '최종 업데이트: 2026년 2월 8일';
      case 'zh-CN': return '最后更新: 2026年2月8日';
      case 'zh-TW': return '最後更新: 2026年2月8日';
      default: return 'Last Updated: February 8, 2026';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← {getBackText()}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{getTitle()}</h1>
          <p className="text-gray-600 mt-2">{getLastUpdated()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <ContentComponent />
        </div>
      </div>
    </div>
  );
}
