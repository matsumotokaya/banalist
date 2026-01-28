import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function Footer() {
    const { i18n } = useTranslation();
    const isJapanese = i18n.language === 'ja';

    return (
        <footer className="bg-[#212526] border-t border-gray-800 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start">
                        <h2 className="text-xl font-bold text-white mb-2">WHATIF</h2>
                        <p className="text-gray-400 text-sm">
                            {isJapanese
                                ? 'ブラウザベースのバナーデザインアシスタントツール'
                                : 'Browser-based banner design assistant tool'}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                        <Link to="/legal/tokushoho" className="text-gray-400 hover:text-white text-sm transition-colors">
                            {isJapanese ? '特定商取引法に基づく表記' : 'Legal Information'}
                        </Link>
                        <Link to="/legal/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                            {isJapanese ? 'プライバシーポリシー' : 'Privacy Policy'}
                        </Link>
                        <Link to="/legal/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                            {isJapanese ? '利用規約' : 'Terms of Service'}
                        </Link>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-xs">
                        © 2026 WHATIF. All rights reserved.
                    </p>
                    <p className="text-gray-500 text-xs">
                        {isJapanese ? '運営: 松本 夏弥' : 'Operated by Kaya Matsumoto'}
                    </p>
                </div>
            </div>
        </footer>
    );
}
