# AWS Cognito Setup Guide for NextAuth

This guide will walk you through setting up AWS Cognito as your authentication provider for the Academia Agent application.

## Prerequisites

- AWS Account
- AWS CLI installed (optional but recommended)
- Basic understanding of AWS Cognito

## Step 1: Create a Cognito User Pool

### Via AWS Console

1. **Navigate to Amazon Cognito**
   - Go to the [AWS Console](https://console.aws.amazon.com/)
   - Search for "Cognito" and select it
   - Click "Create user pool"

2. **Configure Sign-in Experience**
   - **Sign-in options**: Select "Email"
   - **User name requirements**: Choose "Email" 
   - Click "Next"

3. **Configure Security Requirements**
   - **Password policy**: Choose your preferred strength (Cognito defaults recommended)
   - **Multi-factor authentication**: Optional (recommended for production)
   - **User account recovery**: Select "Email only"
   - Click "Next"

4. **Configure Sign-up Experience**
   - **Self-service sign-up**: Enable
   - **Attribute verification**: Select "Send email message, verify email address"
   - **Required attributes**: 
     - Email (required by default)
     - Name (optional, recommended)
   - **Custom attributes**: You can add custom attributes for marketing consent tracking
   - Click "Next"

5. **Configure Message Delivery**
   - **Email provider**: 
     - For testing: "Send email with Cognito" (limited to 50 emails/day)
     - For production: "Send email with Amazon SES" (recommended)
   - **SES Region**: Select your region
   - **FROM email address**: `noreply@yourdomain.com`
   - **FROM sender name**: `Academia Agent`
   - Click "Next"

6. **Integrate Your App**
   - **User pool name**: `academia-agent-user-pool`
   - **Hosted authentication pages**: 
     - ✅ **Use the Cognito Hosted UI**
     - Domain type: Choose "Use a Cognito domain"
     - Cognito domain: `academia-agent-[your-unique-id]`
   - **Initial app client**:
     - App client name: `academia-agent-web`
     - **Client secret**: ✅ Generate a client secret
     - **Allowed callback URLs**: 
       - For local development: `http://localhost:3000/api/auth/callback/cognito`
       - For production: `https://yourdomain.com/api/auth/callback/cognito`
     - **Allowed sign-out URLs**:
       - For local: `http://localhost:3000`
       - For production: `https://yourdomain.com`
     - **Identity providers**: Select "Cognito user pool"
     - **OAuth 2.0 grant types**: 
       - ✅ Authorization code grant
     - **OpenID Connect scopes**:
       - ✅ OpenID
       - ✅ Email
       - ✅ Profile
   - Click "Next"

7. **Review and Create**
   - Review your settings
   - Click "Create user pool"

### Via AWS CLI

```bash
# Create user pool
aws cognito-idp create-user-pool \
  --pool-name academia-agent-user-pool \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true}" \
  --auto-verified-attributes email \
  --username-attributes email \
  --email-configuration EmailSendingAccount=COGNITO_DEFAULT

# Note the UserPoolId from the response

# Create user pool client
aws cognito-idp create-user-pool-client \
  --user-pool-id <YOUR_USER_POOL_ID> \
  --client-name academia-agent-web \
  --generate-secret \
  --allowed-o-auth-flows authorization_code \
  --allowed-o-auth-scopes openid email profile \
  --callback-urls http://localhost:3000/api/auth/callback/cognito \
  --logout-urls http://localhost:3000 \
  --supported-identity-providers COGNITO
```

## Step 2: Collect Your Credentials

After creating your user pool and app client, you'll need these values:

1. **User Pool ID**: Found in the user pool overview (e.g., `us-east-1_abcdefgh`)
2. **App Client ID**: Found in the app client settings
3. **App Client Secret**: Found in the app client settings (show/reveal secret)
4. **AWS Region**: The region where you created the pool (e.g., `us-east-1`)

## Step 3: Configure Environment Variables

Create/update your `.env.local` file:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# AWS Cognito Configuration
COGNITO_CLIENT_ID=<your-app-client-id>
COGNITO_CLIENT_SECRET=<your-app-client-secret>
COGNITO_ISSUER=https://cognito-idp.<region>.amazonaws.com/<user-pool-id>

# Example:
# COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_abcdefgh
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Step 4: Update Callback URLs for Production

When deploying to production, update your Cognito app client:

1. Go to your user pool in AWS Console
2. Navigate to "App integration" tab
3. Click on your app client
4. Click "Edit" under "Hosted UI"
5. Add production callback URLs:
   - `https://yourdomain.com/api/auth/callback/cognito`
6. Add production sign-out URLs:
   - `https://yourdomain.com`
7. Update `NEXTAUTH_URL` in production environment variables

## Step 5: Customize Cognito Hosted UI (Optional)

1. In your user pool, go to "App integration" → "Domain"
2. Click on your domain
3. Under "Customize hosted UI", you can:
   - Upload a logo
   - Change colors and CSS
   - Add custom branding

## Step 6: Test the Authentication Flow

1. Start your Next.js app:
   ```bash
   cd /home/eighttwelvedev/src/aws-ai-agent-global-hackathon/frontend/academia-agent
   pnpm dev
   ```

2. Visit `http://localhost:3000`

3. Click "Sign In with AWS Cognito"

4. You should be redirected to the Cognito Hosted UI

5. Choose "Sign up" and create a new account

6. Verify your email address

7. Sign in and you should be redirected back to your app

## Advanced Configuration

### Email Customization

Customize email templates in Cognito:

1. Go to your user pool
2. Click "Messaging" tab
3. Edit email templates for:
   - Verification emails
   - Password reset emails
   - Invitation emails

### Custom Attributes for Marketing Consent

Add a custom attribute to track marketing consent:

1. Go to "Sign-up experience" tab
2. Under "Custom attributes", click "Add custom attribute"
3. Name: `marketing_consent`
4. Type: String
5. Mutable: Yes

Then update your sign-up flow to capture this during registration.

### Multi-Factor Authentication (MFA)

Enable MFA for added security:

1. Go to "Sign-in experience" tab
2. Under "Multi-factor authentication", click "Edit"
3. Choose:
   - **Optional**: Users can enable MFA
   - **Required**: All users must use MFA
4. Select MFA methods:
   - SMS
   - Authenticator apps (TOTP)

### Lambda Triggers

Add custom logic with Lambda triggers:

1. Go to "User pool properties" tab
2. Click "Add Lambda trigger"
3. Choose trigger type:
   - **Pre sign-up**: Validate or modify user attributes
   - **Post confirmation**: Send welcome email, add to mailing list
   - **Pre authentication**: Custom authentication logic
   - **Post authentication**: Log successful sign-ins

Example: Automatically add confirmed users to a marketing list:

```javascript
// Lambda function: Post Confirmation Trigger
exports.handler = async (event) => {
  const { email } = event.request.userAttributes;
  
  // Add to your marketing platform (e.g., SendGrid, Mailchimp)
  // await addToMailingList(email);
  
  return event;
};
```

## Troubleshooting

### "Invalid redirect_uri"

- Verify callback URLs in Cognito app client match exactly
- Check for trailing slashes
- Ensure protocol (http/https) matches

### "Client authentication failed"

- Verify `COGNITO_CLIENT_SECRET` is correct
- Ensure the secret hasn't been regenerated

### "Invalid issuer"

- Check `COGNITO_ISSUER` format: `https://cognito-idp.{region}.amazonaws.com/{userPoolId}`
- Verify region and user pool ID are correct

### Email not sending

- Check if you're using Cognito's email service (50/day limit)
- Consider setting up Amazon SES for production
- Verify email configuration in user pool settings

### CORS errors

- Not applicable for OAuth flow (server-side redirect)
- If you see CORS errors, check your NextAuth configuration

## Cost Considerations

AWS Cognito pricing (as of 2025):

- **Free tier**: 50,000 MAUs (Monthly Active Users) per month
- **Beyond free tier**: $0.0055 per MAU (first 50,000)
- **SMS MFA**: $0.00645 per SMS message (if using SMS MFA)

Most small to medium applications will stay within the free tier.

## Security Best Practices

1. ✅ **Use HTTPS in production** - Required for OAuth
2. ✅ **Enable MFA** - Add extra security layer
3. ✅ **Use strong password policies** - Protect user accounts
4. ✅ **Monitor sign-in attempts** - Use CloudWatch for suspicious activity
5. ✅ **Regularly rotate client secrets** - Enhance security
6. ✅ **Use SES for emails** - More reliable than Cognito email
7. ✅ **Enable account recovery** - Via email verification
8. ✅ **Set up CloudWatch alarms** - Monitor authentication failures

## Production Checklist

- [ ] Move from Cognito email to Amazon SES
- [ ] Update callback URLs to production domain
- [ ] Enable MFA (at least optional)
- [ ] Set up CloudWatch monitoring
- [ ] Configure custom email templates
- [ ] Set up Lambda triggers for user onboarding
- [ ] Test complete sign-up and sign-in flow
- [ ] Add custom domain for hosted UI (optional)
- [ ] Configure password policies
- [ ] Set up account recovery options

## Next Steps

- Review the [NextAuth Cognito Provider docs](https://next-auth.js.org/providers/cognito)
- Learn about [AWS Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- Explore [Cognito Lambda Triggers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools-working-with-aws-lambda-triggers.html)
