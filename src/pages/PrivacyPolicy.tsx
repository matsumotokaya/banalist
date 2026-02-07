import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function PrivacyPolicy() {
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
                        {isJapanese ? 'プライバシーポリシー' : 'Privacy Policy'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {isJapanese ? '最終更新日: 2026年2月8日' : 'Last Updated: February 8, 2026'}
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
                    {isJapanese ? (
                        <>
                            <Section title="1. はじめに">
                                <p>
                                    IMAGINE(イマジン)（以下「当サービス」）は、松本夏弥（以下「運営者」）が提供するバナーデザインアシスタントツールです。
                                    本プライバシーポリシーは、当サービスにおける個人情報の取扱いについて説明するものです。
                                </p>
                            </Section>

                            <Section title="2. 収集する情報">
                                <p className="mb-2">当サービスでは、以下の情報を収集します：</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>
                                        <strong>アカウント情報</strong>: Google OAuth経由で取得するメールアドレス、氏名、プロフィール画像
                                    </li>
                                    <li>
                                        <strong>決済情報</strong>: Stripeを通じて処理されるクレジットカード情報（当サービスでは保存しません）
                                    </li>
                                    <li>
                                        <strong>利用情報</strong>: 作成したバナーデザイン、アップロードした画像、サービス利用履歴
                                    </li>
                                    <li>
                                        <strong>技術情報</strong>: IPアドレス、ブラウザ情報、アクセスログ
                                    </li>
                                </ul>
                            </Section>

                            <Section title="3. 情報の利用目的">
                                <p className="mb-2">収集した情報は、以下の目的で利用します：</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>サービスの提供・運営・改善</li>
                                    <li>ユーザーサポート対応</li>
                                    <li>決済処理およびサブスクリプション管理</li>
                                    <li>不正利用の防止・セキュリティ対策</li>
                                    <li>利用状況の分析・統計データの作成</li>
                                    <li>重要なお知らせの通知</li>
                                </ul>
                            </Section>

                            <Section title="4. 第三者への提供">
                                <p className="mb-2">当サービスは、以下の第三者サービスを利用しています：</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>
                                        <strong>Supabase</strong>: データベース・認証・ストレージ（米国）
                                    </li>
                                    <li>
                                        <strong>Stripe</strong>: 決済処理（米国）
                                    </li>
                                    <li>
                                        <strong>Google</strong>: OAuth認証（米国）
                                    </li>
                                    <li>
                                        <strong>Vercel</strong>: ホスティング（米国）
                                    </li>
                                </ul>
                                <p className="mt-3 text-gray-700">
                                    これらのサービスは、それぞれのプライバシーポリシーに基づいて情報を処理します。
                                    法令に基づく場合を除き、ユーザーの同意なく第三者に個人情報を提供することはありません。
                                </p>
                            </Section>

                            <Section title="5. データの保存期間">
                                <p>
                                    個人情報は、アカウントが有効な間保存されます。アカウント削除後は、法令で定められた期間を除き、
                                    速やかに削除いたします。
                                </p>
                            </Section>

                            <Section title="6. セキュリティ">
                                <p>
                                    当サービスは、個人情報の漏洩、滅失、毀損を防止するため、適切なセキュリティ対策を講じています。
                                    データ通信はSSL/TLSで暗号化され、データベースへのアクセスは厳格に制限されています。
                                </p>
                            </Section>

                            <Section title="7. ユーザーの権利">
                                <p className="mb-2">ユーザーは、以下の権利を有します：</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>自己の個人情報の開示請求</li>
                                    <li>個人情報の訂正・削除請求</li>
                                    <li>個人情報の利用停止請求</li>
                                    <li>アカウントの削除</li>
                                </ul>
                                <p className="mt-3 text-gray-700">
                                    これらの権利を行使する場合は、contact@whatif-ep.xyz までご連絡ください。
                                </p>
                            </Section>

                            <Section title="8. Cookie（クッキー）">
                                <p>
                                    当サービスは、サービスの利便性向上のためCookieを使用します。
                                    ブラウザの設定でCookieを無効化することも可能ですが、一部機能が利用できなくなる場合があります。
                                </p>
                            </Section>

                            <Section title="9. 子供のプライバシー">
                                <p>
                                    当サービスは、13歳未満の子供を対象としていません。
                                    13歳未満の方が誤って個人情報を提供したことが判明した場合、速やかに削除いたします。
                                </p>
                            </Section>

                            <Section title="10. プライバシーポリシーの変更">
                                <p>
                                    本プライバシーポリシーは、法令の変更やサービスの改善に伴い、予告なく変更される場合があります。
                                    重要な変更がある場合は、サービス内またはメールで通知いたします。
                                </p>
                            </Section>

                            <Section title="11. お問い合わせ">
                                <p>
                                    本プライバシーポリシーに関するご質問は、以下までお問い合わせください：
                                </p>
                                <p className="mt-2 text-gray-700">
                                    メールアドレス: contact@whatif-ep.xyz<br />
                                    運営者: 松本夏弥
                                </p>
                            </Section>
                        </>
                    ) : (
                        <>
                            <Section title="1. Introduction">
                                <p>
                                    IMAGINE (the "Service") is a banner design assistant tool provided by Kaya Matsumoto (the "Operator").
                                    This Privacy Policy explains how we handle personal information in our Service.
                                </p>
                            </Section>

                            <Section title="2. Information We Collect">
                                <p className="mb-2">We collect the following information:</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>
                                        <strong>Account Information</strong>: Email address, name, and profile picture obtained via Google OAuth
                                    </li>
                                    <li>
                                        <strong>Payment Information</strong>: Credit card information processed through Stripe (not stored by us)
                                    </li>
                                    <li>
                                        <strong>Usage Information</strong>: Banner designs created, images uploaded, service usage history
                                    </li>
                                    <li>
                                        <strong>Technical Information</strong>: IP address, browser information, access logs
                                    </li>
                                </ul>
                            </Section>

                            <Section title="3. How We Use Your Information">
                                <p className="mb-2">We use collected information for the following purposes:</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>Providing, operating, and improving the Service</li>
                                    <li>User support</li>
                                    <li>Payment processing and subscription management</li>
                                    <li>Preventing fraud and ensuring security</li>
                                    <li>Usage analysis and statistical data creation</li>
                                    <li>Sending important notifications</li>
                                </ul>
                            </Section>

                            <Section title="4. Third-Party Services">
                                <p className="mb-2">Our Service uses the following third-party services:</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>
                                        <strong>Supabase</strong>: Database, authentication, and storage (USA)
                                    </li>
                                    <li>
                                        <strong>Stripe</strong>: Payment processing (USA)
                                    </li>
                                    <li>
                                        <strong>Google</strong>: OAuth authentication (USA)
                                    </li>
                                    <li>
                                        <strong>Vercel</strong>: Hosting (USA)
                                    </li>
                                </ul>
                                <p className="mt-3 text-gray-700">
                                    These services process information according to their respective privacy policies.
                                    We do not share personal information with third parties without user consent, except as required by law.
                                </p>
                            </Section>

                            <Section title="5. Data Retention">
                                <p>
                                    Personal information is retained while your account is active. After account deletion,
                                    data will be promptly deleted except as required by law.
                                </p>
                            </Section>

                            <Section title="6. Security">
                                <p>
                                    We implement appropriate security measures to prevent unauthorized access, disclosure, alteration,
                                    or destruction of personal information. Data transmission is encrypted via SSL/TLS,
                                    and database access is strictly controlled.
                                </p>
                            </Section>

                            <Section title="7. Your Rights">
                                <p className="mb-2">You have the following rights:</p>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>Request access to your personal information</li>
                                    <li>Request correction or deletion of your personal information</li>
                                    <li>Request restriction of processing</li>
                                    <li>Delete your account</li>
                                </ul>
                                <p className="mt-3 text-gray-700">
                                    To exercise these rights, please contact us at contact@whatif-ep.xyz.
                                </p>
                            </Section>

                            <Section title="8. Cookies">
                                <p>
                                    We use cookies to improve service usability. You can disable cookies in your browser settings,
                                    but some features may not function properly.
                                </p>
                            </Section>

                            <Section title="9. Children's Privacy">
                                <p>
                                    Our Service is not intended for children under 13 years of age.
                                    If we discover that a child under 13 has provided personal information, we will promptly delete it.
                                </p>
                            </Section>

                            <Section title="10. Changes to This Privacy Policy">
                                <p>
                                    This Privacy Policy may be updated without notice due to legal changes or service improvements.
                                    We will notify users of significant changes via the Service or email.
                                </p>
                            </Section>

                            <Section title="11. Contact Us">
                                <p>
                                    For questions about this Privacy Policy, please contact:
                                </p>
                                <p className="mt-2 text-gray-700">
                                    Email: contact@whatif-ep.xyz<br />
                                    Operator: Kaya Matsumoto
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
