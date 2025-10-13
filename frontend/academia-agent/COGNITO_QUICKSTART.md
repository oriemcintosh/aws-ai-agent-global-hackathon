# Quick Start: AWS Cognito with NextAuth

## 🚀 Get Started in 5 Steps

### Step 1: Create AWS Cognito User Pool

```bash
# Via AWS Console
1. Go to AWS Console → Cognito
2. Click "Create user pool"
3. Sign-in: Email
4. Enable Hosted UI
5. Note your User Pool ID and Region
```

### Step 2: Create App Client

```bash
# In your user pool
1. Go to "App integration" tab
2. Create app client:
   - Name: academia-agent-web
   - ✅ Generate client secret
   - Callback: http://localhost:3000/api/auth/callback/cognito
   - Sign-out: http://localhost:3000
   - OAuth flows: Authorization code
   - Scopes: openid, email, profile
3. Note Client ID and Client Secret
```

### Step 3: Configure Environment

Create `.env.local`:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)

COGNITO_CLIENT_ID=<from-step-2>
COGNITO_CLIENT_SECRET=<from-step-2>
COGNITO_ISSUER=https://cognito-idp.<region>.amazonaws.com/<pool-id>
```

**Example:**
```bash
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_abC123XyZ
```

### Step 4: Run the Application

```bash
cd /home/eighttwelvedev/src/aws-ai-agent-global-hackathon/frontend/academia-agent
pnpm dev
```

### Step 5: Test Authentication

1. Visit http://localhost:3000
2. Click "Sign In with AWS Cognito"
3. Sign up with your email
4. Verify your email (check spam folder)
5. Sign in

## 📝 What Changed from Email Provider

### Files Updated

✅ **app/api/auth/[...nextauth]/route.ts**
- Switched from `EmailProvider` to `CognitoProvider`
- Updated callbacks for OAuth flow
- Added access token handling

✅ **components/auth-card.tsx**
- Removed email input field
- Simplified to single "Sign In with AWS Cognito" button
- Kept terms checkbox requirement

✅ **.env.example**
- Replaced email server config with Cognito credentials
- Added COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET, COGNITO_ISSUER

## 🔑 Key Differences: Cognito vs Email Provider

| Feature | Email Provider | AWS Cognito |
|---------|---------------|-------------|
| **Authentication** | Magic link via email | OAuth 2.0 / OpenID Connect |
| **UI** | Custom form | Cognito Hosted UI or Custom |
| **User Management** | Your database | AWS Cognito User Pool |
| **Password** | None (passwordless) | Yes (managed by Cognito) |
| **Social Login** | Not supported | Supported (Google, Facebook, etc.) |
| **MFA** | Not supported | Supported (SMS, TOTP) |
| **Email Sending** | Your SMTP | Cognito or SES |
| **Scalability** | Depends on setup | AWS-managed, highly scalable |
| **Cost** | SMTP fees | Free tier: 50k MAU/month |

## 🎯 Authentication Flow

```
User clicks "Sign In"
    ↓
Redirected to Cognito Hosted UI
    ↓
User signs up or signs in
    ↓
Cognito redirects to: /api/auth/callback/cognito
    ↓
NextAuth processes OAuth callback
    ↓
Session created
    ↓
User redirected to main app (authenticated)
```

## ⚙️ Configuration Values Explained

```bash
# Your Next.js app URL
NEXTAUTH_URL=http://localhost:3000

# Random secret for signing tokens
NEXTAUTH_SECRET=<32-character-random-string>

# From Cognito App Client
COGNITO_CLIENT_ID=1234567890abcdefghij

# From Cognito App Client (click "Show secret")
COGNITO_CLIENT_SECRET=abcdef1234567890...

# Format: https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}
# Find REGION in AWS Console (e.g., us-east-1)
# Find USER_POOL_ID in User Pool overview (e.g., us-east-1_AbC123XyZ)
COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_AbC123XyZ
```

## 🛠️ Common Setup Issues

### Issue: "Invalid redirect_uri"

**Solution:**
- Callback URL in Cognito must be **exactly**: `http://localhost:3000/api/auth/callback/cognito`
- No trailing slash
- Match protocol (http vs https)

### Issue: "Client authentication failed"

**Solution:**
- Double-check `COGNITO_CLIENT_SECRET` - copy/paste carefully
- Ensure no extra spaces or newlines
- Check if secret was regenerated in Cognito

### Issue: "Invalid issuer"

**Solution:**
- Verify format: `https://cognito-idp.{region}.amazonaws.com/{userPoolId}`
- Check region matches your user pool
- Verify user pool ID is correct

### Issue: Redirect loop

**Solution:**
- Check `NEXTAUTH_URL` matches your actual URL
- Clear browser cookies
- Restart Next.js dev server

## 📚 Additional Features

### Enable Social Login

In Cognito User Pool → "Sign-in experience":
1. Add identity providers (Google, Facebook, Amazon, Apple)
2. Configure OAuth scopes
3. Update app client with new providers

### Customize Hosted UI

1. Go to "App integration" → Domain
2. Upload logo
3. Customize CSS
4. Change colors

### Add Custom Attributes

Track marketing consent in Cognito:
1. "Sign-up experience" → "Custom attributes"
2. Add `custom:marketing_consent` (String)
3. Capture during sign-up flow

## 🚀 Production Deployment

### Update Callback URLs

In Cognito app client, add production URLs:
```
https://yourdomain.com/api/auth/callback/cognito
```

### Update Environment Variables

```bash
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<new-production-secret>
# Cognito credentials remain the same
```

### Use Amazon SES for Emails

1. Set up SES in AWS Console
2. Verify your domain
3. In Cognito → "Messaging" → Use SES

## 📖 Documentation

- **Detailed setup**: See `COGNITO_SETUP.md`
- **NextAuth docs**: https://next-auth.js.org/providers/cognito
- **AWS Cognito docs**: https://docs.aws.amazon.com/cognito/

## ✅ What's Still Working

- ✅ Terms checkbox requirement
- ✅ Marketing consent collection
- ✅ Privacy policy at `/terms`
- ✅ Protected routes
- ✅ Sign-out functionality
- ✅ Session management

The only change is **how** users authenticate - now through AWS Cognito instead of email magic links!
