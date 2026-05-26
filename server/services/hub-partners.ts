import { 
  type HubPartner, type InsertHubPartner,
  type HubProduct, type InsertHubProduct,
  type PartnerShareAllocation, type InsertPartnerShareAllocation,
  valueChainRoles,
  type ValueChainRole
} from "@shared/schema";

// In-memory storage for prototype
const hubPartners: Map<string, HubPartner> = new Map();
const hubProducts: Map<string, HubProduct> = new Map();
const partnerShareAllocations: Map<string, PartnerShareAllocation> = new Map();

// Seed default SBU products
function initializeDefaultProducts() {
  const now = new Date();
  
  // SBU 2 - Education Programs
  const sbu2Programs: InsertHubProduct[] = [
    {
      sbuId: "sbu2",
      name: "Online Classes Subscription",
      description: "Monday-Friday online English classes",
      productType: "program",
      wholesalePrice: 0,
      retailPrice: 130000, // 130,000 VND or $5
      currency: "VND",
      revenueModel: "percentage",
      isActive: true,
    },
    {
      sbuId: "sbu2",
      name: "Vocational Training Program",
      description: "In-person vocational training with partner schools",
      productType: "program",
      wholesalePrice: 0,
      retailPrice: 5000000, // Example price
      currency: "VND",
      revenueModel: "percentage",
      isActive: true,
    },
    {
      sbuId: "sbu2",
      name: "Overseas Study Referral",
      description: "Referral fee for overseas study placement (Tropicana, etc.)",
      productType: "service",
      wholesalePrice: 0,
      retailPrice: 25000000, // ~$1,000 USD
      currency: "VND",
      revenueModel: "fixed_fee",
      isActive: true,
    },
  ];

  // SBU 4 - Agri Products
  const sbu4Products: InsertHubProduct[] = [
    {
      sbuId: "sbu4",
      name: "Deligac Noodles",
      description: "Gac fruit noodles - 12 noodle balls per pack",
      productType: "product",
      wholesalePrice: 40000, // 40,000 VND
      retailPrice: 100000, // 100,000 VND
      currency: "VND",
      revenueModel: "percentage",
      isActive: true,
    },
    {
      sbuId: "sbu4",
      name: "Gac Powder",
      description: "Dried gac fruit powder - health supplement",
      productType: "product",
      wholesalePrice: 150000,
      retailPrice: 300000,
      currency: "VND",
      revenueModel: "percentage",
      isActive: true,
    },
  ];

  [...sbu2Programs, ...sbu4Products].forEach((product, index) => {
    const id = `prod_${index + 1}`;
    hubProducts.set(id, {
      ...product,
      id,
      createdAt: now,
      updatedAt: now,
    } as HubProduct);
    
    // Add default share allocations for percentage-based products
    if (product.revenueModel === "percentage") {
      initializeDefaultAllocations(id, product.sbuId);
    }
  });
}

function initializeDefaultAllocations(productId: string, sbuId: string) {
  const now = new Date();
  
  // Default allocations based on business model
  const defaultAllocations = sbuId === "sbu4" 
    ? [
        { role: "collaborator", shareValue: 30, description: "Tier 1 + Tier 2 referrers" },
        { role: "distributor", shareValue: 20, description: "Distribution partners" },
        { role: "supplier", shareValue: 50, description: "Producer/farmer" },
      ]
    : [
        { role: "collaborator", shareValue: 15, description: "Tier 1 referrer" },
        { role: "referrer", shareValue: 15, description: "Tier 2 referrer" },
        { role: "school", shareValue: 10, description: "Partner school/institution" },
        { role: "platform", shareValue: 10, description: "Charity/platform reserve" },
        { role: "tutor", shareValue: 50, description: "Instructor/tutor" },
      ];
  
  defaultAllocations.forEach((alloc, index) => {
    const id = `alloc_${productId}_${index}`;
    partnerShareAllocations.set(id, {
      id,
      productId,
      partnerId: null,
      role: alloc.role as ValueChainRole,
      shareType: "percentage",
      shareValue: alloc.shareValue,
      description: alloc.description,
      isDefault: true,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  });
}

// Initialize on module load
initializeDefaultProducts();

// ============================================
// Hub Partners CRUD
// ============================================

export async function getHubPartners(sbuId?: string): Promise<HubPartner[]> {
  const all = Array.from(hubPartners.values());
  if (sbuId) {
    return all.filter(p => p.sbuId === sbuId);
  }
  return all;
}

export async function getHubPartner(id: string): Promise<HubPartner | undefined> {
  return hubPartners.get(id);
}

export async function createHubPartner(data: InsertHubPartner): Promise<HubPartner> {
  const id = `partner_${Date.now()}`;
  const now = new Date();
  const partner: HubPartner = {
    ...data,
    id,
    status: data.status || "pending",
    createdAt: now,
    updatedAt: now,
    approvedAt: null,
  } as HubPartner;
  
  hubPartners.set(id, partner);
  return partner;
}

export async function updateHubPartner(id: string, updates: Partial<InsertHubPartner>): Promise<HubPartner | undefined> {
  const existing = hubPartners.get(id);
  if (!existing) return undefined;
  
  const updated: HubPartner = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };
  
  // If approving, set approvedAt
  if (updates.status === "approved" || updates.status === "active") {
    updated.approvedAt = new Date();
  }
  
  hubPartners.set(id, updated);
  return updated;
}

export async function deleteHubPartner(id: string): Promise<boolean> {
  return hubPartners.delete(id);
}

// ============================================
// Hub Products CRUD
// ============================================

export async function getHubProducts(sbuId?: string): Promise<HubProduct[]> {
  const all = Array.from(hubProducts.values());
  if (sbuId) {
    return all.filter(p => p.sbuId === sbuId);
  }
  return all;
}

export async function getHubProduct(id: string): Promise<HubProduct | undefined> {
  return hubProducts.get(id);
}

export async function createHubProduct(data: InsertHubProduct): Promise<HubProduct> {
  const id = `prod_${Date.now()}`;
  const now = new Date();
  const product: HubProduct = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  } as HubProduct;
  
  hubProducts.set(id, product);
  
  // Initialize default allocations
  if (data.revenueModel === "percentage") {
    initializeDefaultAllocations(id, data.sbuId);
  }
  
  return product;
}

