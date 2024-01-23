'use server';
import * as z from 'zod';
import bcrypt from 'bcryptjs';

import { NewPasswordSchema } from '@/schemas';
import {
  getPasswordResetTokenByEmail,
  getPasswordResetTokenByToken,
} from '@/data/passwordResetToken';
import { getUserByEmail } from '@/data/user';
import prisma from '@/lib/prisma';

export const newPassword = async (
  value: z.infer<typeof NewPasswordSchema>,
  token?: string | null
) => {
  if (!token) {
    return { error: 'Missing token!' };
  }

  const validatedFields = NewPasswordSchema.safeParse(value);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }
  const { password } = validatedFields.data;

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) {
    return { error: 'Invalid token' };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: 'Token has expired!' };
  }

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) {
    return { error: 'Email does not exist!' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  return { success: 'Password updated!' };
};
