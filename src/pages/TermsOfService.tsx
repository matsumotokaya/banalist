import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function TermsOfService() {
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
                        {isJapanese ? '利用規約' : 'Terms of Service'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {isJapanese ? '最終更新日: 2026年1月28日' : 'Last Updated: January 28, 2026'}
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
                    {isJapanese ? (
                        <>
                            <Section title="第1条（適用）">
                                <p>
                                    本規約は、松本夏弥（以下「運営者」）が提供するWHATIF（以下「本サービス」）の利用条件を定めるものです。
                                    ユーザーは、本サービスを利用することにより、本規約に同意したものとみなされます。
                                </p>
                            </Section>

                            <Section title="第2条（定義）">
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>
                                        <strong>「ユーザー」</strong>: 本サービスを利用するすべての個人または法人
                                    </li>
                                    <li>
                                        <strong>「登録ユーザー」</strong>: アカウント登録を完了したユーザー
                                    </li>
                                    <li>
                                        <strong>「プレミアムユーザー」</strong>: 有料プランに登録したユーザー
                                    </li>
                                    <li>
                                        <strong>「コンテンツ」</strong>: ユーザーが本サービス上で作成・アップロードしたバナーデザイン、画像等
                                    </li>
                                </ul>
                            </Section>

                            <Section title="第3条（アカウント登録）">
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>本サービスの利用には、Google アカウントによる認証が必要です。</li>
                                    <li>ユーザーは、登録情報を正確かつ最新の状態に保つ責任を負います。</li>
                                    <li>アカウント情報の管理責任はユーザーにあり、第三者による不正利用があった場合でも、運営者は一切の責任を負いません。</li>
                                    <li>1人のユーザーが複数のアカウントを作成することを禁止します。</li>
                                </ol>
                            </Section>

                            <Section title="第4条（サブスクリプション）">
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>プレミアムプランの料金は月額$8.00（米ドル）です。</li>
                                    <li>決済はStripeを通じて処理され、毎月自動更新されます。</li>
                                    <li>ユーザーはいつでもアカウント設定から解約できます。</li>
                                    <li>解約後も、現在の請求期間が終了するまでサービスを利用できます。</li>
                                    <li>原則として返金には応じませんが、システム障害等の場合は個別に対応します。</li>
                                </ol>
                            </Section>

                            <Section title="第5条（禁止事項）">
                                <p className="mb-2">ユーザーは、以下の行為を行ってはなりません：</p>
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>法令または公序良俗に違反する行為</li>
                                    <li>犯罪行為に関連する行為</li>
                                    <li>他者の知的財産権、プライバシー権、名誉権その他の権利を侵害する行為</li>
                                    <li>本サービスのサーバーやネットワークに過度な負荷をかける行為</li>
                                    <li>本サービスの運営を妨害する行為</li>
                                    <li>不正アクセス、リバースエンジニアリング等の行為</li>
                                    <li>他のユーザーの情報を不正に収集する行為</li>
                                    <li>虚偽の情報を登録する行為</li>
                                    <li>反社会的勢力への利益供与</li>
                                    <li>その他、運営者が不適切と判断する行為</li>
                                </ol>
                            </Section>

                            <Section title="第6条（知的財産権）">
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>本サービスに関する知的財産権は、すべて運営者または正当な権利者に帰属します。</li>
                                    <li>ユーザーが作成したコンテンツの著作権は、ユーザーに帰属します。</li>
                                    <li>ユーザーは、本サービスの改善・宣伝目的で、運営者がコンテンツを使用することを許諾します。</li>
                                    <li>ユーザーは、アップロードするコンテンツについて、必要な権利を有していることを保証します。</li>
                                </ol>
                            </Section>

                            <Section title="第7条（サービスの変更・停止）">
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>運営者は、事前の通知なく本サービスの内容を変更または追加できます。</li>
                                    <li>以下の場合、運営者は本サービスを一時的に停止できます：
                                        <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                            <li>システムメンテナンスまたは更新</li>
                                            <li>地震、火災等の不可抗力</li>
                                            <li>その他、運営者が必要と判断した場合</li>
                                        </ul>
                                    </li>
                                    <li>サービス停止により生じた損害について、運営者は一切の責任を負いません。</li>
                                </ol>
                            </Section>

                            <Section title="第8条（利用制限・アカウント削除）">
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>運営者は、以下の場合、事前通知なくサービス利用を制限またはアカウントを削除できます：
                                        <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                            <li>本規約に違反した場合</li>
                                            <li>登録情報に虚偽があった場合</li>
                                            <li>決済手段の不正利用があった場合</li>
                                            <li>6ヶ月以上ログインがない場合</li>
                                            <li>その他、運営者が不適切と判断した場合</li>
                                        </ul>
                                    </li>
                                    <li>利用制限またはアカウント削除により生じた損害について、運営者は一切の責任を負いません。</li>
                                </ol>
                            </Section>

                            <Section title="第9条（免責事項）">
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>本サービスは「現状有姿」で提供され、運営者は明示・黙示を問わず一切の保証をしません。</li>
                                    <li>運営者は、本サービスの正確性、完全性、有用性、安全性等を保証しません。</li>
                                    <li>本サービスの利用により生じた損害について、運営者は一切の責任を負いません。</li>
                                    <li>ユーザー間またはユーザーと第三者との間のトラブルについて、運営者は一切の責任を負いません。</li>
                                    <li>データの消失、破損等について、運営者は一切の責任を負いません。定期的なバックアップを推奨します。</li>
                                </ol>
                            </Section>

                            <Section title="第10条（損害賠償）">
                                <p>
                                    運営者の責に帰すべき事由により損害が発生した場合、運営者の賠償責任は、
                                    当該ユーザーが過去12ヶ月間に支払った利用料金の総額を上限とします。
                                </p>
                            </Section>

                            <Section title="第11条（規約の変更）">
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>運営者は、必要に応じて本規約を変更できます。</li>
                                    <li>変更後の規約は、本サービス上に掲載した時点で効力を生じます。</li>
                                    <li>重要な変更がある場合は、事前にメール等で通知します。</li>
                                    <li>変更後も本サービスを利用した場合、変更後の規約に同意したものとみなされます。</li>
                                </ol>
                            </Section>

                            <Section title="第12条（個人情報）">
                                <p>
                                    個人情報の取扱いについては、
                                    <Link to="/legal/privacy" className="text-blue-600 hover:underline ml-1">
                                        プライバシーポリシー
                                    </Link>
                                    をご確認ください。
                                </p>
                            </Section>

                            <Section title="第13条（準拠法・管轄裁判所）">
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>本規約の準拠法は日本法とします。</li>
                                    <li>本サービスに関する紛争については、横浜地方裁判所を第一審の専属的合意管轄裁判所とします。</li>
                                </ol>
                            </Section>

                            <Section title="お問い合わせ">
                                <p>
                                    本規約に関するご質問は、以下までお問い合わせください：
                                </p>
                                <p className="mt-2 text-gray-700">
                                    メールアドレス: matsumotokaya@gmail.com<br />
                                    運営者: 松本夏弥
                                </p>
                            </Section>
                        </>
                    ) : (
                        <>
                            <Section title="Article 1 (Application)">
                                <p>
                                    These Terms of Service ("Terms") govern the use of WHATIF ("Service") provided by Kaya Matsumoto ("Operator").
                                    By using the Service, users agree to be bound by these Terms.
                                </p>
                            </Section>

                            <Section title="Article 2 (Definitions)">
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>
                                        <strong>"User"</strong>: Any individual or entity using the Service
                                    </li>
                                    <li>
                                        <strong>"Registered User"</strong>: User who has completed account registration
                                    </li>
                                    <li>
                                        <strong>"Premium User"</strong>: User subscribed to the paid plan
                                    </li>
                                    <li>
                                        <strong>"Content"</strong>: Banner designs, images, etc. created or uploaded by users
                                    </li>
                                </ul>
                            </Section>

                            <Section title="Article 3 (Account Registration)">
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>Using the Service requires authentication via Google Account.</li>
                                    <li>Users are responsible for keeping their registration information accurate and up-to-date.</li>
                                    <li>Users are responsible for managing their account information. The Operator is not liable for unauthorized use by third parties.</li>
                                    <li>Creating multiple accounts per user is prohibited.</li>
                                </ol>
                            </Section>

                            <Section title="Article 4 (Subscription)">
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>The Premium plan costs $8.00 USD per month.</li>
                                    <li>Payments are processed through Stripe and automatically renewed monthly.</li>
                                    <li>Users can cancel anytime from account settings.</li>
                                    <li>After cancellation, service access continues until the end of the current billing period.</li>
                                    <li>Refunds are generally not provided, except in cases of system failures or other exceptional circumstances.</li>
                                </ol>
                            </Section>

                            <Section title="Article 5 (Prohibited Activities)">
                                <p className="mb-2">Users must not engage in the following activities:</p>
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>Violating laws or public order and morals</li>
                                    <li>Criminal activities</li>
                                    <li>Infringing intellectual property rights, privacy rights, reputation, or other rights of others</li>
                                    <li>Imposing excessive load on Service servers or networks</li>
                                    <li>Interfering with Service operations</li>
                                    <li>Unauthorized access, reverse engineering, etc.</li>
                                    <li>Illegally collecting other users' information</li>
                                    <li>Registering false information</li>
                                    <li>Providing benefits to antisocial forces</li>
                                    <li>Other activities deemed inappropriate by the Operator</li>
                                </ol>
                            </Section>

                            <Section title="Article 6 (Intellectual Property)">
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>All intellectual property rights related to the Service belong to the Operator or legitimate rights holders.</li>
                                    <li>Copyright of user-created Content belongs to the user.</li>
                                    <li>Users grant the Operator permission to use Content for Service improvement and promotional purposes.</li>
                                    <li>Users warrant that they have necessary rights for all uploaded Content.</li>
                                </ol>
                            </Section>

                            <Section title="Article 7 (Service Changes and Suspension)">
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>The Operator may change or add to the Service without prior notice.</li>
                                    <li>The Operator may temporarily suspend the Service in the following cases:
                                        <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                            <li>System maintenance or updates</li>
                                            <li>Force majeure events (earthquakes, fires, etc.)</li>
                                            <li>Other cases deemed necessary by the Operator</li>
                                        </ul>
                                    </li>
                                    <li>The Operator is not liable for damages caused by service suspension.</li>
                                </ol>
                            </Section>

                            <Section title="Article 8 (Usage Restrictions and Account Deletion)">
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>The Operator may restrict service usage or delete accounts without prior notice in the following cases:
                                        <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                            <li>Violation of these Terms</li>
                                            <li>False registration information</li>
                                            <li>Fraudulent use of payment methods</li>
                                            <li>No login for 6 months or more</li>
                                            <li>Other cases deemed inappropriate by the Operator</li>
                                        </ul>
                                    </li>
                                    <li>The Operator is not liable for damages caused by usage restrictions or account deletion.</li>
                                </ol>
                            </Section>

                            <Section title="Article 9 (Disclaimer)">
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>The Service is provided "as is" without any warranties, express or implied.</li>
                                    <li>The Operator does not guarantee accuracy, completeness, usefulness, or safety of the Service.</li>
                                    <li>The Operator is not liable for any damages arising from use of the Service.</li>
                                    <li>The Operator is not liable for disputes between users or between users and third parties.</li>
                                    <li>The Operator is not liable for data loss or corruption. Regular backups are recommended.</li>
                                </ol>
                            </Section>

                            <Section title="Article 10 (Limitation of Liability)">
                                <p>
                                    If damages occur due to the Operator's fault, the Operator's liability is limited to
                                    the total amount of fees paid by the user in the past 12 months.
                                </p>
                            </Section>

                            <Section title="Article 11 (Changes to Terms)">
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>The Operator may change these Terms as necessary.</li>
                                    <li>Revised Terms take effect when posted on the Service.</li>
                                    <li>Significant changes will be notified in advance via email or other means.</li>
                                    <li>Continued use of the Service after changes constitutes acceptance of the revised Terms.</li>
                                </ol>
                            </Section>

                            <Section title="Article 12 (Personal Information)">
                                <p>
                                    For information on personal data handling, please refer to our{' '}
                                    <Link to="/legal/privacy" className="text-blue-600 hover:underline">
                                        Privacy Policy
                                    </Link>
                                    .
                                </p>
                            </Section>

                            <Section title="Article 13 (Governing Law and Jurisdiction)">
                                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                                    <li>These Terms are governed by the laws of Japan.</li>
                                    <li>The Yokohama District Court shall have exclusive jurisdiction as the court of first instance for any disputes related to the Service.</li>
                                </ol>
                            </Section>

                            <Section title="Contact">
                                <p>
                                    For questions about these Terms, please contact:
                                </p>
                                <p className="mt-2 text-gray-700">
                                    Email: matsumotokaya@gmail.com<br />
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
