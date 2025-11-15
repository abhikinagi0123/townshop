"use node";

import { Email } from "@convex-dev/auth/providers/Email";

function generateRandomString(length: number, chars: string): string {
  let result = "";
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  for (let i = 0; i < length; i++) {
    const byte = randomBytes[i];
    if (byte !== undefined) {
      result += chars[byte % chars.length];
    }
  }
  return result;
}

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes
  generateVerificationToken() {
    return generateRandomString(6, "0123456789");
  },
  async sendVerificationRequest({ identifier: email, token }: { identifier: string; token: string }) {
    // Email sending is disabled - using console log for development
    console.log(`Verification code for ${email}: ${token}`);
    // In production, integrate with an email service like Resend, SendGrid, etc.
  },
});