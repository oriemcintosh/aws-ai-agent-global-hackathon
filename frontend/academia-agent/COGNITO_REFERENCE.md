# 🎯 AWS Cognito Quick Reference Card

## Environment Variables

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32>
COGNITO_CLIENT_ID=<from-aws-console>
COGNITO_CLIENT_SECRET=<from-aws-console>
COGNITO_ISSUER=https://cognito-idp.<region>.amazonaws.com/<pool-id>
```

## AWS Cognito Configuration

| Setting | Value |
|---------|-------|
| **User Pool Name** | `academia-agent-user-pool` |
| **Sign-in options** | Email |
| **App Client Name** | `academia-agent-web` |
| **Client Secret** | ✅ Generate secret |
| **Callback URL (Dev)** | `http://localhost:3000/api/auth/callback/cognito` |
| **Callback URL (Prod)** | `https://yourdomain.com/api/auth/callback/cognito` |
| **Sign-out URL (Dev)** | `http://localhost:3000` |
| **Sign-out URL (Prod)** | `https://yourdomain.com` |
| **OAuth Flow** | Authorization code grant |
| **OAuth Scopes** | openid, email, profile |
| **Hosted UI** | ✅ Enabled |

## Files Modified

```
✓ app/api/auth/[...nextauth]/route.ts
✓ components/auth-card.tsx
✓ .env.example
✓ types/next-auth.d.ts
```

## Key Commands

```bash
# Generate secret
openssl rand -base64 32

# Run dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Authentication Flow

```
User → Auth Card → Cognito Hosted UI → OAuth Callback → Session → Main App
```

## Testing Checklist

- [ ] Cognito user pool created
- [ ] App client configured
- [ ] .env.local created with credentials
- [ ] App running on localhost:3000
- [ ] Can click "Sign In with AWS Cognito"
- [ ] Redirects to Cognito Hosted UI
- [ ] Can create account
- [ ] Receives verification email
- [ ] Can verify email
- [ ] Can sign in
- [ ] Redirects back to app
- [ ] Main app loads (authenticated)
- [ ] Sign out works

## Common Issues

| Issue | Solution |
|-------|----------|
| Invalid redirect_uri | Check callback URL exactly matches |
| Client auth failed | Verify COGNITO_CLIENT_SECRET |
| Invalid issuer | Check region and pool ID in COGNITO_ISSUER |
| Redirect loop | Clear cookies, check NEXTAUTH_URL |

## Cognito Issuer Format

```
https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}
                    ^^^^^^^^                 ^^^^^^^^^^^^^^
                    Examples:                Examples:
                    us-east-1               us-east-1_AbCdEfGh
                    us-west-2               eu-west-1_12345678
                    eu-central-1            ap-southeast-1_XyZ
```

## Where to Find Values

| Value | Location in AWS Console |
|-------|------------------------|
| User Pool ID | User pool overview page |
| Region | Top-right of console OR in pool ID |
| Client ID | App integration → App clients |
| Client Secret | App clients → Show secret |

## Production Deployment

1. Update Cognito callback URLs with production domain
2. Set production environment variables
3. Update NEXTAUTH_URL to production URL
4. Generate new NEXTAUTH_SECRET for production
5. Configure SES for email delivery
6. Enable MFA (recommended)
7. Test complete flow

## Documentation

- **Start Here**: COGNITO_QUICKSTART.md
- **Detailed Setup**: COGNITO_SETUP.md
- **Migration Info**: MIGRATION_GUIDE.md
- **Complete Summary**: COGNITO_SUMMARY.md

## Support Links

- NextAuth: https://next-auth.js.org/providers/cognito
- AWS Cognito: https://docs.aws.amazon.com/cognito/
- AWS Console: https://console.aws.amazon.com/cognito/

---

**Keep this card handy for quick reference during setup and troubleshooting!**
