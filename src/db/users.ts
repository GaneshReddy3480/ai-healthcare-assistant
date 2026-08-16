import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(
  uid: string, 
  email: string, 
  name?: string,
  phone?: string
) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        name: name || '',
        phone: phone || '',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(name ? { name } : {}),
          ...(phone ? { phone } : {}),
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed for getOrCreateUser:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const userRecords = await db.select().from(users).where(eq(users.uid, uid));
    return userRecords[0] || null;
  } catch (error) {
    console.error('Database query failed for getUserByUid:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function updateUserProfile(uid: string, updates: {
  name?: string;
  phone?: string;
  bloodGroup?: string;
  allergies?: string;
  address?: string;
  dateOfBirth?: string;
}) {
  try {
    const result = await db.update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.uid, uid))
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed for updateUserProfile:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
