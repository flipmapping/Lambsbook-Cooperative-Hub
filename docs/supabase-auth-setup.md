# Supabase Auth Setup Guide

This guide explains how to configure Supabase Authentication with email-based 2FA for the Lambsbook Agentic Hub.

## Step 1: Enable Email Auth in Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Ensure **Email** provider is enabled

## Step 2: Configure Email Templates (Optional but Recommended)

1. Go to **Authentication** → **Email Templates**
2. Customize the following templates:
   - **Confirm signup** - For email verification
   - **Magic Link** - For passwordless login
   - **Change Email Address** - For email changes
   - **Reset Password** - For password recovery

## Step 3: Set Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Set the **Site URL** to your app's URL:
   - Development: `http://localhost:5000`
   - Production: `https://your-app.replit.app`
3. Add **Redirect URLs**:
   - `http://localhost:5000/auth/callback`
   - `https://your-app.replit.app/auth/callback`

## Step 4: Configure Environment Variables

Add these to your Replit Secrets:

| Variable | Value | Description |
|----------|-------|-------------|
| `SUPABASE_URL` | `https://xxx.supabase.co` | Your Supabase project URL |
| `SUPABASE_KEY` | `eyJ...` | Your Supabase anon or service key |
| `APP_URL` | `https://your-app.replit.app` | Your app's public URL |

## Authentication Methods Available

### 1. Magic Link (Passwordless)
- User enters email
- Receives a link in their inbox
- Clicking the link logs them in

```
POST /api/auth/magic-link
Body: { "email": "user@example.com" }
```

### 2. Email OTP (One-Time Password)
- User enters email
- Receives a 6-digit code
- Enters code to verify

```
POST /api/auth/send-otp
Body: { "email": "user@example.com" }

POST /api/auth/verify-otp
Body: { "email": "user@example.com", "token": "123456" }
```

### 3. Password + Email Verification
- User signs up with email/password
- Receives verification email
- Must verify before full access

```
POST /api/auth/signup
Body: { "email": "user@example.com", "password": "securepass", "fullName": "John Doe" }

POST /api/auth/signin
Body: { "email": "user@example.com", "password": "securepass" }
```

### 4. Password Reset
```
POST /api/auth/reset-password
Body: { "email": "user@example.com" }
```

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/magic-link` | POST | Send magic link email |
| `/api/auth/send-otp` | POST | Send email OTP |
| `/api/auth/verify-otp` | POST | Verify email OTP |
| `/api/auth/signup` | POST | Create account with password |
| `/api/auth/signin` | POST | Sign in with password |
| `/api/auth/signout` | POST | Sign out |
| `/api/auth/reset-password` | POST | Send password reset email |
| `/api/auth/me` | GET | Get current user (requires Bearer token) |

## Security Notes

1. **Always use HTTPS in production**
2. **Set APP_URL environment variable** to your production domain
3. **Enable RLS (Row Level Security)** on Supabase tables
4. **Use service_role key only on backend** - never expose in frontend
