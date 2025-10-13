# Testing Authentication Locally

## Option 1: Ethereal Email (Recommended for Testing)

Ethereal Email is a fake SMTP service that captures emails for testing.

1. Visit https://ethereal.email/create
2. Click "Create Ethereal Account"
3. Copy the credentials shown
4. Add to `.env.local`:

```env
EMAIL_SERVER_HOST=smtp.ethereal.email
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=<your-ethereal-username>
EMAIL_SERVER_PASSWORD=<your-ethereal-password>
EMAIL_FROM=noreply@academiaagent.com
```

5. When you sign in, check https://ethereal.email/messages for the magic link

## Option 2: Gmail (For Real Testing)

1. Enable 2-factor authentication on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Create an app password
4. Add to `.env.local`:

```env
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=<your-app-password>
EMAIL_FROM=your-email@gmail.com
```

## Option 3: Console Log (Development Only)

For quick testing without email setup, you can modify the NextAuth route to log the sign-in URL to the console.

Add this to `app/api/auth/[...nextauth]/route.ts`:

```typescript
EmailProvider({
  // ... existing config
  async sendVerificationRequest({ identifier, url, provider }) {
    console.log("=================================");
    console.log("Magic Link Sign In");
    console.log("Email:", identifier);
    console.log("Sign-in URL:", url);
    console.log("=================================");
    
    // In production, actually send the email here
    // For now, just log to console
  },
})
```

Then check your terminal console for the magic link!

## Troubleshooting

### "Failed to send verification email"

- Double-check your email credentials
- Make sure EMAIL_SERVER_HOST, PORT, USER, and PASSWORD are all set
- Try using Ethereal first to verify the setup works

### "NEXTAUTH_SECRET not set"

Run: `openssl rand -base64 32` and add the output to `.env.local`

### Can't see the magic link in Ethereal

- Go to https://ethereal.email/messages
- Look for emails sent to your test address
- The magic link expires in 24 hours
