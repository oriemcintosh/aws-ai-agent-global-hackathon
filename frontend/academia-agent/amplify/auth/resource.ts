import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'Thank you for signing up to use Academia Agent!',
      verificationEmailBody: (createCode) => `Here is your verification code: ${createCode()}`,
    },
  },
  senders: {
    email: {
      fromEmail: 'support@academiaagent.com',
      fromName: 'Academia Agent',
      replyTo: 'support@academiaagent.com',
    },
    // externalProviders: {
    //   signInWithApple: {
    //     clientId: secret('SIWA_CLIENT_ID'),
    //     keyId: secret('SIWA_KEY_ID'),
    //     privateKey: secret('SIWA_PRIVATE_KEY'),
    //     teamId: secret('SIWA_TEAM_ID')
    //   },
    //   callbackUrls: ['http://localhost:3000/chat'],
    //   logoutUrls: ['http://localhost:3000/']
    // },
  },
});