export async function updateHubProduct(id: string, updates: Partial<InsertHubProduct>): Promise<HubProduct | undefined> {
  const existing = hubProducts.get(id);
  if (!existing) return undefined;
  
  const updated: HubProduct = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };
  
  hubProducts.set(id, updated);
  return updated;
}

// ============================================
// Partner Share Allocations
// ============================================

export async function getShareAllocations(productId: string): Promise<PartnerShareAllocation[]> {
  return Array.from(partnerShareAllocations.values()).filter(a => a.productId === productId);
}

export async function getProductWithAllocations(productId: string): Promise<{
  product: HubProduct;
  allocations: PartnerShareAllocation[];
  totalPercentage: number;
} | undefined> {
  const product = hubProducts.get(productId);
  if (!product) return undefined;
  
  const allocations = await getShareAllocations(productId);
  const totalPercentage = allocations
    .filter(a => a.shareType === "percentage" && a.isActive)
    .reduce((sum, a) => sum + a.shareValue, 0);
  
  return { product, allocations, totalPercentage };
}

export async function updateShareAllocations(
  productId: string, 
  allocations: Array<{
    id?: string;
    partnerId?: string | null;
    role: string;
    shareType: string;
    shareValue: number;
    description?: string;
  }>
): Promise<{ success: boolean; error?: string; allocations?: PartnerShareAllocation[] }> {
  // Validate no negative values
  const hasNegative = allocations.some(a => a.shareValue < 0);
  if (hasNegative) {
    return { 
      success: false, 
      error: "Allocation values cannot be negative" 
    };
  }
  
  // Validate no values over 100
  const hasOver100 = allocations.some(a => a.shareType === "percentage" && a.shareValue > 100);
  if (hasOver100) {
    return { 
      success: false, 
      error: "Percentage values cannot exceed 100%" 
    };
  }
  
  // Validate total percentage equals 100%
  const percentageAllocations = allocations.filter(a => a.shareType === "percentage");
  const total = percentageAllocations.reduce((sum, a) => sum + a.shareValue, 0);
  
  if (total !== 100) {
    return { 
      success: false, 
      error: `Percentage allocations must total 100% (currently ${total}%)` 
    };
  }
  
  // Clear existing allocations for this product
  Array.from(partnerShareAllocations.entries()).forEach(([id, alloc]) => {
    if (alloc.productId === productId) {
      partnerShareAllocations.delete(id);
    }
  });
  
  // Add new allocations
  const now = new Date();
  const newAllocations: PartnerShareAllocation[] = [];
  
  allocations.forEach((alloc, index) => {
    const id = alloc.id || `alloc_${productId}_${index}_${Date.now()}`;
    const newAlloc: PartnerShareAllocation = {
      id,
      productId,
      partnerId: alloc.partnerId || null,
      role: alloc.role as ValueChainRole,
      shareType: alloc.shareType,
      shareValue: alloc.shareValue,
      description: alloc.description || null,
      isDefault: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    
    partnerShareAllocations.set(id, newAlloc);
    newAllocations.push(newAlloc);
  });
  
  return { success: true, allocations: newAllocations };
}

// ============================================
// Value Chain Summary
// ============================================

export async function getValueChainSummary(sbuId: string): Promise<{
  products: Array<{
    product: HubProduct;
    allocations: PartnerShareAllocation[];
    totalPercentage: number;
    partners: HubPartner[];
  }>;
  partners: HubPartner[];
}> {
  const products = await getHubProducts(sbuId);
  const partners = await getHubPartners(sbuId);
  
  const productDetails = await Promise.all(products.map(async (product) => {
    const allocations = await getShareAllocations(product.id);
    const totalPercentage = allocations
      .filter(a => a.shareType === "percentage" && a.isActive)
      .reduce((sum, a) => sum + a.shareValue, 0);
    
    // Get partners assigned to this product's allocations
    const assignedPartnerIds = allocations
      .filter(a => a.partnerId)
      .map(a => a.partnerId!);
    const assignedPartners = partners.filter(p => assignedPartnerIds.includes(p.id));
    
    return {
      product,
      allocations,
      totalPercentage,
      partners: assignedPartners,
    };
  }));
  
  return { products: productDetails, partners };
}

// Export value chain roles for frontend
export function getValueChainRoles(): typeof valueChainRoles {
  return valueChainRoles;
}
