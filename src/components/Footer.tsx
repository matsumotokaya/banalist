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
                        <p className="text-gray-400 text-sm mb-4">
                            {isJapanese
                                ? 'ブラウザベースのデザインアシスタントツール'
                                : 'Browser-based design assistant tool'}
                        </p>
                        <div className="flex gap-4 items-center">
                            <a 
                                href="https://whatif-ep.xyz/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                                {isJapanese ? 'ホームページ' : 'Homepage'}
                            </a>
                            <a 
                                href="https://www.instagram.com/whatif.ep/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                                aria-label="Instagram"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                            <a 
                                href="https://whatif.stores.jp/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                                </svg>
                                {isJapanese ? 'ショップ' : 'Shop'}
                            </a>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                        <Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors">
                            {isJapanese ? 'About Us' : 'About Us'}
                        </Link>
                        <Link to="/legal/specified-commercial-transactions-act" className="text-gray-400 hover:text-white text-sm transition-colors">
                            {isJapanese ? '特定商取引法に基づく表記' : 'Legal Information'}
                        </Link>
                        <Link to="/legal/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                            {isJapanese ? 'プライバシーポリシー' : 'Privacy Policy'}
                        </Link>
                        <Link to="/legal/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                            {isJapanese ? '利用規約' : 'Terms of Service'}
                        </Link>
                        <Link to="/legal/security" className="text-gray-400 hover:text-white text-sm transition-colors">
                            {isJapanese ? 'セキュリティポリシー' : 'Security Policy'}
                        </Link>
                        <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                            {isJapanese ? 'お問い合わせ' : 'Contact'}
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
