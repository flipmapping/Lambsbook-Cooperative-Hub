import { desc, eq } from "drizzle-orm";
import { db } from "../db";
import { notificationTemplates, type InsertNotificationTemplate } from "@shared/schema";
import { getSupabaseAdmin } from "../lib/supabase-client";

// Bounded port of the reference storage methods. No startup writes or data repair.
export const adminDashboardStorage = {
  async getProspects() {
    const { data, error } = await getSupabaseAdmin()
      .schema("growth").from("prospects").select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Failed to fetch prospects");
    return data ?? [];
  },
  async getNotificationTemplates() {
    return db.select().from(notificationTemplates).orderBy(desc(notificationTemplates.updatedAt));
  },
  async getNotificationTemplate(id: string) {
    const [row] = await db.select().from(notificationTemplates).where(eq(notificationTemplates.id, id));
    return row;
  },
  async createNotificationTemplate(data: InsertNotificationTemplate, actorId: string) {
    const [row] = await db.insert(notificationTemplates)
      .values({ ...data, updatedBy: actorId }).returning();
    return row;
  },
  async updateNotificationTemplate(id: string, data: Partial<InsertNotificationTemplate>, actorId: string) {
    const [row] = await db.update(notificationTemplates)
      .set({ ...data, updatedAt: new Date(), updatedBy: actorId })
      .where(eq(notificationTemplates.id, id)).returning();
    return row;
  },
};
