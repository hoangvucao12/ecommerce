import { Injectable } from "@nestjs/common";
import * as OTPAuth from "otpauth";

@Injectable()
export class TwoFactorAuthService {
  private createTOTP(email: string, secret?: string) {
    return new OTPAuth.TOTP({
      issuer: "Ecommerce",
      label: email,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secret || new OTPAuth.Secret(),
    });
  }

  generateTOTPSecret(email: string) {
    const totp = this.createTOTP(email);
    const secret = totp.secret.base32;
    return {
      secret,
      uri: totp.toString(),
    };
  }

  verifyTOTPCode({
    email,
    token,
    secret,
  }: {
    email: string;
    token: string;
    secret: string;
  }): boolean {
    const totp = this.createTOTP(email, secret);
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  }
}
