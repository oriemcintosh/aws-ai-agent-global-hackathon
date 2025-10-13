# Migration Guide: Email Provider → AWS Cognito

This guide explains the changes made to switch from NextAuth Email Provider to AWS Cognito.

## What Changed

### 1. Authentication Flow

**Before (Email Provider):**
```
User enters email → Magic link sent → User clicks link → Authenticated
```

**After (AWS Cognito):**
```
User clicks sign-in → Redirected to Cognito → Signs in/up → Redirected back → Authenticated
```

### 2. Code Changes

#### app/api/auth/[...nextauth]/route.ts

**Before:**
```typescript
import EmailProvider from "next-auth/providers/email";

providers: [
  EmailProvider({
    server: {
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    },
    from: process.env.EMAIL_FROM,
  }),
]
```

**After:**
```typescript
import CognitoProvider from "next-auth/providers/cognito";

providers: [
  CognitoProvider({
    clientId: process.env.COGNITO_CLIENT_ID!,
    clientSecret: process.env.COGNITO_CLIENT_SECRET!,
    issuer: process.env.COGNITO_ISSUER,
  }),
]
```

#### components/auth-card.tsx

**Before:**
- Email input field
- Form submission
- Email validation
- "Check your email" success state

**After:**
- Single button
- Direct redirect to Cognito
- No email input (handled by Cognito)
- Simpler component

#### .env.local

**Before:**
```bash
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

**After:**
```bash
COGNITO_CLIENT_ID=your-client-id
COGNITO_CLIENT_SECRET=your-client-secret
COGNITO_ISSUER=https://cognito-idp.region.amazonaws.com/poolId
```

## Benefits of AWS Cognito

### ✅ Advantages

1. **No SMTP Setup Required**
   - No need to configure email servers
   - AWS handles email delivery
   - Built-in email templates

2. **Password Management**
   - Users can set passwords
   - Forgot password flow included
   - Password policies enforced by Cognito

3. **User Management UI**
   - AWS Console for managing users
   - View user attributes
   - Disable/enable accounts
   - See authentication logs

4. **Enhanced Security**
   - MFA support (SMS, TOTP)
   - Brute force protection
   - Account recovery options
   - Advanced security features

5. **Scalability**
   - AWS-managed infrastructure
   - Handles millions of users
   - No performance concerns

6. **Social Providers**
   - Easy integration with Google, Facebook, etc.
   - Single configuration point
   - No additional provider setup

7. **Compliance**
   - SOC 2, PCI DSS, HIPAA eligible
   - Data residency options
   - Audit logging via CloudTrail

8. **Cost**
   - Free tier: 50,000 MAU/month
   - Predictable pricing beyond that
   - No SMTP service fees

### ⚠️ Considerations

1. **AWS Lock-in**
   - Tied to AWS ecosystem
   - Migration requires data export

2. **Hosted UI**
   - Default UI is outside your app
   - Customization is limited
   - Can build custom UI with AWS SDK (more complex)

3. **Learning Curve**
   - AWS Cognito concepts
   - IAM permissions
   - AWS Console navigation

4. **Redirect Flow**
   - Users leave your site briefly
   - May feel less seamless than magic links

## Migration Steps for Existing Users

If you already have users with the email provider:

### Option 1: Fresh Start (Recommended for Development)

1. Start fresh with Cognito
2. Users create new accounts
3. No migration needed

### Option 2: User Migration with Lambda Trigger

For production apps with existing users:

1. **Set up Migration Lambda**
   ```javascript
   // Lambda function triggered by Cognito
   exports.handler = async (event) => {
     if (event.triggerSource === "UserMigration_Authentication") {
       // Verify user from your old system
       const user = await getExistingUser(event.userName);
       
       if (user && verifyPassword(event.request.password, user.passwordHash)) {
         return {
           ...event,
           response: {
             userAttributes: {
               email: user.email,
               email_verified: "true",
             },
             finalUserStatus: "CONFIRMED",
             messageAction: "SUPPRESS",
           },
         };
       }
       throw new Error("Invalid credentials");
     }
     return event;
   };
   ```

2. **Attach to Cognito User Pool**
   - Go to User Pool → Triggers
   - Add "User Migration" trigger
   - Select your Lambda function

3. **Test Migration**
   - Existing users sign in with email/password
   - Lambda validates against old system
   - User automatically migrated to Cognito

### Option 3: Bulk Import

Use AWS CLI to bulk import users:

```bash
# Create CSV with user data
# email,email_verified,name
# user@example.com,true,John Doe

