import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

export const PaymentSuccess = () => {
  const { t } = useTranslation(['message', 'common']);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const queryClient = useQueryClient();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      navigate('/');
      return;
    }

    // Simply invalidate all profile queries to force fresh fetch
    console.log('[PaymentSuccess] Invalidating all profile queries');
    queryClient.invalidateQueries({ queryKey: ['profiles'] });

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Invalidate once more before navigating
          queryClient.invalidateQueries({ queryKey: ['profiles'] });
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-full">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          🎉 {t('message:success.upgradeComplete')}
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {t('message:success.welcomePremium')}
        </p>

        {/* Features List */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 mb-6 text-left">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            ✨ {t('message:success.premiumFeatures')}
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">✓</span>
              <span>{t('message:success.feature1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">✓</span>
              <span>{t('message:success.feature2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">✓</span>
              <span>{t('message:success.feature3')}</span>
            </li>
          </ul>
        </div>

        {/* Redirect Message */}
        <p className="text-gray-500 text-sm mb-4">
          {t('message:success.redirecting', { seconds: countdown })}
        </p>

        {/* Manual Redirect Button */}
        <button
          onClick={() => navigate('/')}
          className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
        >
          {t('common:button.backToHome')}
        </button>
      </div>
    </div>
  );
};
