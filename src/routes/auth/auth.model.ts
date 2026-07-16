import { z } from "zod";
import { TypeOfVerificationCode } from "src/shared/constants/auth.constant";
import { UserSchema } from "src/shared/models/shared-user.model";

export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(8).max(100),
    code: z.string().length(6),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const RegisterResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export const VerificationCodeSchema = z.object({
  id: z.number(),
  code: z.string().length(6),
  email: z.string().email(),
  type: z.enum([
    TypeOfVerificationCode.Register,
    TypeOfVerificationCode.ForgotPassword,
  ]),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const SendOtpBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict();

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict();

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict();

export const RefreshTokenSchema = z.object({
  token: z.string(),
  userId: z.number(),
  expiresAt: z.date(),
  deviceId: z.number(),
  createdAt: z.date(),
});

export const RefreshTokenResponseSchema = LoginResponseSchema;

export const DeviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string().max(255),
  ip: z.string().max(255),
  lastActive: z.date(),
  createdAt: z.date(),
  isActive: z.boolean(),
});

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string().max(255),
  description: z.string().max(255),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LogoutBodySchema = RefreshTokenBodySchema;

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;
export type RegisterResponseType = z.infer<typeof RegisterResponseSchema>;
export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;
export type SendOtpBodyType = z.infer<typeof SendOtpBodySchema>;
export type LoginBodyType = z.infer<typeof LoginBodySchema>;
export type LoginResponseType = z.infer<typeof LoginResponseSchema>;
export type RefreshTokenResponseType = z.infer<
  typeof RefreshTokenResponseSchema
>;
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>;
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;
export type DeviceType = z.infer<typeof DeviceSchema>;
export type RoleType = z.infer<typeof RoleSchema>;
export type LogoutBodyType = z.infer<typeof LogoutBodySchema>;
