import { z } from "zod";
import {
  UserStatus,
  TypeOfVerificationCode,
} from "src/shared/constants/auth.constant";

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(100),
  phoneNumber: z.string().min(10).max(15),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum([UserStatus.Active, UserStatus.Inactive, UserStatus.Blocked]),
  roleId: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
});
export type UserType = z.infer<typeof UserSchema>;

export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({ confirmPassword: z.string().min(8).max(100) })
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
export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;

export const RegisterResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});
export type RegisterResponseType = z.infer<typeof RegisterResponseSchema>;

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
export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;

export const SendOtpBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict();

export type SendOtpBodyType = z.infer<typeof SendOtpBodySchema>;
