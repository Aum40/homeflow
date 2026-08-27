import z from 'zod';

export const updateProfileSchema = z.object({
  firstName: z
    .string('First name must be a string.')
    .min(1, 'First name is required.'),
  lastName: z
    .string('Last name must be a string.')
    .min(1, 'Last name is required.')
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string('Current password must be a string.')
      .min(1, 'Current password is required.'),
    newPassword: z
      .string('New password must be a string.')
      .min(8, 'Password must be at least 8 characters.')
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one symbol.'
      ),
    confirmNewPassword: z.string('Confirm new password must be a string.')
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match.',
    path: ['confirmNewPassword']
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
