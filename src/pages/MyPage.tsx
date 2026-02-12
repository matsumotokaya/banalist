import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { Footer } from '../components/Footer';

export function MyPage() {
  const { t } = useTranslation(['auth', 'common', 'message']);
  const { user, profile, loading, signOut } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const isPremium = profile?.subscriptionTier === 'premium';

  const handleManageSubscription = async () => {
    if (!profile?.stripeCustomerId) return;

    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: { customerId: profile.stripeCustomerId },
      });

      if (error) {
        console.error('Error creating portal session:', error);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setPortalLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            &larr; {t('common:button.backToHome')}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('auth:mypage.title')}
          </h1>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('auth:mypage.profileSection')}
          </h2>
          <div className="flex items-center gap-4">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium text-2xl">
                {(profile?.email || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-lg truncate">
                {profile?.fullName || 'User'}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {profile?.email || user.email}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {profile?.role === 'admin' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    {t('auth:admin')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('auth:mypage.subscriptionSection')}
          </h2>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-500">{t('auth:mypage.currentPlan')}</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isPremium
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isPremium ? t('auth:premium') : t('auth:free')}
            </span>
          </div>

          {isPremium ? (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                {t('auth:mypage.premiumDescription')}
              </p>
              {profile?.subscriptionExpiresAt && (
                <p className="text-sm text-gray-500 mb-4">
                  {t('auth:mypage.expiresAt')}: {formatDate(profile.subscriptionExpiresAt)}
                </p>
              )}
              {profile?.stripeCustomerId && (
                <div>
                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {portalLoading ? t('common:label.loading') : t('auth:mypage.manageSubscription')}
                  </button>
                  <p className="text-xs text-gray-400 mt-2">
                    {t('auth:mypage.cancelNote')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                {t('auth:mypage.freeDescription')}
              </p>
              <Link
                to="/"
                className="inline-flex px-5 py-2.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 hover:from-yellow-500 hover:via-amber-600 hover:to-yellow-700 text-white text-sm font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                {t('auth:mypage.upgradeToPremium')}
              </Link>
            </div>
          )}
        </div>

        {/* Account Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {t('auth:mypage.accountSection')}
          </h2>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('auth:logout')}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
