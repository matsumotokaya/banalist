# Authentication Specification

Last updated: 2026-02-11

## Overview

IMAGINE supports 3 authentication providers via Supabase Auth:

| Provider | Status | Method |
|---|---|---|
| Google | Active | OAuth 2.0 |
| Apple | Active | OAuth 2.0 (Sign in with Apple JS) |
| Email/Password | Active | Supabase native |

## Architecture

```
User clicks login
  → /auth page (AuthPage.tsx)
  → Select provider
    → OAuth (Google/Apple): redirect to provider → /auth/callback → redirect to original page
    → Email/Password: form submission → redirect to original page
```

### Key Files

| File | Role |
|---|---|
| `src/contexts/AuthContext.tsx` | Auth state management, all sign-in/sign-out methods |
| `src/pages/AuthPage.tsx` | Login / Sign Up page (tab-based) |
| `src/pages/AuthCallback.tsx` | OAuth redirect handler |
| `src/components/AuthButton.tsx` | Header button (login link / user menu) |

### AuthContext Methods

| Method | Description |
|---|---|
| `signInWithGoogle()` | Google OAuth login |
| `signInWithApple()` | Apple OAuth login |
| `signInWithEmail(email, password)` | Email/Password login |
| `signUpWithEmail(email, password)` | Email/Password registration (sends verification email) |
| `resetPassword(email)` | Send password reset email |
| `signOut()` | Logout |

## Provider Details

### Google OAuth

- **Supabase provider**: `google`
- **Redirect**: `${origin}/auth/callback`
- **Setup**: Supabase Dashboard > Authentication > Providers > Google
- **No expiration** on credentials

### Apple Sign In

- **Supabase provider**: `apple`
- **Redirect**: `${origin}/auth/callback`
- **Supabase callback URL**: `https://rgqduwojvylkulhyodqg.supabase.co/auth/v1/callback`

#### Apple Developer Console Configuration

| Item | Value |
|---|---|
| **App ID** | `xyz.whatifep.imagine` (TG68TFXG88) |
| **Services ID** | `xyz.whatifep.app` |
| **Key ID** | `RFMXDRQ6V9` |
| **Team ID** | `TG68TFXG88` |
| **Private Key File** | `docs/AuthKey_RFMXDRQ6V9.p8` (gitignored) |

#### Supabase Dashboard Settings (Authentication > Providers > Apple)

| Field | Value |
|---|---|
| **Client IDs** | `xyz.whatifep.app` |
| **Secret Key** | JWT generated from .p8 file (see renewal below) |

#### ⚠️ Secret Key Renewal (Every 6 Months)

Apple OAuth secret keys expire every 6 months. Current key expires around **August 2026**.

**Renewal procedure:**

1. Ensure `PyJWT` and `cryptography` are installed:
   ```bash
   pip3 install PyJWT cryptography
   ```

2. Run the generation script:
   ```bash
   python3 -c "
   import jwt, time

   team_id = 'TG68TFXG88'
   key_id = 'RFMXDRQ6V9'
   client_id = 'xyz.whatifep.app'

   with open('docs/AuthKey_RFMXDRQ6V9.p8', 'r') as f:
       private_key = f.read()

   now = int(time.time())
   token = jwt.encode(
       {'iss': team_id, 'iat': now, 'exp': now + 86400 * 180,
        'aud': 'https://appleid.apple.com', 'sub': client_id},
       private_key, algorithm='ES256',
       headers={'kid': key_id, 'alg': 'ES256'}
   )
   print(token)
   "
   ```

3. Copy the output JWT
4. Go to **Supabase Dashboard > Authentication > Providers > Apple**
5. Paste new JWT into **Secret Key** field
6. Save

**If the .p8 key is lost**, a new key must be created in Apple Developer Console > Keys.

### Email / Password

- **Supabase provider**: native email auth
- **Email confirmation**: enabled (user receives verification email)
- **Password minimum**: 6 characters
- **Password reset**: sends reset link via email
- **Setup**: Supabase Dashboard > Authentication > Providers > Email (enabled)
- **Email templates**: customizable in Supabase Dashboard > Authentication > Email Templates

## Supabase Configuration

### Redirect URLs (Authentication > URL Configuration)

These URLs must be registered for OAuth to work:

```
https://app.whatif-ep.xyz/auth/callback
http://localhost:5173/auth/callback
```

### Database

New users are automatically created in `public.profiles` via a database trigger on `auth.users` insert.

Profile fields populated from OAuth providers:

| Field | Google | Apple | Email |
|---|---|---|---|
| `email` | ✅ | ✅ | ✅ |
| `full_name` | ✅ | First sign-in only | ❌ (empty) |
| `avatar_url` | ✅ | ❌ | ❌ (empty) |

## Routes

| Path | Component | Description |
|---|---|---|
| `/auth` | AuthPage | Login / Sign Up page |
| `/auth?tab=login` | AuthPage | Login tab |
| `/auth?tab=signup` | AuthPage | Sign Up tab |
| `/auth?redirect=/path` | AuthPage | Redirect after login |
| `/auth/callback` | AuthCallback | OAuth redirect handler |

## i18n

Auth translation keys are in `src/i18n/locales/{en,ja,zh-CN,zh-TW,ko}/auth.json`.

Supported languages: English, Japanese, Simplified Chinese, Traditional Chinese, Korean.
