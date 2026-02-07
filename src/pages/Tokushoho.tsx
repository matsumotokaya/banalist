import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function Tokushoho() {
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
            {isJapanese ? '特定商取引法に基づく表記' : 'Specified Commercial Transactions Act'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isJapanese ? '最終更新日: 2026年2月8日' : 'Last Updated: February 8, 2026'}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          {isJapanese ? (
            <>
              <Section title="事業者名">
                <p>松本 夏弥（Kaya Matsumoto）</p>
              </Section>

          <Section title="運営統括責任者">
            <p>松本 夏弥</p>
          </Section>

          <Section title="所在地">
            <p>〒221-0003</p>
            <p>神奈川県横浜市神奈川区大口仲町203-40</p>
          </Section>

          <Section title="連絡先">
            <p>メールアドレス: contact@whatif-ep.xyz</p>
            <p>電話番号: 090-4238-3149</p>
            <p className="text-sm text-gray-600 mt-2">
              ※お問い合わせは、原則としてメールにて受け付けております。
            </p>
          </Section>

          <Section title="サービス名">
            <p>IMAGINE(イマジン) - デザイン制作アシスタントツール</p>
          </Section>

          <Section title="販売価格">
            <p>月額 $8.00（米ドル）</p>
            <p className="text-sm text-gray-600 mt-1">
              ※価格は税込みです。為替レートにより日本円換算額は変動します。
            </p>
          </Section>

          <Section title="送料">
            <p>デジタルサービスのため送料はかかりません。</p>
          </Section>

          <Section title="その他の費用">
            <p>上記の月額料金以外に費用はかかりません。</p>
          </Section>

          <Section title="支払い方法">
            <p>クレジットカード決済</p>
            <p className="text-sm text-gray-600 mt-1">
              対応カード: Visa, Mastercard, American Express, JCB等
            </p>
          </Section>

          <Section title="支払い時期">
            <p>サブスクリプション登録時に初回決済が行われ、以降は毎月自動更新されます。</p>
          </Section>

          <Section title="サービス提供時期">
            <p>決済完了後、即時ご利用いただけます。</p>
          </Section>

          <Section title="返品特約">
            <p>本サービスはデジタルコンテンツのため、原則として返金には応じかねます。</p>
            <p className="mt-2">
              ただし、以下の場合は返金対応を検討いたします：
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
              <li>システム障害により長期間サービスが利用できなかった場合</li>
              <li>二重課金などの明らかな請求エラーがあった場合</li>
            </ul>
          </Section>

          <Section title="解約方法">
            <p>アカウント設定画面からいつでも解約可能です。</p>
            <p className="mt-2 text-gray-700">
              解約手続き完了後、次回の更新日以降は課金されません。現在の請求期間内は引き続きサービスをご利用いただけます。
            </p>
          </Section>

          <Section title="動作環境">
            <p>以下のブラウザでの動作を推奨します：</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
              <li>Google Chrome（最新版）</li>
              <li>Safari（最新版）</li>
              <li>Microsoft Edge（最新版）</li>
              <li>Firefox（最新版）</li>
            </ul>
          </Section>

          <Section title="販売数量の制限">
            <p>特に制限はございません。</p>
          </Section>

          <Section title="その他">
            <p>
              <Link to="/legal/privacy" className="text-blue-600 hover:underline">
                プライバシーポリシー
              </Link>
              および
              <Link to="/legal/terms" className="text-blue-600 hover:underline ml-1">
                利用規約
              </Link>
              も併せてご確認ください。
            </p>
          </Section>
            </>
          ) : (
            <>
              <Section title="Business Operator">
                <p>Kaya Matsumoto</p>
              </Section>

              <Section title="Representative">
                <p>Kaya Matsumoto</p>
              </Section>

              <Section title="Address">
                <p>〒221-0003</p>
                <p>203-40 Oguchinakacho, Kanagawa-ku, Yokohama, Kanagawa, Japan</p>
              </Section>

              <Section title="Contact">
                <p>Email: contact@whatif-ep.xyz</p>
                <p>Phone: 090-4238-3149</p>
                <p className="text-sm text-gray-600 mt-2">
                  ※Inquiries are primarily handled via email.
                </p>
              </Section>

              <Section title="Service Name">
                <p>IMAGINE - Design Creation Assistant Tool</p>
              </Section>

              <Section title="Price">
                <p>$8.00 USD per month</p>
                <p className="text-sm text-gray-600 mt-1">
                  ※Prices include applicable taxes. JPY equivalent may vary based on exchange rates.
                </p>
              </Section>

              <Section title="Shipping">
                <p>No shipping charges as this is a digital service.</p>
              </Section>

              <Section title="Other Fees">
                <p>No fees other than the monthly subscription fee.</p>
              </Section>

              <Section title="Payment Method">
                <p>Credit Card</p>
                <p className="text-sm text-gray-600 mt-1">
                  Accepted cards: Visa, Mastercard, American Express, JCB, etc.
                </p>
              </Section>

              <Section title="Payment Timing">
                <p>Initial payment is charged upon subscription registration, then automatically renewed monthly.</p>
              </Section>

              <Section title="Service Delivery">
                <p>Service is available immediately after payment completion.</p>
              </Section>

              <Section title="Return Policy">
                <p>As this is a digital service, refunds are generally not provided.</p>
                <p className="mt-2">
                  However, refunds may be considered in the following cases:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                  <li>Extended service outage due to system failures</li>
                  <li>Clear billing errors such as duplicate charges</li>
                </ul>
              </Section>

              <Section title="Cancellation Method">
                <p>You can cancel anytime from your account settings.</p>
                <p className="mt-2 text-gray-700">
                  After cancellation, you will not be charged from the next renewal date. You can continue using the service until the end of the current billing period.
                </p>
              </Section>

              <Section title="System Requirements">
                <p>Recommended browsers:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
                  <li>Google Chrome (latest version)</li>
                  <li>Safari (latest version)</li>
                  <li>Microsoft Edge (latest version)</li>
                  <li>Firefox (latest version)</li>
                </ul>
              </Section>

              <Section title="Sales Volume Limit">
                <p>No specific limit.</p>
              </Section>

              <Section title="Additional Information">
                <p>
                  Please also review our{' '}
                  <Link to="/legal/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </Link>
                  {' '}and{' '}
                  <Link to="/legal/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </Link>
                  .
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
    <div className="border-b border-gray-200 pb-4 last:border-0">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
      <div className="text-gray-700">{children}</div>
    </div>
  );
}
