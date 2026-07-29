import { z } from "zod";
import { UserSchema } from "src/shared/models/shared-user.model";

export const UpdateMeBodySchema = UserSchema.pick({
  name: true,
  phoneNumber: true,
  avatar: true,
}).strict();

export const ChangePasswordBodySchema = UserSchema.pick({
  password: true,
})
  .strict()
  .extend({
    newPassword: z.string().min(8).max(100),
    confirmNewPassword: z.string().min(8).max(100),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Error.ConfirmNewPasswordNotMatch",
        path: ["confirmNewPassword"],
      });
    }
  });

export type UpdateMeBodyType = z.infer<typeof UpdateMeBodySchema>;
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>;
