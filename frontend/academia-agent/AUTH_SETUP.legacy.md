# AUTH_SETUP (LEGACY) - Email Provider

This file contains the original instructions for setting up NextAuth with the Email provider (magic links). It has been archived because the project now uses AWS Cognito for authentication.

---
## Original content (archived)

The original project used NextAuth with the Email provider (magic link) flow. Full original instructions were moved here and left unchanged for audit and rollback purposes.

If you need to restore the email-based flow, refer to the archived `AUTH_SETUP.md` content below and the project's git history.

---

<!-- BEGIN ARCHIVE: Original AUTH_SETUP.md -->

```markdown
# NextAuth Email Authentication Setup

This project uses NextAuth.js with email-based authentication (magic links).

## Features

- 🔐 Email-based authentication (passwordless magic links)
- ✅ Terms of Service agreement with checkbox
- 📧 Marketing consent collection
- 🎨 Beautiful shadcn UI components
- 🔒 Protected routes

## Setup Instructions

### 1. Install Dependencies

Already installed via package.json:
- `next-auth`: Authentication for Next.js
- shadcn UI components: `card`, `button`, `input`, `checkbox`, `label`

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend/academia-agent` directory:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual values:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-this-with-openssl-rand-base64-32

# Email Provider Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

#### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

#### Email Provider Setup (Gmail Example)

For Gmail, you'll need to:
1. Enable 2-factor authentication on your Google account
2. Generate an "App Password" at https://myaccount.google.com/apppasswords
3. Use the app password as `EMAIL_SERVER_PASSWORD`

**Alternative Email Providers:**

- **SendGrid**: Use SMTP credentials from SendGrid
- **AWS SES**: Configure with SES SMTP credentials
- **Mailgun**: Use Mailgun SMTP settings
- **Custom SMTP**: Any SMTP server will work

### 3. File Structure

```
app/
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts          # NextAuth API routes
├── terms/
│   └── page.tsx                  # Terms of Service page
├── page.tsx                      # Protected main page
└── layout.tsx                    # Root layout with AuthProvider

components/
├── auth-card.tsx                 # Sign-in/Sign-up component
├── auth-provider.tsx             # NextAuth SessionProvider wrapper
└── ui/                           # shadcn UI components
		├── button.tsx
		├── card.tsx
		├── checkbox.tsx
		├── input.tsx
		└── label.tsx

lib/
└── utils.ts                      # Utility functions (cn for Tailwind)
```

### 4. How It Works

1. **Unauthenticated users** see the auth card with:
	 - Email input field
	 - Terms & Privacy Policy checkbox
	 - Marketing consent notice
	 - Link to full Terms of Service

2. **After submitting email**:
	 - User receives a magic link via email
	 - Link is valid for 24 hours
	 - Click the link to sign in

3. **Authenticated users**:
	 - Access the main application
	 - Session persisted across page reloads
	 - Sign out button in header

### 5. Customization

#### Update Company Information

Replace "Eight Twelve Consulting LLC" references in:
- `components/auth-card.tsx`
- `app/terms/page.tsx`

#### Customize Email Templates

NextAuth uses default email templates. To customize, add to `authOptions` in `app/api/auth/[...nextauth]/route.ts`:

```typescript
EmailProvider({
	// ... existing config
	sendVerificationRequest: async ({ identifier, url, provider }) => {
		// Custom email sending logic
	},
})
```

#### Add Database (Recommended for Production)

For production, use a database adapter to store users and sessions:

```bash
pnpm add @auth/prisma-adapter prisma @prisma/client
```

Update `authOptions` in the NextAuth route:

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	// ... rest of config
};
```

### 6. Testing Locally

For local development without email setup, you can use a service like:

- **Ethereal Email** (fake SMTP): https://ethereal.email/
- **MailHog** (local SMTP): https://github.com/mailhog/MailHog
- **Mailtrap** (testing SMTP): https://mailtrap.io/

### 7. Production Deployment

1. Set environment variables in your hosting platform
2. Update `NEXTAUTH_URL` to your production domain
3. Configure a production-ready email provider
4. Consider adding a database adapter
5. Review and update the Terms of Service

## Privacy & Compliance

The implementation includes:
- ✅ Clear consent mechanism for email collection
- ✅ Explicit opt-in for marketing communications
- ✅ Link to Terms of Service and Privacy Policy
- ✅ Transparent data usage disclosure

Make sure to:
- Review the Terms of Service page and customize for your jurisdiction
- Add a cookie consent banner if required
- Implement data deletion capabilities per GDPR/CCPA
- Keep privacy policies up to date

## Troubleshooting

### Magic link not sending

- Check email server credentials
- Verify EMAIL_FROM is a valid sender address
- Check spam folder
- Review console/logs for SMTP errors

### Session not persisting

- Verify NEXTAUTH_SECRET is set
- Clear browser cookies and try again
- Check browser console for errors

### Type errors

- Ensure TypeScript is properly configured
- Run `pnpm install` to ensure all types are installed

## Support

For NextAuth issues, see: https://next-auth.js.org/
For shadcn UI, see: https://ui.shadcn.com/

```

<!-- END ARCHIVE -->



