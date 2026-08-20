import { z } from "zod";

import { TypeOfVerificationCode } from "src/shared/constants/auth.constant";
import { UserSchema } from "src/shared/models/shared-user.model";

const VerificationCodeValueSchema = z.string().regex(/^\d{6}$/);

export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(8).max(100),
    code: VerificationCodeValueSchema,
  })
  .strict()
  .superRefine(({ confirmPassword, password }, context) => {
    if (confirmPassword !== password) {
      context.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const RegisterResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export const SendOtpBodySchema = z
  .object({
    email: z.string().email(),
    type: z.enum([
      TypeOfVerificationCode.Register,
      TypeOfVerificationCode.ForgotPassword,
      TypeOfVerificationCode.Login,
      TypeOfVerificationCode.Disable2FA,
    ]),
  })
  .strict();

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
})
  .extend({
    totpCode: VerificationCodeValueSchema.optional(),
    code: VerificationCodeValueSchema.optional(),
  })
  .strict()
  .superRefine(({ totpCode, code }, context) => {
    if (totpCode !== undefined && code !== undefined) {
      const message = "Use either totpCode or code, not both";
      context.addIssue({ code: "custom", message, path: ["totpCode"] });
      context.addIssue({ code: "custom", message, path: ["code"] });
    }
  });

export const TokenResponseSchema = z.object({
  accessToken: z.string().min(1),
});

export const GetAuthorizationUrlResponseSchema = z.object({
  url: z.string().url(),
});

export const GoogleCallbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export const ForgotPasswordBodySchema = z
  .object({
    email: z.string().email(),
    code: VerificationCodeValueSchema,
    newPassword: z.string().min(8).max(100),
    confirmNewPassword: z.string().min(8).max(100),
  })
  .strict()
  .superRefine(({ confirmNewPassword, newPassword }, context) => {
    if (confirmNewPassword !== newPassword) {
      context.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmNewPassword"],
      });
    }
  });

export const Disable2FABodySchema = z
  .object({
    totpCode: VerificationCodeValueSchema.optional(),
    code: VerificationCodeValueSchema.optional(),
  })
  .strict()
  .superRefine(({ totpCode, code }, context) => {
    if ((totpCode !== undefined) === (code !== undefined)) {
      const message = "Exactly one of totpCode or code is required";
      context.addIssue({ code: "custom", message, path: ["totpCode"] });
      context.addIssue({ code: "custom", message, path: ["code"] });
    }
  });

export const Setup2FAResponseSchema = z.object({
  secret: z.string().min(1),
  uri: z.string().url(),
});

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;
export type SendOtpBodyType = z.infer<typeof SendOtpBodySchema>;
export type LoginBodyType = z.infer<typeof LoginBodySchema>;
export type GoogleCallbackQueryType = z.infer<typeof GoogleCallbackQuerySchema>;
export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>;
export type Disable2FABodyType = z.infer<typeof Disable2FABodySchema>;
