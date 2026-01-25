import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertEnquirySchema, 
  insertMemberSchema, 
  insertPartnerSchema,
  insertCountrySchema,
  insertServiceSchema,
  insertFollowUpSchema,
  insertSiteContentSchema,
  insertIntegrationConfigSchema,
} from "@shared/schema";
import { z } from "zod";
import { generateAIResponse, generateLeadScore } from "./services/ai";
import { notifyNewEnquiry } from "./services/notifications";
import { createClickUpTask, createApolloContact, integrationGuides } from "./services/integrations";
import { 
  sendMagicLink, 
  sendEmailOTP, 
  verifyEmailOTP, 
  signUpWithPassword,
  signInWithPassword,
  signOut,
  resetPassword,
  getUser,
} from "./services/supabase-auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/enquiries", async (req: Request, res: Response) => {
    try {
      const { status, assignedMemberId } = req.query;
      const filters: { status?: string; assignedMemberId?: string } = {};
      if (status) filters.status = status as string;
      if (assignedMemberId) filters.assignedMemberId = assignedMemberId as string;
      
      const enquiriesList = await storage.getEnquiries(filters);
      res.json(enquiriesList);
    } catch (error) {
      console.error('Enquiries error:', error);
      res.status(500).json({ error: "Failed to fetch enquiries" });
    }
  });

  app.get("/api/enquiries/:id", async (req: Request, res: Response) => {
    try {
      const enquiry = await storage.getEnquiry(req.params.id);
      if (!enquiry) {
        return res.status(404).json({ error: "Enquiry not found" });
      }
      res.json(enquiry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch enquiry" });
    }
  });

  app.post("/api/enquiries", async (req: Request, res: Response) => {
    try {
      const data = insertEnquirySchema.parse(req.body);
      
      const leadScore = await generateLeadScore({
        inquiryType: data.inquiryType,
        message: data.message ?? undefined,
        countryOfInterest: data.countryOfInterest ?? undefined,
      });
      
      const enquiry = await storage.createEnquiry({
        ...data,
        leadScore,
      });
      
      await storage.createActivityLog({
        action: "created",
        entityType: "enquiry",
        entityId: enquiry.id,
        details: { name: enquiry.name, email: enquiry.email },
      });
      
      notifyNewEnquiry(enquiry.id, {
        name: enquiry.name,
        email: enquiry.email,
        inquiryType: enquiry.inquiryType,
        countryOfInterest: enquiry.countryOfInterest || undefined,
      }).catch(err => console.error('Notification error:', err));
      
      createClickUpTask(enquiry.id, {
        name: enquiry.name,
        email: enquiry.email,
        inquiryType: enquiry.inquiryType,
        message: enquiry.message || undefined,
        countryOfInterest: enquiry.countryOfInterest || undefined,
      }).catch(err => console.error('ClickUp error:', err));
      
      createApolloContact(enquiry.id, {
        name: enquiry.name,
        email: enquiry.email,
        phone: enquiry.phone || undefined,
      }).catch(err => console.error('Apollo error:', err));
      
      res.status(201).json(enquiry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create enquiry" });
    }
  });

  app.patch("/api/enquiries/:id", async (req: Request, res: Response) => {
    try {
      const enquiry = await storage.updateEnquiry(req.params.id, req.body);
      if (!enquiry) {
        return res.status(404).json({ error: "Enquiry not found" });
      }
      
      await storage.createActivityLog({
        action: "updated",
        entityType: "enquiry",
        entityId: enquiry.id,
        details: req.body,
      });
      
      res.json(enquiry);
    } catch (error) {
      res.status(500).json({ error: "Failed to update enquiry" });
    }
  });

  app.get("/api/members", async (req: Request, res: Response) => {
    try {
      const membersList = await storage.getMembers();
      res.json(membersList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  app.get("/api/members/:id", async (req: Request, res: Response) => {
    try {
      const member = await storage.getMember(req.params.id);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch member" });
    }
  });

  app.post("/api/members", async (req: Request, res: Response) => {
    try {
      const data = insertMemberSchema.parse(req.body);
      const member = await storage.createMember(data);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create member" });
    }
  });

  app.patch("/api/members/:id", async (req: Request, res: Response) => {
    try {
      const member = await storage.updateMember(req.params.id, req.body);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to update member" });
    }
  });

  app.get("/api/partners", async (req: Request, res: Response) => {
    try {
      const partnersList = await storage.getPartners();
      res.json(partnersList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch partners" });
    }
  });

  app.get("/api/partners/:id", async (req: Request, res: Response) => {
    try {
      const partner = await storage.getPartner(req.params.id);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      res.json(partner);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch partner" });
    }
  });

  app.post("/api/partners", async (req: Request, res: Response) => {
    try {
      const data = insertPartnerSchema.parse(req.body);
      const partner = await storage.createPartner(data);
      res.status(201).json(partner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create partner" });
    }
  });

  app.patch("/api/partners/:id", async (req: Request, res: Response) => {
    try {
      const partner = await storage.updatePartner(req.params.id, req.body);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      res.json(partner);
    } catch (error) {
      res.status(500).json({ error: "Failed to update partner" });
    }
  });

  app.get("/api/countries", async (req: Request, res: Response) => {
    try {
      const countriesList = await storage.getCountries();
      res.json(countriesList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch countries" });
    }
  });

  app.post("/api/countries", async (req: Request, res: Response) => {
    try {
      const data = insertCountrySchema.parse(req.body);
      const country = await storage.createCountry(data);
      res.status(201).json(country);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create country" });
    }
  });

  app.get("/api/services", async (req: Request, res: Response) => {
    try {
      const servicesList = await storage.getServices();
      res.json(servicesList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.post("/api/services", async (req: Request, res: Response) => {
    try {
      const data = insertServiceSchema.parse(req.body);
      const service = await storage.createService(data);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  app.get("/api/follow-ups", async (req: Request, res: Response) => {
    try {
      const { enquiryId } = req.query;
      const followUpsList = await storage.getFollowUps(enquiryId as string | undefined);
      res.json(followUpsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch follow-ups" });
    }
  });

  app.post("/api/follow-ups", async (req: Request, res: Response) => {
    try {
      const data = insertFollowUpSchema.parse(req.body);
      const followUp = await storage.createFollowUp(data);
      res.status(201).json(followUp);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create follow-up" });
    }
  });

  app.patch("/api/follow-ups/:id", async (req: Request, res: Response) => {
    try {
      const followUp = await storage.updateFollowUp(req.params.id, req.body);
      if (!followUp) {
        return res.status(404).json({ error: "Follow-up not found" });
      }
      res.json(followUp);
    } catch (error) {
      res.status(500).json({ error: "Failed to update follow-up" });
    }
  });

  app.get("/api/notifications", async (req: Request, res: Response) => {
    try {
      const { recipientId } = req.query;
      const notificationsList = await storage.getNotifications(recipientId as string | undefined);
      res.json(notificationsList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.get("/api/site-content", async (req: Request, res: Response) => {
    try {
      const { section } = req.query;
      const contentList = await storage.getSiteContent(section as string | undefined);
      res.json(contentList);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch site content" });
    }
  });

  app.get("/api/site-content/:key", async (req: Request, res: Response) => {
    try {
      const content = await storage.getSiteContentByKey(req.params.key);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch site content" });
    }
  });

  app.put("/api/site-content", async (req: Request, res: Response) => {
    try {
      const data = insertSiteContentSchema.parse(req.body);
      const content = await storage.upsertSiteContent(data);
      res.json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to save site content" });
    }
  });

  app.get("/api/integrations", async (req: Request, res: Response) => {
    try {
      const configs = await storage.getIntegrationConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch integration configs" });
    }
  });

  app.get("/api/integrations/:service", async (req: Request, res: Response) => {
    try {
      const config = await storage.getIntegrationConfig(req.params.service);
      if (!config) {
        return res.status(404).json({ error: "Integration config not found" });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch integration config" });
    }
  });

  app.put("/api/integrations", async (req: Request, res: Response) => {
    try {
      const data = insertIntegrationConfigSchema.parse(req.body);
      const config = await storage.upsertIntegrationConfig(data);
      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to save integration config" });
    }
  });

  app.get("/api/activity-logs", async (req: Request, res: Response) => {
    try {
      const { entityType, entityId } = req.query;
      const logs = await storage.getActivityLogs(
        entityType as string | undefined,
        entityId as string | undefined
      );
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activity logs" });
    }
  });

  app.post("/api/seed-data", async (req: Request, res: Response) => {
    try {
      const existingCountries = await storage.getCountries();
      if (existingCountries.length === 0) {
        const defaultCountries = [
          { code: "USA", name: "United States", flag: "us" },
          { code: "CAN", name: "Canada", flag: "ca" },
          { code: "GBR", name: "United Kingdom", flag: "gb" },
          { code: "AUS", name: "Australia", flag: "au" },
          { code: "VNM", name: "Vietnam", flag: "vn" },
          { code: "MYS", name: "Malaysia", flag: "my" },
          { code: "TWN", name: "Taiwan", flag: "tw" },
          { code: "CHN", name: "China", flag: "cn" },
        ];
        
        for (const country of defaultCountries) {
          await storage.createCountry(country);
        }
      }

      const existingServices = await storage.getServices();
      if (existingServices.length === 0) {
        const defaultServices = [
          { code: "EB3A", name: "EB-3A Professionals", category: "work_visa", description: "For professionals with bachelor's degree" },
          { code: "EB3B", name: "EB-3B Skilled Workers", category: "work_visa", description: "For skilled workers with 2+ years experience" },
          { code: "EB3C", name: "EB-3C Other Workers", category: "work_visa", description: "For unskilled workers" },
          { code: "STUDY", name: "Study Abroad", category: "education", description: "University admission and student visa support" },
          { code: "SCHOLAR", name: "Scholarship Applications", category: "education", description: "Help securing financial aid" },
          { code: "TOURIST", name: "Tourist Visa", category: "visa", description: "Tourist and travel visa processing" },
          { code: "BUSINESS", name: "Business Visa", category: "visa", description: "Business visa processing" },
          { code: "JOB", name: "Job Placement", category: "employment", description: "Connect with employers" },
        ];
        
        for (const service of defaultServices) {
          await storage.createService(service);
        }
      }
      
      res.json({ success: true, message: "Seed data created successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to seed data" });
    }
  });

  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    try {
      const { message, conversationHistory, sessionId } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }
      
      const result = await generateAIResponse(message, conversationHistory || []);
      
      if (sessionId) {
        await storage.createAIChatLog({
          sessionId,
          userMessage: message,
          aiResponse: result.response,
          intent: result.intent,
          sentiment: result.sentiment,
        });
      }
      
      res.json(result);
    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  app.get("/api/ai/chat-logs", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.query;
      const logs = await storage.getAIChatLogs(sessionId as string | undefined);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat logs" });
    }
  });

  app.get("/api/integration-guides", async (req: Request, res: Response) => {
    res.json(integrationGuides);
  });

  // ============================================================
  // AUTHENTICATION ROUTES (Supabase Auth with Email 2FA)
  // ============================================================

  // Send magic link for passwordless login
  app.post("/api/auth/magic-link", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: "Email is required" });
      }
      const result = await sendMagicLink(email);
      res.json(result);
    } catch (error) {
      console.error('Magic link error:', error);
      res.status(500).json({ error: "Failed to send magic link" });
    }
  });

  // Send email OTP for 2FA
  app.post("/api/auth/send-otp", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: "Email is required" });
      }
      const result = await sendEmailOTP(email);
      res.json(result);
    } catch (error) {
      console.error('Send OTP error:', error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // Verify email OTP
  app.post("/api/auth/verify-otp", async (req: Request, res: Response) => {
    try {
      const { email, token } = req.body;
      if (!email || !token) {
        return res.status(400).json({ error: "Email and token are required" });
      }
      const result = await verifyEmailOTP(email, token);
      res.json(result);
    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  // Sign up with email and password
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, fullName, role } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const result = await signUpWithPassword(email, password, { 
        full_name: fullName,
        role: role || 'member',
      });
      res.json(result);
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: "Failed to sign up" });
    }
  });

  // Sign in with email and password
  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const result = await signInWithPassword(email, password);
      res.json(result);
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ error: "Failed to sign in" });
    }
  });

  // Sign out
  app.post("/api/auth/signout", async (req: Request, res: Response) => {
    try {
      const result = await signOut();
      res.json(result);
    } catch (error) {
      console.error('Signout error:', error);
      res.status(500).json({ error: "Failed to sign out" });
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const result = await resetPassword(email);
      res.json(result);
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Get current user (requires auth token)
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "No authorization token provided" });
      }
      const token = authHeader.split(' ')[1];
      const result = await getUser(token);
      res.json(result);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // ========================================
  // Lambsbook Agentic Hub API Routes (Supabase)
  // Note: These routes use a separate Supabase database for the Hub system
  // which is distinct from the local PostgreSQL used for enquiries/members.
  // ========================================
  
  const hubService = await import('./services/supabase-hub');

  // SBUs
  app.get("/api/hub/sbus", async (req: Request, res: Response) => {
    try {
      const sbus = await hubService.getSBUs();
      res.json(sbus);
    } catch (error) {
      console.error('SBUs error:', error);
      res.status(500).json({ error: "Failed to fetch SBUs" });
    }
  });

  app.patch("/api/hub/sbus/:id", async (req: Request, res: Response) => {
    try {
      const validatedData = hubService.updateSBUSchema.parse(req.body);
      const sbu = await hubService.updateSBU(req.params.id, validatedData);
      res.json(sbu);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Update SBU error:', error);
      res.status(500).json({ error: "Failed to update SBU" });
    }
  });

  // Programs
  app.get("/api/hub/programs", async (req: Request, res: Response) => {
    try {
      const programs = await hubService.getPrograms();
      res.json(programs);
    } catch (error) {
      console.error('Programs error:', error);
      res.status(500).json({ error: "Failed to fetch programs" });
    }
  });

  app.post("/api/hub/programs", async (req: Request, res: Response) => {
    try {
      const validatedData = hubService.insertProgramSchema.parse(req.body);
      const program = await hubService.createProgram(validatedData);
      res.status(201).json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Create program error:', error);
      res.status(500).json({ error: "Failed to create program" });
    }
  });

  app.patch("/api/hub/programs/:id", async (req: Request, res: Response) => {
    try {
      const validatedData = hubService.updateProgramSchema.parse(req.body);
      const program = await hubService.updateProgram(req.params.id, validatedData);
      res.json(program);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Update program error:', error);
      res.status(500).json({ error: "Failed to update program" });
    }
  });

  // Commission Rule Sets
  app.get("/api/hub/commission-rule-sets", async (req: Request, res: Response) => {
    try {
      const ruleSets = await hubService.getCommissionRuleSets();
      res.json(ruleSets);
    } catch (error) {
      console.error('Commission rule sets error:', error);
      res.status(500).json({ error: "Failed to fetch commission rule sets" });
    }
  });

  app.post("/api/hub/commission-rule-sets", async (req: Request, res: Response) => {
    try {
      const validatedData = hubService.insertCommissionRuleSetSchema.parse(req.body);
      const ruleSet = await hubService.createCommissionRuleSet(validatedData);
      res.status(201).json(ruleSet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Create commission rule set error:', error);
      res.status(500).json({ error: "Failed to create commission rule set" });
    }
  });

  // Commission Rules
  app.post("/api/hub/commission-rules", async (req: Request, res: Response) => {
    try {
      const validatedData = hubService.insertCommissionRuleSchema.parse(req.body);
      const rule = await hubService.createCommissionRule(validatedData);
      res.status(201).json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Create commission rule error:', error);
      res.status(500).json({ error: "Failed to create commission rule" });
    }
  });

  app.delete("/api/hub/commission-rules/:id", async (req: Request, res: Response) => {
    try {
      const idSchema = z.string().uuid();
      idSchema.parse(req.params.id);
      await hubService.deleteCommissionRule(req.params.id);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid rule ID" });
      }
      console.error('Delete commission rule error:', error);
      res.status(500).json({ error: "Failed to delete commission rule" });
    }
  });

  // Hub Members
  app.get("/api/hub/members", async (req: Request, res: Response) => {
    try {
      const members = await hubService.getHubMembers();
      res.json(members);
    } catch (error) {
      console.error('Hub members error:', error);
      res.status(500).json({ error: "Failed to fetch hub members" });
    }
  });

  // Transactions
  app.get("/api/hub/transactions", async (req: Request, res: Response) => {
    try {
      const transactions = await hubService.getTransactions();
      res.json(transactions);
    } catch (error) {
      console.error('Transactions error:', error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Earnings
  app.get("/api/hub/earnings", async (req: Request, res: Response) => {
    try {
      const earnings = await hubService.getEarnings();
      res.json(earnings);
    } catch (error) {
      console.error('Earnings error:', error);
      res.status(500).json({ error: "Failed to fetch earnings" });
    }
  });

  // ========================================
  // Hub Authentication Routes
  // ========================================

  const hubAuthSchema = z.object({
    email: z.string().email(),
    fullName: z.string().min(1).max(255).optional(),
    username: z.string().regex(/^[a-zA-Z0-9_-]{3,50}$/, 'Username must be 3-50 characters: letters, numbers, underscores, hyphens').optional(),
    phone: z.string().regex(/^\+?[0-9]{7,15}$/, 'Phone must be 7-15 digits with optional + prefix').optional(),
    referrerEmail: z.string().email().optional().or(z.literal('')),
  });

  app.post("/api/hub/auth/signup", async (req: Request, res: Response) => {
    try {
      // Clean up empty referrerEmail
      const body = { ...req.body };
      if (body.referrerEmail === '') {
        delete body.referrerEmail;
      }
      
      const validatedData = hubAuthSchema.parse(body);
      const result = await hubService.signUpMember(validatedData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Hub signup validation error:', error.errors);
        return res.status(400).json({ error: error.errors });
      }
      // Handle HubAuthError with proper status code
      if (error && typeof error === 'object' && 'name' in error && error.name === 'HubAuthError') {
        const hubError = error as unknown as { message: string; statusCode: number };
        return res.status(hubError.statusCode).json({ error: hubError.message });
      }
      console.error('Hub signup error:', error);
      res.status(500).json({ error: "Failed to send magic link" });
    }
  });
  
  // Link referrer to member after successful authentication
  app.post("/api/hub/auth/link-referrer", async (req: Request, res: Response) => {
    try {
      const { memberEmail, referrerEmail } = req.body;
      
      if (!memberEmail || !referrerEmail) {
        return res.status(400).json({ error: "Both memberEmail and referrerEmail are required" });
      }
      
      const result = await hubService.linkReferrer(memberEmail, referrerEmail);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error('Link referrer error:', error);
      res.status(500).json({ error: "Failed to link referrer" });
    }
  });
  
  // Validate referrer email exists
  app.get("/api/hub/auth/validate-referrer", async (req: Request, res: Response) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      const member = await hubService.getMemberByEmail(email);
      res.json({ valid: !!member, member: member ? { email: member.email, name: member.full_name } : null });
    } catch (error) {
      console.error('Validate referrer error:', error);
      res.status(500).json({ error: "Failed to validate referrer" });
    }
  });

  app.post("/api/hub/auth/login", async (req: Request, res: Response) => {
    try {
      const validatedData = hubAuthSchema.parse(req.body);
      const result = await hubService.loginMember(validatedData.email);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Hub login validation error:', error.errors);
        return res.status(400).json({ error: error.errors });
      }
      // Handle HubAuthError with proper status code
      if (error && typeof error === 'object' && 'name' in error && error.name === 'HubAuthError') {
        const hubError = error as unknown as { message: string; statusCode: number };
        return res.status(hubError.statusCode).json({ error: hubError.message });
      }
      console.error('Hub login error:', error);
      res.status(500).json({ error: "Failed to send magic link" });
    }
  });

  app.post("/api/hub/auth/logout", async (req: Request, res: Response) => {
    try {
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to logout" });
    }
  });

  // Member self-service endpoints
  app.get("/api/hub/member/me", async (req: Request, res: Response) => {
    try {
      // For now, return demo data - in production this would check session
      res.json({
        id: "demo",
        email: "demo@example.com",
        full_name: "Demo User",
        referral_code: "DEMO123",
        roles: ["user", "collaborator"],
        total_earnings: 1250.00,
        pending_earnings: 350.00,
        referral_count: 8,
        programs_enrolled: 3,
      });
    } catch (error) {
      console.error('Get member error:', error);
      res.status(500).json({ error: "Failed to get member data" });
    }
  });

  app.get("/api/hub/member/earnings", async (req: Request, res: Response) => {
    try {
      // Demo earnings data
      res.json([
        { id: "1", amount: 150, currency: "USD", program_name: "Tropicana English", type: "tier1_referral", status: "paid", created_at: "2025-12-15" },
        { id: "2", amount: 75, currency: "USD", program_name: "CTBC Course", type: "tier2_referral", status: "paid", created_at: "2025-12-10" },
        { id: "3", amount: 200, currency: "USD", program_name: "EB-3 Visa Service", type: "tier1_referral", status: "pending", created_at: "2025-12-18" },
      ]);
    } catch (error) {
      console.error('Get earnings error:', error);
      res.status(500).json({ error: "Failed to get earnings" });
    }
  });

  app.get("/api/hub/member/referrals", async (req: Request, res: Response) => {
    try {
      // Demo referrals data
      res.json([
        { id: "1", name: "John Smith", email: "j***@example.com", tier: 1, status: "active", joined_at: "2025-11-20" },
        { id: "2", name: "Maria Garcia", email: "m***@example.com", tier: 1, status: "active", joined_at: "2025-11-25" },
        { id: "3", name: "David Lee", email: "d***@example.com", tier: 2, status: "active", joined_at: "2025-12-01" },
      ]);
    } catch (error) {
      console.error('Get referrals error:', error);
      res.status(500).json({ error: "Failed to get referrals" });
    }
  });

  // ========================================
  // Hub Partner & Revenue Sharing Routes
  // ========================================

  const hubPartnerService = await import('./services/hub-partners');

  // Get all hub partners (optionally filter by SBU)
  app.get("/api/hub/partners", async (req: Request, res: Response) => {
    try {
      const sbuId = req.query.sbuId as string | undefined;
      const partners = await hubPartnerService.getHubPartners(sbuId);
      res.json(partners);
    } catch (error) {
      console.error('Get hub partners error:', error);
      res.status(500).json({ error: "Failed to get partners" });
    }
  });

  // Create a new hub partner (onboarding)
  app.post("/api/hub/partners", async (req: Request, res: Response) => {
    try {
      const { sbuId, roles, company, name, email, phone, capabilities, notes } = req.body;
      
      // Basic validation
      if (!sbuId || !name || !email) {
        return res.status(400).json({ error: "Missing required fields: sbuId, name, and email are required" });
      }
      
      if (!roles || !Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({ error: "At least one role is required" });
      }
      
      const partner = await hubPartnerService.createHubPartner({
        sbuId,
        roles,
        company: company || name, // Use name as company if not provided
        name,
        email,
        phone: phone || null,
        capabilities: capabilities || null,
        notes: notes || null,
        status: "pending",
      });
      res.status(201).json(partner);
    } catch (error) {
      console.error('Create hub partner error:', error);
      res.status(500).json({ error: "Failed to create partner" });
    }
  });

  // Update a hub partner
  app.patch("/api/hub/partners/:id", async (req: Request, res: Response) => {
    try {
      const partner = await hubPartnerService.updateHubPartner(req.params.id, req.body);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      res.json(partner);
    } catch (error) {
      console.error('Update hub partner error:', error);
      res.status(500).json({ error: "Failed to update partner" });
    }
  });

  // Get all hub products (optionally filter by SBU)
  app.get("/api/hub/products", async (req: Request, res: Response) => {
    try {
      const sbuId = req.query.sbuId as string | undefined;
      const products = await hubPartnerService.getHubProducts(sbuId);
      res.json(products);
    } catch (error) {
      console.error('Get hub products error:', error);
      res.status(500).json({ error: "Failed to get products" });
    }
  });

  // Get a product with its share allocations
  app.get("/api/hub/products/:id/allocations", async (req: Request, res: Response) => {
    try {
      const result = await hubPartnerService.getProductWithAllocations(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(result);
    } catch (error) {
      console.error('Get product allocations error:', error);
      res.status(500).json({ error: "Failed to get product allocations" });
    }
  });

  // Update share allocations for a product (with 100% validation)
  app.put("/api/hub/products/:id/allocations", async (req: Request, res: Response) => {
    try {
      const result = await hubPartnerService.updateShareAllocations(req.params.id, req.body.allocations);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      res.json(result);
    } catch (error) {
      console.error('Update share allocations error:', error);
      res.status(500).json({ error: "Failed to update share allocations" });
    }
  });

  // Get value chain summary for an SBU
  app.get("/api/hub/value-chain/:sbuId", async (req: Request, res: Response) => {
    try {
      const summary = await hubPartnerService.getValueChainSummary(req.params.sbuId);
      res.json(summary);
    } catch (error) {
      console.error('Get value chain error:', error);
      res.status(500).json({ error: "Failed to get value chain" });
    }
  });

  // Get available value chain roles
  app.get("/api/hub/value-chain-roles", async (req: Request, res: Response) => {
    try {
      const roles = hubPartnerService.getValueChainRoles();
      res.json(roles);
    } catch (error) {
      console.error('Get value chain roles error:', error);
      res.status(500).json({ error: "Failed to get value chain roles" });
    }
  });

  // ========================================
  // Education Feedback Agent Routes
  // ========================================

  const educationFeedbackService = await import('./services/education-feedback');

  // List all documents in the Master Templates folder
  app.get("/api/education/documents", async (req: Request, res: Response) => {
    try {
      const documents = await educationFeedbackService.listMasterTemplates();
      res.json(documents);
    } catch (error) {
      console.error('List documents error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to list documents" });
    }
  });

  // Get document preview with validation status
  app.get("/api/education/documents/:id/preview", async (req: Request, res: Response) => {
    try {
      const preview = await educationFeedbackService.getDocumentPreview(req.params.id);
      res.json(preview);
    } catch (error) {
      console.error('Document preview error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to get document preview" });
    }
  });

  // Generate feedback for a specific document
  app.post("/api/education/documents/:id/feedback", async (req: Request, res: Response) => {
    try {
      const result = await educationFeedbackService.generateFeedbackForDocument(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Generate feedback error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate feedback" });
    }
  });

  // Process all pending documents
  app.post("/api/education/process-all", async (req: Request, res: Response) => {
    try {
      const results = await educationFeedbackService.processAllPendingDocuments();
      res.json({
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      });
    } catch (error) {
      console.error('Process all documents error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to process documents" });
    }
  });

  // Check folder connection status
  app.get("/api/education/status", async (req: Request, res: Response) => {
    try {
      const folderId = await educationFeedbackService.findMasterTemplatesFolder();
      res.json({
        connected: !!folderId,
        folderId,
        folderName: 'Lambsbook – Master Templates'
      });
    } catch (error) {
      console.error('Check status error:', error);
      res.status(500).json({ 
        connected: false, 
        error: error instanceof Error ? error.message : "Failed to check folder status" 
      });
    }
  });

  // Generate feedback from transcript submission (MVP UI endpoint)
  // This route acts as a thin adapter to the Education Feedback Engine
  app.post("/api/education/generate-feedback", async (req: Request, res: Response) => {
    try {
      // Call the Education Feedback Engine service
      const result = await educationFeedbackService.generateFeedbackFromTranscript({
        task_prompt: req.body.task_prompt,
        transcript_text: req.body.transcript_text,
        youtube_url: req.body.youtube_url,
        assessment_framework: req.body.assessment_framework,
        skill_type: req.body.skill_type,
        speaking_part: req.body.speaking_part,
        current_level: req.body.current_level,
        target_level: req.body.target_level
      });

      // Return the result from the engine
      if (result.status === 'error') {
        return res.status(400).json(result);
      }
      
      res.json(result);

    } catch (error) {
      console.error('Generate feedback error:', error);
      res.status(500).json({ 
        status: "error", 
        error: error instanceof Error ? error.message : "Failed to generate feedback" 
      });
    }
  });

  return httpServer;
}
