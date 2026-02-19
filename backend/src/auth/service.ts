import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/drizzle';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const SALT_ROUNDS = 12;

export type UserPayload = {
  id: string;
  email: string;
  name: string | null;
};

export async function register(
  email: string,
  password: string,
  name?: string
): Promise<{ user: UserPayload; token: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error('Email is required');
  }
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const existing = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
  if (existing.length > 0) {
    logger.warn('Auth: registration attempted with existing email', { email: normalizedEmail });
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const [created] = await db
    .insert(users)
    .values({
      email: normalizedEmail,
      name: name?.trim() || null,
      passwordHash,
    })
    .returning({ id: users.id, email: users.email, name: users.name });

  if (!created) {
    throw new Error('Failed to create user');
  }

  const payload = { id: created.id, email: created.email };
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
  logger.info('Auth: user registered', { userId: created.id, email: created.email });
  return {
    user: { id: created.id, email: created.email, name: created.name ?? null },
    token,
  };
}

export async function login(
  email: string,
  password: string
): Promise<{ user: UserPayload; token: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
  if (!user) {
    logger.warn('Auth: login failed - user not found', { email: normalizedEmail });
    throw new Error('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    logger.warn('Auth: login failed - invalid password', { userId: user.id });
    throw new Error('Invalid email or password');
  }

  const payload = { id: user.id, email: user.email };
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
  logger.info('Auth: user logged in', { userId: user.id });
  return {
    user: { id: user.id, email: user.email, name: user.name ?? null },
    token,
  };
}

export async function getMe(userId: string): Promise<UserPayload | null> {
  const [user] = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name ?? null };
}
