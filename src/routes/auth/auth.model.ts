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
