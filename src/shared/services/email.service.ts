import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import envConfig from "../config";
import fs from "fs";
import path from "path";

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY);
  }

  sendOtp(payload: { email: string; code: string }) {
    const otpTemplate = fs.readFileSync(
      path.resolve("src/shared/email-templates/otp.html"),
      "utf-8",
    );

    const html = otpTemplate
      .replace("{{username}}", payload.email)
      .replace("{{otp}}", payload.code)
      .replace("{{expiry}}", "3 phút");

    return this.resend.emails.send({
      from: "Ecommerce <onboarding@resend.dev>",
      to: ["nulkite@gmail.com"],
      subject: "Your OTP Code",
      html: html,
    });
  }
}
