import { defineAuth } from '@aws-amplify/backend';
import { encode } from 'he';

// Number of minutes before the verification code expires
const CODE_EXPIRATION_MINUTES = 10;

export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: "CODE",
      verificationEmailSubject: "Welcome to the Academia Agent App!",
      verificationEmailBody: (createCode) => `
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h2>Welcome to Academia Agent App!</h2>
            <div style="font-size: 1.5em; font-weight: bold; margin: 16px 0;">${encode(String(createCode()))}</div>
            <div style="font-size: 1.5em; font-weight: bold; margin: 16px 0;">${String(createCode()).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            <p><strong>Note:</strong> This code will expire in ${CODE_EXPIRATION_MINUTES} minutes. For your security, do not share this code with anyone.</p>
            <hr />
            <p>If you did not request this, please ignore this email.</p>
          </body>
        </html>
      `,
    },
  }
});