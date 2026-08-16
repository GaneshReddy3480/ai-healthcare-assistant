import { db } from './index.ts';
import { reminders, reservations, searchLogs, medicines, pharmacies, inventory } from './schema.ts';
import { eq, desc } from 'drizzle-orm';

export async function getUserReminders(userId: string) {
  try {
    return await db.select().from(reminders).where(eq(reminders.userId, userId)).orderBy(desc(reminders.createdAt));
  } catch (error) {
    console.error('Failed to query reminders:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function insertReminder(data: {
  id: string;
  userId: string;
  medicineName: string;
  dosage: string;
  time: string;
  frequency: string;
  daysOfWeek?: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  isActive?: boolean;
}) {
  try {
    const result = await db.insert(reminders)
      .values({
        id: data.id,
        userId: data.userId,
        medicineName: data.medicineName,
        dosage: data.dosage,
        time: data.time,
        frequency: data.frequency,
        daysOfWeek: data.daysOfWeek,
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes,
        isActive: data.isActive !== undefined ? data.isActive : true,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to insert reminder:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function deleteReminderById(id: string, userId: string) {
  try {
    return await db.delete(reminders).where(eq(reminders.id, id)).returning();
  } catch (error) {
    console.error('Failed to delete reminder:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getUserReservations(userId: string) {
  try {
    return await db.select().from(reservations).where(eq(reservations.userId, userId)).orderBy(desc(reservations.createdAt));
  } catch (error) {
    console.error('Failed to query reservations:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function insertReservation(data: {
  id: string;
  userId: string;
  medicineId: string;
  pharmacyId: string;
  medicineName: string;
  pharmacyName: string;
  quantity: number;
  status: string;
  reservedAt: string;
  expiresAt: string;
  totalEstimatedCost: number;
  tokenCode: string;
  notes?: string;
}) {
  try {
    const result = await db.insert(reservations)
      .values(data)
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to insert reservation:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getSearchHistory(userId?: string) {
  try {
    if (userId) {
      return await db.select().from(searchLogs).where(eq(searchLogs.userId, userId)).orderBy(desc(searchLogs.createdAt));
    }
    return await db.select().from(searchLogs).orderBy(desc(searchLogs.createdAt)).limit(20);
  } catch (error) {
    console.error('Failed to query search history:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function insertSearchLog(data: {
  id: string;
  userId?: string;
  query: string;
  category: string;
  resultsCount: number;
  timestamp: string;
}) {
  try {
    const result = await db.insert(searchLogs)
      .values(data)
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to insert search log:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
