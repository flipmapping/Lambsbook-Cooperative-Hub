import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const countries = pgTable("countries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  flag: text("flag"),
  isActive: boolean("is_active").default(true),
});

export const insertCountrySchema = createInsertSchema(countries).omit({ id: true });
export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type Country = typeof countries.$inferSelect;

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true),
});

export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role").notNull(),
  countryIds: text("country_ids").array(),
  serviceIds: text("service_ids").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMemberSchema = createInsertSchema(members).omit({ id: true, createdAt: true });
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

export const partners = pgTable("partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  countryIds: text("country_ids").array(),
  serviceIds: text("service_ids").array(),
  commissionRate: integer("commission_rate"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPartnerSchema = createInsertSchema(partners).omit({ id: true, createdAt: true });
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

export const enquiries = pgTable("enquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  inquiryType: text("inquiry_type").notNull(),
  message: text("message"),
  countryOfInterest: text("country_of_interest"),
  serviceOfInterest: text("service_of_interest"),
  source: text("source").default("website"),
  status: text("status").notNull().default("new"),
  priority: text("priority").default("normal"),
  leadScore: integer("lead_score"),
  assignedMemberId: text("assigned_member_id"),
  notes: text("notes"),
  clickupTaskId: text("clickup_task_id"),
  apolloContactId: text("apollo_contact_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEnquirySchema = createInsertSchema(enquiries).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEnquiry = z.infer<typeof insertEnquirySchema>;
export type Enquiry = typeof enquiries.$inferSelect;

export const followUps = pgTable("follow_ups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  enquiryId: text("enquiry_id").notNull(),
  memberId: text("member_id"),
  type: text("type").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFollowUpSchema = createInsertSchema(followUps).omit({ id: true, createdAt: true });
export type InsertFollowUp = z.infer<typeof insertFollowUpSchema>;
export type FollowUp = typeof followUps.$inferSelect;

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientId: text("recipient_id").notNull(),
  recipientType: text("recipient_type").notNull(),
  type: text("type").notNull(),
  channel: text("channel").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"),
  sentAt: timestamp("sent_at"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export const aiConversations = pgTable("ai_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  userMessage: text("user_message").notNull(),
  aiResponse: text("ai_response").notNull(),
  intent: text("intent"),
  sentiment: text("sentiment"),
  enquiryId: text("enquiry_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({ id: true, createdAt: true });
export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type AiConversation = typeof aiConversations.$inferSelect;

export const siteContent = pgTable("site_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  section: text("section").notNull(),
  content: jsonb("content").notNull(),
  isAutoUpdated: boolean("is_auto_updated").default(false),
  lastAiUpdate: timestamp("last_ai_update"),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: text("updated_by"),
});

export const insertSiteContentSchema = createInsertSchema(siteContent).omit({ id: true, updatedAt: true });
export type InsertSiteContent = z.infer<typeof insertSiteContentSchema>;
export type SiteContent = typeof siteContent.$inferSelect;

export const integrationConfigs = pgTable("integration_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  service: text("service").notNull().unique(),
  config: jsonb("config"),
  isEnabled: boolean("is_enabled").default(false),
  lastSyncAt: timestamp("last_sync_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertIntegrationConfigSchema = createInsertSchema(integrationConfigs).omit({ id: true, updatedAt: true });
export type InsertIntegrationConfig = z.infer<typeof insertIntegrationConfigSchema>;
export type IntegrationConfig = typeof integrationConfigs.$inferSelect;

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;

// ============================================
// Hub Partner & Revenue Sharing Schema
// ============================================

// Value chain roles for partners
export const valueChainRoles = [
  'supplier',
  'processor', 
  'packager',
  'distributor',
  'retailer',
  'tutor',
  'school',
  'platform',
  'collaborator',
  'referrer'
] as const;
export type ValueChainRole = typeof valueChainRoles[number];

// Revenue model types
export const revenueModelTypes = ['percentage', 'fixed_fee'] as const;
export type RevenueModelType = typeof revenueModelTypes[number];

// SBU types
export const sbuTypes = ['sbu1', 'sbu2', 'sbu3', 'sbu4', 'sbu5'] as const;
export type SBUType = typeof sbuTypes[number];

// Hub Partners - partners engaged with specific SBUs
export const hubPartners = pgTable("hub_partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  sbuId: text("sbu_id").notNull(), // sbu2, sbu4, etc.
  roles: text("roles").array().notNull(), // value chain roles
  capabilities: text("capabilities"), // description of what they provide
  status: text("status").notNull().default("pending"), // pending, approved, active, inactive
  bankDetails: jsonb("bank_details"), // for payments
  documents: text("documents").array(), // uploaded document URLs
  notes: text("notes"),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHubPartnerSchema = createInsertSchema(hubPartners).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  approvedAt: true 
});
export type InsertHubPartner = z.infer<typeof insertHubPartnerSchema>;
export type HubPartner = typeof hubPartners.$inferSelect;

// Hub Products - products/programs with revenue sharing
export const hubProducts = pgTable("hub_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sbuId: text("sbu_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  productType: text("product_type").notNull(), // 'product', 'program', 'service'
  wholesalePrice: integer("wholesale_price"), // in smallest currency unit
  retailPrice: integer("retail_price"),
  currency: text("currency").default("VND"),
  revenueModel: text("revenue_model").notNull().default("percentage"), // percentage or fixed_fee
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHubProductSchema = createInsertSchema(hubProducts).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertHubProduct = z.infer<typeof insertHubProductSchema>;
export type HubProduct = typeof hubProducts.$inferSelect;

// Partner Share Allocations - percentage/fee allocations per product
export const partnerShareAllocations = pgTable("partner_share_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: text("product_id").notNull(),
  partnerId: text("partner_id"), // null for platform/collaborator defaults
  role: text("role").notNull(), // value chain role
  shareType: text("share_type").notNull().default("percentage"), // percentage or fixed
  shareValue: integer("share_value").notNull(), // percentage (0-100) or fixed amount
  description: text("description"),
  isDefault: boolean("is_default").default(false), // template allocation
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPartnerShareAllocationSchema = createInsertSchema(partnerShareAllocations).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export type InsertPartnerShareAllocation = z.infer<typeof insertPartnerShareAllocationSchema>;
export type PartnerShareAllocation = typeof partnerShareAllocations.$inferSelect;

// Validation schema for share allocation with 100% validation
export const shareAllocationValidationSchema = z.object({
  productId: z.string().min(1),
  allocations: z.array(z.object({
    partnerId: z.string().nullable(),
    role: z.enum(valueChainRoles),
    shareType: z.enum(['percentage', 'fixed']),
    shareValue: z.number().min(0).max(100),
    description: z.string().optional(),
  })),
}).refine((data) => {
  const percentageAllocations = data.allocations.filter(a => a.shareType === 'percentage');
  const total = percentageAllocations.reduce((sum, a) => sum + a.shareValue, 0);
  return total === 100;
}, {
  message: "Percentage allocations must total exactly 100%",
});
