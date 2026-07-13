import z from "zod";
import fs from "fs";
import path from "path";
import { config } from "dotenv";

config({
  path: ".env",
});

// Kiểm tra coi thử có file .env hay chưa
if (!fs.existsSync(path.resolve(".env"))) {
  console.log("Không tìm thấy file .env");
  process.exit(1);
}

const configSchema = z.object({
  // Database
  DATABASE_URL: z.string(),

  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),

  // API
  // SECRET_API_KEY: z.string(),

  // Server
  PORT: z.string().default("3000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),

  // Admin
  ADMIN_EMAIL: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_NAME: z.string(),
  ADMIN_PHONENUMBER: z.string(),

  // Otp
  OTP_EXPIRES_IN: z.string().default("3m"),

  // Resend
  RESEND_API_KEY: z.string(),
});

const configServer = configSchema.safeParse(process.env);

if (!configServer.success) {
  console.log("Các giá trị khai báo trong file .env không hợp lệ");
  console.error(configServer.error);
  process.exit(1);
}

const envConfig = configServer.data;

export default envConfig;
