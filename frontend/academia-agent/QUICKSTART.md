# Quick Start: NextAuth Email Authentication

## 🚀 Get Started in 3 Steps

### Step 1: Environment Setup

```bash
# Navigate to the frontend directory
cd /home/eighttwelvedev/src/aws-ai-agent-global-hackathon/frontend/academia-agent

# Copy environment template
cp .env.example .env.local

# Generate a secret key
openssl rand -base64 32
```

Add to `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<paste-generated-secret-here>

# For testing with Ethereal (fake email)
# Visit https://ethereal.email/create to get credentials
EMAIL_SERVER_HOST=smtp.ethereal.email
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=<ethereal-username>
EMAIL_SERVER_PASSWORD=<ethereal-password>
EMAIL_FROM=noreply@academiaagent.com
```

### Step 2: Run the Application

```bash
pnpm dev
```

Visit http://localhost:3000

### Step 3: Test Authentication

1. Enter your email address
2. Check the "I agree to terms..." checkbox
3. Click "Continue with Email"
4. Check the Ethereal inbox for the magic link
5. Click the link to sign in

## 📋 What's Included

✅ **Protected main page** - Only accessible after authentication
✅ **Sign-up/Sign-in card** - Beautiful shadcn UI components
✅ **Email collection** - Passwordless magic link authentication
✅ **Terms checkbox** - Required consent before sign-up
✅ **Privacy policy** - Comprehensive terms page (modeled after Anthropic)
✅ **Marketing consent** - Clear disclosure about email usage
✅ **Sign-out functionality** - Button in the app header

## 🎨 Components Created

- `components/auth-card.tsx` - Main authentication UI
- `components/auth-provider.tsx` - Session provider wrapper
- `components/ui/*` - shadcn UI components
- `app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `app/terms/page.tsx` - Terms of Service page
- `app/page.tsx` - Protected main application (updated)
- `app/layout.tsx` - Wrapped with AuthProvider (updated)

## 🔧 Production Setup

For production deployment, you'll want to:

1. **Use a real email provider** (SendGrid, AWS SES, etc.)
2. **Add a database** for user/session persistence
3. **Update the Terms of Service** with your specific legal requirements
4. **Configure proper domain** in NEXTAUTH_URL

See `AUTH_SETUP.md` for detailed instructions.

## 📝 Legal Compliance

The Terms of Service clearly states:
- Email addresses are collected for authentication and marketing
- Users explicitly consent by checking the terms box
- Marketing emails are opt-in via the terms agreement
- Users can unsubscribe anytime from marketing emails

Make sure to customize the terms for your specific use case and jurisdiction!
