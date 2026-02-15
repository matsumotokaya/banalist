import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EnglishContent } from './content/EnglishContent';
import { JapaneseContent } from './content/JapaneseContent';
import { KoreanContent } from './content/KoreanContent';
import { ChineseSimplifiedContent } from './content/ChineseSimplifiedContent';
import { ChineseTraditionalContent } from './content/ChineseTraditionalContent';

export function Tokushoho() {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const getContent = () => {
    switch (lang) {
      case 'ja':
        return <JapaneseContent />;
      case 'ko':
        return <KoreanContent />;
      case 'zh-CN':
        return <ChineseSimplifiedContent />;
      case 'zh-TW':
        return <ChineseTraditionalContent />;
      default:
        return <EnglishContent />;
    }
  };

  const getTitle = () => {
    switch (lang) {
      case 'ja': return '特定商取引法に基づく表記';
      case 'ko': return '특정상거래법 표기';
      case 'zh-CN': return '特定商业交易法表记';
      case 'zh-TW': return '特定商業交易法表記';
      default: return 'Specified Commercial Transactions Act';
    }
  };

  const getBackText = () => {
    switch (lang) {
      case 'ja': return 'ホームに戻る';
      case 'ko': return '홈으로 돌아가기';
      case 'zh-CN': return '返回首页';
      case 'zh-TW': return '返回首頁';
      default: return 'Back to Home';
    }
  };

  const getLastUpdated = () => {
    switch (lang) {
      case 'ja': return '最終更新日: 2026年2月15日';
      case 'ko': return '최종 업데이트: 2026년 2월 15일';
      case 'zh-CN': return '最后更新: 2026年2月15日';
      case 'zh-TW': return '最後更新: 2026年2月15日';
      default: return 'Last Updated: February 15, 2026';
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
          {getContent()}
        </div>
      </div>
    </div>
  );
}
