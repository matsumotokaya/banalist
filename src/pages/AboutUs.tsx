import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function AboutUs() {
  const { i18n } = useTranslation();
  const isJapanese = i18n.language === 'ja';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← {isJapanese ? 'ホームに戻る' : 'Back to Home'}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            About Us
          </h1>
          <p className="text-gray-600 mt-2">
            {isJapanese ? 'サービスについて' : 'About Our Service'}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {isJapanese ? (
            <>
              <Section title="IMAGINE; Anime Aesthetic Design with WHATIF">
            <p className="mb-4">
              スマホの壁紙、SNSのヘッダー、自分専用のアイコンやサムネイル。"IMAGINE"で「作る」を、もっと自由に、もっと簡単に。
            </p>
            <p className="mb-4">
              生成AIを取り入れたビジュアルデザインで人気のWHATIFが提供する圧倒的なデザインアセットをベースに、あなたの直感的な「エディット」を加えるだけで、世界に一つだけのアートが生まれます。
            </p>
            <p className="mb-4">
              インスピレーションを形にするのに、もう時間はかかりません。デザインの99%は既に用意されています。
            </p>
          </Section>

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

          <Section title="運営者情報">
            <div className="space-y-2">
              <p><strong>運営者</strong>: 松本 夏弥（Kaya Matsumoto）</p>
              <p><strong>所在地</strong>: 〒221-0003 神奈川県横浜市神奈川区大口仲町203-40</p>
              <p><strong>メール</strong>: contact@whatif-ep.xyz</p>
            </div>
          </Section>

          <Section title="料金プラン">
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">Free（無料）</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>基本的なテンプレート利用</li>
                  <li>個人画像ライブラリ</li>
                  <li>PNG出力</li>
                </ul>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-lg mb-2">Premium（月額$8.00）</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>全てのプレミアムテンプレート利用</li>
                  <li>高度な編集機能</li>
                  <li>優先サポート</li>
                </ul>
              </div>
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
              <Section title="IMAGINE; Anime Aesthetic Design with WHATIF">
                <p className="mb-4">
                  Phone wallpapers, SNS headers, custom icons and thumbnails. Create freely and easily with "IMAGINE", the simple design tool.
                </p>
                <p className="mb-4">
                  Based on the powerful design assets provided by WHATIF, popular for its visual design incorporating generative AI, simply add your intuitive "edits" to create one-of-a-kind art.
                </p>
                <p className="mb-4">
                  It no longer takes time to turn inspiration into reality. 99% of the design is already done for you.
                </p>
              </Section>

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

              <Section title="Operator Information">
                <div className="space-y-2">
                  <p><strong>Operator</strong>: Kaya Matsumoto</p>
                  <p><strong>Address</strong>: 〒221-0003 203-40 Oguchinakacho, Kanagawa-ku, Yokohama, Kanagawa, Japan</p>
                  <p><strong>Email</strong>: contact@whatif-ep.xyz</p>
                </div>
              </Section>

              <Section title="Pricing Plans">
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-lg mb-2">Free</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Basic template access</li>
                      <li>Personal image library</li>
                      <li>PNG export</li>
                    </ul>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-semibold text-lg mb-2">Premium ($8.00/month)</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Access to all premium templates</li>
                      <li>Advanced editing features</li>
                      <li>Priority support</li>
                    </ul>
                  </div>
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
