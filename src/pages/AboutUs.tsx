import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function AboutUs() {
  const { i18n } = useTranslation();
  const isJapanese = i18n.language === 'ja';
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← {isJapanese ? 'ホームに戻る' : 'Back to Home'}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isJapanese ? 'サービスについて' : 'About Us'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isJapanese ? 'サービスについて' : 'About Our Service'}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {isJapanese ? (
            <>
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  あなたはどう完成させる？<br />99%完成済みデザインキット、IMAGINE(イマジン)
                </h2>
                <div className="text-gray-700">
                  <p className="mb-4">
                    スマホの壁紙、SNSのヘッダー、自分専用のアイコンやサムネイル。"IMAGINE"で「作る」を、もっと自由に、もっと簡単に。
                  </p>
                  <p className="mb-4">
                    生成AIを取り入れたビジュアルデザインで人気の
                    <a
                      href="https://www.instagram.com/whatif.ep/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline mx-0.5"
                    >
                      WHATIF
                    </a>
                    が提供する圧倒的なデザインアセットをベースに、あなたの直感的な「エディット」を加えるだけで、世界に一つだけのアートが生まれます。
                  </p>
                  <p className="mb-4">
                    インスピレーションを形にするのに、もう時間はかかりません。デザインの99%は既に用意されています。
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <img
                      src="/about-us_001.png"
                      alt="IMAGINE デザインサンプル 1"
                      className="w-full h-auto rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage('/about-us_001.png')}
                    />
                    <img
                      src="/about-us_002.png"
                      alt="IMAGINE デザインサンプル 2"
                      className="w-full h-auto rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage('/about-us_002.png')}
                    />
                  </div>

                  {/* WHATIF Column */}
                  <div className="relative mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full -mr-32 -mt-32 opacity-20"></div>
                    <div className="relative p-8">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-md opacity-30"></div>
                          <img
                            src="/avatar_whatif_001.svg"
                            alt="WHATIF プロフィール"
                            className="relative w-28 h-28 rounded-full ring-4 ring-white shadow-xl object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                            WHATIFについて
                          </h3>
                          <p className="text-gray-700 leading-relaxed mb-6">
                            WHATIFとはInstagram/Threadsにて12万人以上のフォロワーを要するクリエイター。生成AIによるビジュアルデザイン黎明期から活動し、アニメエステティック、サイバーパンク、ポストアポカリプティックなグラフィックアートや動画を投稿している。
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <a
                              href="https://www.instagram.com/whatif.ep/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                            >
                              <svg className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                              <span className="text-sm font-medium text-gray-700">Instagram</span>
                            </a>
                            <a
                              href="https://www.threads.net/@whatif.ep"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                            >
                              <svg className="w-5 h-5 text-gray-800 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 192 192">
                                <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.723-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.13 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.194 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.067c.224 28.617 6.882 51.447 19.788 67.854C47.292 182.358 68.882 191.806 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.19 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-11.991-18.842-21.723-24.552Z"/>
                                <path d="M102.378 125.838c-11.315.613-23.712-4.135-24.705-13.768-.531-5.166 1.906-9.925 6.866-13.396 5.025-3.517 11.578-5.253 19.467-5.158 5.89.071 11.507.839 16.678 2.276-1.962 19.569-9.046 29.413-18.306 30.046Z"/>
                              </svg>
                              <span className="text-sm font-medium text-gray-700">Threads</span>
                            </a>
                            <a
                              href="https://whatif-ep.xyz/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                            >
                              <svg className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                              </svg>
                              <span className="text-sm font-medium text-gray-700">ブランドサイト</span>
                            </a>
                            <a
                              href="https://whatif.stores.jp/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                            >
                              <svg className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                              </svg>
                              <span className="text-sm font-medium text-gray-700">ショップ</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

          <Section title="主な機能">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>豊富なテンプレートライブラリ</li>
              <li>ドラッグ&ドロップの直感的な操作</li>
              <li>テキスト、図形、画像の自由な配置</li>
              <li>複数要素の同時編集機能</li>
              <li>画像ライブラリ（デフォルト + 個人ライブラリ）</li>
              <li>高解像度PNG出力</li>
              <li>クラウド保存で複数デバイスから利用可能</li>
            </ul>
          </Section>

          <Section title="こんな方におすすめ">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>SNS投稿用のビジュアルを作りたい個人・企業</li>
              <li>広告バナーを効率的に制作したいマーケター</li>
              <li>デザインツールの操作が苦手な方</li>
              <li>コストを抑えてデザイン制作したい事業者</li>
              <li>テンプレートをベースに素早く制作したい方</li>
            </ul>
          </Section>

          <Section title="IMAGINEを使った制作物について">
            <p className="text-gray-700 leading-relaxed mb-4">
              IMAGINEで提供される全てのアセットは、CC0 (Creative Commons Zero) ライセンスの下に公開されています。
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>改変自由:</strong> 文字を入れ替え、色を塗り替え、あなたの1%を加えてください。</li>
              <li><strong>商用利用OK:</strong> あなたのビジネス、SNS、プロジェクトに制限なく活用できます。</li>
              <li><strong>再配布推奨:</strong> あなたの成果を広めるためのシェアを、私たちは全力で歓迎します。</li>
            </ul>
          </Section>

          <Section title="料金プラン">
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {/* Free Plan */}
              <div className="relative bg-white rounded-2xl border-2 border-gray-200 p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900">¥0</span>
                    <span className="text-gray-500">/月</span>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">基本的なテンプレート利用</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">PNG出力</span>
                  </li>
                </ul>
              </div>

              {/* Premium Plan */}
              <div className="relative bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="absolute top-4 right-4">
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">人気</span>
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-white">$8</span>
                    <span className="text-purple-200">/月</span>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white">全てのプレミアムテンプレート利用</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white">高度な編集機能</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-white">優先サポート</span>
                  </li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="Transparency & Compliance">
            <p className="text-gray-700 leading-relaxed">
              IMAGINEで使用されるビジュアルアセットは、Midjourney等の大手画像生成事業者によるツールを用いて、追加学習無しで生成されたデータを元に、契約と利用規約に基づき、独自の編集を経て制作されたものであり、全て商用利用が許可されているものです。私たちはAIの創造性と人間の編集を組み合わせることで、誰もが手軽に最高のアニメ・エステティックを手にできる世界を目指しています。
            </p>
          </Section>

          <Section title="運営者情報">
            <div className="space-y-2">
              <p><strong>運営者</strong>: 松本 夏弥（Kaya Matsumoto）</p>
              <p><strong>所在地</strong>: 〒221-0003 神奈川県横浜市神奈川区大口仲町203-40</p>
              <p><strong>メール</strong>: contact@whatif-ep.xyz</p>
            </div>
          </Section>

          <Section title="お問い合わせ">
            <p>
              ご不明な点がございましたら、
              <Link to="/contact" className="text-blue-600 hover:underline mx-1">
                お問い合わせページ
              </Link>
              よりご連絡ください。
            </p>
          </Section>
            </>
          ) : (
            <>
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  How Will You Complete It?<br />IMAGINE - The 99% Ready Design Kit
                </h2>
                <div className="text-gray-700">
                  <p className="mb-4">
                    Phone wallpapers, SNS headers, custom icons and thumbnails. Create freely and easily with "IMAGINE", the simple design tool.
                  </p>
                  <p className="mb-4">
                    Based on the powerful design assets provided by{' '}
                    <a
                      href="https://www.instagram.com/whatif.ep/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline mx-0.5"
                    >
                      WHATIF
                    </a>, popular for its visual design incorporating generative AI, simply add your intuitive "edits" to create one-of-a-kind art.
                  </p>
                  <p className="mb-4">
                    It no longer takes time to turn inspiration into reality. 99% of the design is already done for you.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <img
                      src="/about-us_001.png"
                      alt="IMAGINE Design Sample 1"
                      className="w-full h-auto rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage('/about-us_001.png')}
                    />
                    <img
                      src="/about-us_002.png"
                      alt="IMAGINE Design Sample 2"
                      className="w-full h-auto rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage('/about-us_002.png')}
                    />
                  </div>

                  {/* WHATIF Column */}
                  <div className="relative mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full -mr-32 -mt-32 opacity-20"></div>
                    <div className="relative p-8">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-md opacity-30"></div>
                          <img
                            src="/avatar_whatif_001.svg"
                            alt="WHATIF Profile"
                            className="relative w-28 h-28 rounded-full ring-4 ring-white shadow-xl object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                            About WHATIF
                          </h3>
                          <p className="text-gray-700 leading-relaxed mb-6">
                            WHATIF is a creator with over 120,000 followers on Instagram/Threads. Active since the early days of generative AI visual design, WHATIF posts anime aesthetic, cyberpunk, and post-apocalyptic graphic art and videos.
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <a
                              href="https://www.instagram.com/whatif.ep/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                            >
                              <svg className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                              <span className="text-sm font-medium text-gray-700">Instagram</span>
                            </a>
                            <a
                              href="https://www.threads.net/@whatif.ep"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                            >
                              <svg className="w-5 h-5 text-gray-800 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 192 192">
                                <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.723-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.13 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.194 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.067c.224 28.617 6.882 51.447 19.788 67.854C47.292 182.358 68.882 191.806 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.19 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-11.991-18.842-21.723-24.552Z"/>
                                <path d="M102.378 125.838c-11.315.613-23.712-4.135-24.705-13.768-.531-5.166 1.906-9.925 6.866-13.396 5.025-3.517 11.578-5.253 19.467-5.158 5.89.071 11.507.839 16.678 2.276-1.962 19.569-9.046 29.413-18.306 30.046Z"/>
                              </svg>
                              <span className="text-sm font-medium text-gray-700">Threads</span>
                            </a>
                            <a
                              href="https://whatif-ep.xyz/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                            >
                              <svg className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                              </svg>
                              <span className="text-sm font-medium text-gray-700">Brand Site</span>
                            </a>
                            <a
                              href="https://whatif.stores.jp/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                            >
                              <svg className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                              </svg>
                              <span className="text-sm font-medium text-gray-700">Shop</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Section title="Key Features">
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Rich template library</li>
                  <li>Intuitive drag & drop operations</li>
                  <li>Free placement of text, shapes, and images</li>
                  <li>Multi-element editing functionality</li>
                  <li>Image library (default + personal library)</li>
                  <li>High-resolution PNG export</li>
                  <li>Cloud storage accessible from multiple devices</li>
                </ul>
              </Section>

              <Section title="Recommended For">
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Individuals and businesses creating visuals for social media</li>
                  <li>Marketers looking to efficiently produce ad banners</li>
                  <li>Those who find design tools difficult to use</li>
                  <li>Business owners wanting to reduce design production costs</li>
                  <li>Anyone wanting to create quickly based on templates</li>
                </ul>
              </Section>

              <Section title="About Content Created with IMAGINE">
                <p className="text-gray-700 leading-relaxed mb-4">
                  All assets provided in IMAGINE are published under the CC0 (Creative Commons Zero) license.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li><strong>Free to Modify:</strong> Replace text, change colors, add your 1%.</li>
                  <li><strong>Commercial Use OK:</strong> Use freely for your business, social media, or projects.</li>
                  <li><strong>Redistribution Encouraged:</strong> We welcome sharing your work.</li>
                </ul>
              </Section>

              <Section title="Pricing Plans">
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  {/* Free Plan */}
                  <div className="relative bg-white rounded-2xl border-2 border-gray-200 p-8 hover:shadow-lg transition-shadow duration-300">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-bold text-gray-900">$0</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                    </div>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">Basic template access</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">PNG export</span>
                      </li>
                    </ul>
                  </div>

                  {/* Premium Plan */}
                  <div className="relative bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <div className="absolute top-4 right-4">
                      <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">Popular</span>
                    </div>
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-bold text-white">$8</span>
                        <span className="text-purple-200">/month</span>
                      </div>
                    </div>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-white">Access to all premium templates</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-white">Advanced editing features</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-white">Priority support</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Section>

              <Section title="Transparency & Compliance">
                <p className="text-gray-700 leading-relaxed">
                  The visual assets used in IMAGINE are created through proprietary editing of data generated without additional training, using tools from major image generation providers such as Midjourney. All assets are produced in accordance with contracts and terms of service, and are fully licensed for commercial use. We aim to create a world where anyone can easily access the best anime aesthetic designs by combining AI creativity with human editing.
                </p>
              </Section>

              <Section title="Operator Information">
                <div className="space-y-2">
                  <p><strong>Operator</strong>: Kaya Matsumoto</p>
                  <p><strong>Address</strong>: 〒221-0003 203-40 Oguchinakacho, Kanagawa-ku, Yokohama, Kanagawa, Japan</p>
                  <p><strong>Email</strong>: contact@whatif-ep.xyz</p>
                </div>
              </Section>

              <Section title="Contact">
                <p>
                  If you have any questions, please contact us via our{' '}
                  <Link to="/contact" className="text-blue-600 hover:underline mx-1">
                    contact page
                  </Link>.
                </p>
              </Section>
            </>
          )}
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
