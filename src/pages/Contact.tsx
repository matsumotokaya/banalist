import { useState } from 'react';
import { Link } from 'react-router-dom';

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // メールクライアントを開く（実際の送信はメールクライアント経由）
    const mailtoLink = `mailto:matsumotokaya@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      `お名前: ${name}\nメールアドレス: ${email}\n\nお問い合わせ内容:\n${message}`
    )}`;
    
    window.location.href = mailtoLink;
    setSubmitted(true);
    
    // フォームをリセット
    setTimeout(() => {
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← ホームに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            お問い合わせ
          </h1>
          <p className="text-gray-600 mt-2">
            ご質問やご要望がございましたら、お気軽にお問い合わせください。
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {submitted && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                メールクライアントが起動しました。メールを送信してください。
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="山田 太郎"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="example@example.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                件名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="お問い合わせの件名を入力してください"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="お問い合わせ内容を詳しくご記入ください"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>ご注意:</strong> 送信ボタンを押すと、お使いのメールクライアントが起動します。
                メールアプリから送信を完了してください。
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              メールクライアントを起動
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">直接メールで送信</h2>
            <p className="text-gray-700 mb-2">
              下記のメールアドレスに直接お問い合わせいただくことも可能です：
            </p>
            <a
              href="mailto:matsumotokaya@gmail.com"
              className="text-blue-600 hover:underline font-medium"
            >
              matsumotokaya@gmail.com
            </a>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">営業時間</h2>
            <p className="text-gray-700">
              お問い合わせへの回答は、通常1〜3営業日以内に行います。
              <br />
              （土日祝日を除く）
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
