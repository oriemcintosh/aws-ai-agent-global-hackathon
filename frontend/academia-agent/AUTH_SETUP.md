# NextAuth Setup (Now using AWS Cognito)

This project has migrated from NextAuth's Email provider (magic links) to **AWS Cognito** as the authentication provider. The previous email-based setup is archived in `AUTH_SETUP.legacy.md`.

Follow the Cognito-specific quickstart and setup docs created in this repository:

- `COGNITO_QUICKSTART.md` — Quick 5-step setup to get Cognito working locally.
- `COGNITO_SETUP.md` — Full Cognito setup guide (user pool, app client, callbacks, SES, MFA, Lambda triggers).
- `COGNITO_REFERENCE.md` — Compact reference card for environment variables and common issues.

Quick checklist to get started locally:

1. Copy the example env file and update with your Cognito credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
COGNITO_CLIENT_ID=<your-client-id>
COGNITO_CLIENT_SECRET=<your-client-secret>
COGNITO_ISSUER=https://cognito-idp.<region>.amazonaws.com/<user-pool-id>
```

2. Start the app:

```bash
pnpm dev
```

3. Visit `http://localhost:3000` and click the "Sign In with AWS Cognito" button. Follow the hosted UI flow.

If you need to revert to email-based auth or reference the old instructions, see `AUTH_SETUP.legacy.md`.

If anything here is unclear I can: (a) walk you through creating a Cognito user pool step-by-step, (b) add example `.env.local` values (redacted), or (c) help test a full sign-in flow locally.