# Import to Cognito
aws cognito-idp create-user-import-job \
  --user-pool-id your-pool-id \
  --job-name "Initial-Migration" \
  --cloud-watch-logs-role-arn arn:aws:iam::account:role/CognitoImport
```

## Testing Your Migration

### 1. Test Sign-Up Flow

```bash
# Start your app
pnpm dev

# Visit http://localhost:3000
# Click "Sign In with AWS Cognito"
# Click "Sign up"
# Enter email and password
# Verify email
# Sign in
```

### 2. Test Terms Agreement

```bash
# Visit http://localhost:3000
# Try to sign in WITHOUT checking terms box
# Should see error message
# Check terms box
# Should successfully redirect to Cognito
```

### 3. Test Sign-Out

```bash
# After signing in
# Click "Sign Out" button in header
# Should be redirected to auth screen
# Session should be cleared
```

### 4. Test Protected Routes

```bash
# While signed out, try to access /
# Should see auth card
# Sign in
# Should see main app
```

## Rollback Plan

If you need to revert to email provider:

1. **Restore Previous Files**
   ```bash
   git checkout main -- app/api/auth/[...nextauth]/route.ts
   git checkout main -- components/auth-card.tsx
   git checkout main -- .env.example
   ```

2. **Restore Environment Variables**
   ```bash
   # Remove Cognito vars
   # Add back email server vars
   ```

3. **Restart Application**
   ```bash
   pnpm dev
   ```

## Cost Comparison

### Email Provider (SMTP)

- SendGrid: $15-20/month for 50k emails
- AWS SES: ~$5/month for 50k emails
- Gmail: Free (limited), potential reliability issues

### AWS Cognito

- Free tier: 50,000 MAU/month (Monthly Active Users)
- Beyond free tier: $0.0055 per MAU
- **Example**: 100k MAU = 50k free + 50k paid = $275/month

For most applications, Cognito is cost-effective and includes more features.

## Troubleshooting Migration Issues

### Users Can't Sign In

**Check:**
- Cognito user pool is created
- App client has correct callback URLs
- Environment variables are set correctly
- User exists in Cognito (check AWS Console)

### Infinite Redirect Loop

**Check:**
- NEXTAUTH_URL matches your actual URL
- Callback URL in Cognito is exact match
- No browser cookie issues (try incognito)

### Session Not Persisting

**Check:**
- NEXTAUTH_SECRET is set and consistent
- Cookies are enabled in browser
- No errors in browser console

## Next Steps After Migration

1. ✅ Test all authentication flows
2. ✅ Configure email templates in Cognito
3. ✅ Set up MFA (optional but recommended)
4. ✅ Configure password policies
5. ✅ Set up CloudWatch monitoring
6. ✅ Add Lambda triggers for user lifecycle events
7. ✅ Consider adding social login providers
8. ✅ Update documentation for your team

## Support Resources

- **AWS Cognito Documentation**: https://docs.aws.amazon.com/cognito/
- **NextAuth Cognito Provider**: https://next-auth.js.org/providers/cognito
- **AWS Support**: Available through AWS Console
- **Community**: NextAuth Discord, AWS Forums

## Summary

The migration from Email Provider to AWS Cognito provides:
- More robust authentication
- Better user management
- Enhanced security features
- Simplified email handling
- Production-ready scalability

All while maintaining the same user experience with terms agreement and privacy policy requirements!
