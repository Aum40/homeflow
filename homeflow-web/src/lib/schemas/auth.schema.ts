import z from 'zod';

export const registerSchema = z
  .object({
    firstName: z
      .string('First name must be a string.')
      .min(1, 'First name is required.'),
    lastName: z
      .string('Last name must be a string.')
      .min(1, 'Last name is required.'),
    nickName: z
      .string('nick name must be a string')
      .min(1, 'nick name is required.'),

    email: z.email('Invalid email address.'),
    password: z
      .string('Password must be a string.')
      .min(8, 'Password must be at least 8 characters.')
      .regex(
        /^[!-~]+$/,
        'Password must use English letters, numbers, and symbols only.',
      )
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one symbol.',
      ),
    confirmPassword: z.string('Confirm password must be a string.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email('Invalid email address.'),
  password: z
    .string('Password must be a string.')
    .min(1, 'Password is required.'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email('Invalid email address.'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string('Token must be a string.').min(1, 'Token is required.'),
    password: z
      .string('Password must be a string.')
      .min(8, 'Password must be at least 8 characters.')
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one symbol.',
      ),
    confirmPassword: z.string('Confirm password must be a string.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
