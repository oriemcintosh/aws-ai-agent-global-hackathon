import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: "CODE",
      verificationEmailSubject: "Welcome to the Academia Agent App!",
      verificationEmailBody: (createCode) => `Use this code to confirm your account: ${createCode()}`,
    },
  }
});