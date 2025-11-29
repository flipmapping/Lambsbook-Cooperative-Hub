import { 
  type User, type InsertUser, users,
  type Country, type InsertCountry, countries,
  type Service, type InsertService, services,
  type Member, type InsertMember, members,
  type Partner, type InsertPartner, partners,
  type Enquiry, type InsertEnquiry, enquiries,
  type FollowUp, type InsertFollowUp, followUps,
  type Notification, type InsertNotification, notifications,
  type AiConversation, type InsertAiConversation, aiConversations,
  type SiteContent, type InsertSiteContent, siteContent,
  type IntegrationConfig, type InsertIntegrationConfig, integrationConfigs,
  type ActivityLog, type InsertActivityLog, activityLogs,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getCountries(): Promise<Country[]>;
  createCountry(country: InsertCountry): Promise<Country>;
  updateCountry(id: string, country: Partial<InsertCountry>): Promise<Country | undefined>;

  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;

  getMembers(): Promise<Member[]>;
  getMember(id: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: string, member: Partial<InsertMember>): Promise<Member | undefined>;

  getPartners(): Promise<Partner[]>;
  getPartner(id: string): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: string, partner: Partial<InsertPartner>): Promise<Partner | undefined>;

  getEnquiries(filters?: { status?: string; assignedMemberId?: string }): Promise<Enquiry[]>;
  getEnquiry(id: string): Promise<Enquiry | undefined>;
  createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry>;
  updateEnquiry(id: string, enquiry: Partial<InsertEnquiry>): Promise<Enquiry | undefined>;

  getFollowUps(enquiryId?: string): Promise<FollowUp[]>;
  createFollowUp(followUp: InsertFollowUp): Promise<FollowUp>;
  updateFollowUp(id: string, followUp: Partial<InsertFollowUp>): Promise<FollowUp | undefined>;

  getNotifications(recipientId?: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: string, notification: Partial<InsertNotification>): Promise<Notification | undefined>;

  getAiConversations(sessionId?: string): Promise<AiConversation[]>;
  createAiConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  
  getAIChatLogs(sessionId?: string): Promise<AiConversation[]>;
  createAIChatLog(log: { sessionId: string; userMessage: string; aiResponse: string; intent?: string; sentiment?: string }): Promise<AiConversation>;

  getSiteContent(section?: string): Promise<SiteContent[]>;
  getSiteContentByKey(key: string): Promise<SiteContent | undefined>;
  upsertSiteContent(content: InsertSiteContent): Promise<SiteContent>;

  getIntegrationConfigs(): Promise<IntegrationConfig[]>;
  getIntegrationConfig(service: string): Promise<IntegrationConfig | undefined>;
  upsertIntegrationConfig(config: InsertIntegrationConfig): Promise<IntegrationConfig>;

  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(entityType?: string, entityId?: string): Promise<ActivityLog[]>;

  getDashboardStats(): Promise<{
    totalEnquiries: number;
    newEnquiries: number;
    inProgressEnquiries: number;
    convertedClients: number;
    totalMembers: number;
    totalPartners: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCountries(): Promise<Country[]> {
    return db.select().from(countries);
  }

  async createCountry(country: InsertCountry): Promise<Country> {
    const [created] = await db.insert(countries).values(country).returning();
    return created;
  }

  async updateCountry(id: string, country: Partial<InsertCountry>): Promise<Country | undefined> {
    const [updated] = await db.update(countries).set(country).where(eq(countries.id, id)).returning();
    return updated;
  }

  async getServices(): Promise<Service[]> {
    return db.select().from(services);
  }

  async createService(service: InsertService): Promise<Service> {
    const [created] = await db.insert(services).values(service).returning();
    return created;
  }

  async updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined> {
    const [updated] = await db.update(services).set(service).where(eq(services.id, id)).returning();
    return updated;
  }

  async getMembers(): Promise<Member[]> {
    return db.select().from(members).orderBy(desc(members.createdAt));
  }

  async getMember(id: string): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.id, id));
    return member;
  }

  async createMember(member: InsertMember): Promise<Member> {
    const [created] = await db.insert(members).values(member).returning();
    return created;
  }

  async updateMember(id: string, member: Partial<InsertMember>): Promise<Member | undefined> {
    const [updated] = await db.update(members).set(member).where(eq(members.id, id)).returning();
    return updated;
  }

  async getPartners(): Promise<Partner[]> {
    return db.select().from(partners).orderBy(desc(partners.createdAt));
  }

  async getPartner(id: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner;
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const [created] = await db.insert(partners).values(partner).returning();
    return created;
  }

  async updatePartner(id: string, partner: Partial<InsertPartner>): Promise<Partner | undefined> {
    const [updated] = await db.update(partners).set(partner).where(eq(partners.id, id)).returning();
    return updated;
  }

  async getEnquiries(filters?: { status?: string; assignedMemberId?: string }): Promise<Enquiry[]> {
    let query = db.select().from(enquiries);
    
    if (filters?.status && filters?.assignedMemberId) {
      return db.select().from(enquiries)
        .where(and(eq(enquiries.status, filters.status), eq(enquiries.assignedMemberId, filters.assignedMemberId)))
        .orderBy(desc(enquiries.createdAt));
    } else if (filters?.status) {
      return db.select().from(enquiries).where(eq(enquiries.status, filters.status)).orderBy(desc(enquiries.createdAt));
    } else if (filters?.assignedMemberId) {
      return db.select().from(enquiries).where(eq(enquiries.assignedMemberId, filters.assignedMemberId)).orderBy(desc(enquiries.createdAt));
    }
    
    return db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  }

  async getEnquiry(id: string): Promise<Enquiry | undefined> {
    const [enquiry] = await db.select().from(enquiries).where(eq(enquiries.id, id));
    return enquiry;
  }

  async createEnquiry(enquiry: InsertEnquiry): Promise<Enquiry> {
    const [created] = await db.insert(enquiries).values(enquiry).returning();
    return created;
  }

  async updateEnquiry(id: string, enquiry: Partial<InsertEnquiry>): Promise<Enquiry | undefined> {
    const [updated] = await db.update(enquiries).set({ ...enquiry, updatedAt: new Date() }).where(eq(enquiries.id, id)).returning();
    return updated;
  }

  async getFollowUps(enquiryId?: string): Promise<FollowUp[]> {
    if (enquiryId) {
      return db.select().from(followUps).where(eq(followUps.enquiryId, enquiryId)).orderBy(desc(followUps.createdAt));
    }
    return db.select().from(followUps).orderBy(desc(followUps.createdAt));
  }

  async createFollowUp(followUp: InsertFollowUp): Promise<FollowUp> {
    const [created] = await db.insert(followUps).values(followUp).returning();
    return created;
  }

  async updateFollowUp(id: string, followUp: Partial<InsertFollowUp>): Promise<FollowUp | undefined> {
    const [updated] = await db.update(followUps).set(followUp).where(eq(followUps.id, id)).returning();
    return updated;
  }

  async getNotifications(recipientId?: string): Promise<Notification[]> {
    if (recipientId) {
      return db.select().from(notifications).where(eq(notifications.recipientId, recipientId)).orderBy(desc(notifications.createdAt));
    }
    return db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async updateNotification(id: string, notification: Partial<InsertNotification>): Promise<Notification | undefined> {
    const [updated] = await db.update(notifications).set(notification).where(eq(notifications.id, id)).returning();
    return updated;
  }

  async getAiConversations(sessionId?: string): Promise<AiConversation[]> {
    if (sessionId) {
      return db.select().from(aiConversations).where(eq(aiConversations.sessionId, sessionId)).orderBy(desc(aiConversations.createdAt));
    }
    return db.select().from(aiConversations).orderBy(desc(aiConversations.createdAt));
  }

  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const [created] = await db.insert(aiConversations).values(conversation).returning();
    return created;
  }

  async getAIChatLogs(sessionId?: string): Promise<AiConversation[]> {
    return this.getAiConversations(sessionId);
  }

  async createAIChatLog(log: { sessionId: string; userMessage: string; aiResponse: string; intent?: string; sentiment?: string }): Promise<AiConversation> {
    return this.createAiConversation({
      sessionId: log.sessionId,
      userMessage: log.userMessage,
      aiResponse: log.aiResponse,
      intent: log.intent,
      sentiment: log.sentiment,
    });
  }

  async getSiteContent(section?: string): Promise<SiteContent[]> {
    if (section) {
      return db.select().from(siteContent).where(eq(siteContent.section, section));
    }
    return db.select().from(siteContent);
  }

  async getSiteContentByKey(key: string): Promise<SiteContent | undefined> {
    const [content] = await db.select().from(siteContent).where(eq(siteContent.key, key));
    return content;
  }

  async upsertSiteContent(content: InsertSiteContent): Promise<SiteContent> {
    const existing = await this.getSiteContentByKey(content.key);
    if (existing) {
      const [updated] = await db.update(siteContent)
        .set({ ...content, updatedAt: new Date() })
        .where(eq(siteContent.key, content.key))
        .returning();
      return updated;
    }
    const [created] = await db.insert(siteContent).values(content).returning();
    return created;
  }

  async getIntegrationConfigs(): Promise<IntegrationConfig[]> {
    return db.select().from(integrationConfigs);
  }

  async getIntegrationConfig(service: string): Promise<IntegrationConfig | undefined> {
    const [config] = await db.select().from(integrationConfigs).where(eq(integrationConfigs.service, service));
    return config;
  }

  async upsertIntegrationConfig(config: InsertIntegrationConfig): Promise<IntegrationConfig> {
    const existing = await this.getIntegrationConfig(config.service);
    if (existing) {
      const [updated] = await db.update(integrationConfigs)
        .set({ ...config, updatedAt: new Date() })
        .where(eq(integrationConfigs.service, config.service))
        .returning();
      return updated;
    }
    const [created] = await db.insert(integrationConfigs).values(config).returning();
    return created;
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [created] = await db.insert(activityLogs).values(log).returning();
    return created;
  }

  async getActivityLogs(entityType?: string, entityId?: string): Promise<ActivityLog[]> {
    if (entityType && entityId) {
      return db.select().from(activityLogs)
        .where(and(eq(activityLogs.entityType, entityType), eq(activityLogs.entityId, entityId)))
        .orderBy(desc(activityLogs.createdAt));
    } else if (entityType) {
      return db.select().from(activityLogs).where(eq(activityLogs.entityType, entityType)).orderBy(desc(activityLogs.createdAt));
    }
    return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(100);
  }

  async getDashboardStats(): Promise<{
    totalEnquiries: number;
    newEnquiries: number;
    inProgressEnquiries: number;
    convertedClients: number;
    totalMembers: number;
    totalPartners: number;
  }> {
    const allEnquiries = await db.select().from(enquiries);
    const allMembers = await db.select().from(members).where(eq(members.isActive, true));
    const allPartners = await db.select().from(partners).where(eq(partners.isActive, true));

    return {
      totalEnquiries: allEnquiries.length,
      newEnquiries: allEnquiries.filter((e: Enquiry) => e.status === 'new').length,
      inProgressEnquiries: allEnquiries.filter((e: Enquiry) => e.status === 'in_progress' || e.status === 'contacted').length,
      convertedClients: allEnquiries.filter((e: Enquiry) => e.status === 'converted').length,
      totalMembers: allMembers.length,
      totalPartners: allPartners.length,
    };
  }
}

export const storage = new DatabaseStorage();
