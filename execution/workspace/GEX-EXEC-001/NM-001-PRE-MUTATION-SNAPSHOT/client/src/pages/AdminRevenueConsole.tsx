import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit2, Save, X, AlertCircle, CheckCircle, Users, Package, PieChart } from "lucide-react";
import type { HubProduct, HubPartner, PartnerShareAllocation, ValueChainRole } from "@shared/schema";

interface ProductWithAllocations {
  product: HubProduct;
  allocations: PartnerShareAllocation[];
  totalPercentage: number;
}

interface ValueChainSummary {
  products: Array<{
    product: HubProduct;
    allocations: PartnerShareAllocation[];
    totalPercentage: number;
    partners: HubPartner[];
  }>;
  partners: HubPartner[];
}

const sbuOptions = [
  { id: "sbu2", name: "Education (SBU 2)" },
  { id: "sbu4", name: "Agri Products (SBU 4)" },
];

const roleLabels: Record<string, string> = {
  supplier: "Supplier/Producer",
  processor: "Processor",
  packager: "Packager",
  distributor: "Distributor",
  retailer: "Retailer",
  tutor: "Tutor/Instructor",
  school: "School/Institution",
  platform: "Platform/Charity",
  collaborator: "Tier 1 Referrer",
  referrer: "Tier 2 Referrer",
};

export default function AdminRevenueConsole() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedSbu, setSelectedSbu] = useState<string>("sbu2");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editedAllocations, setEditedAllocations] = useState<PartnerShareAllocation[]>([]);

  const { data: valueChain, isLoading } = useQuery<ValueChainSummary>({
    queryKey: ["/api/hub/value-chain", selectedSbu],
  });

  const { data: partners } = useQuery<HubPartner[]>({
    queryKey: ["/api/hub/partners", selectedSbu],
  });

  const { data: valueChainRoles } = useQuery<readonly string[]>({
    queryKey: ["/api/hub/value-chain-roles"],
  });

  const updateAllocationsMutation = useMutation({
    mutationFn: async ({ productId, allocations }: { productId: string; allocations: PartnerShareAllocation[] }) => {
      return await apiRequest("PUT", `/api/hub/products/${productId}/allocations`, { allocations });
    },
    onSuccess: () => {
      toast({
        title: "Allocations Updated",
        description: "Revenue share allocations have been saved successfully.",
      });
      setEditingProductId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/hub/value-chain", selectedSbu] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update allocations",
        variant: "destructive",
      });
    },
  });

  const updatePartnerMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/hub/partners/${id}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Partner Updated",
        description: "Partner status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hub/partners", selectedSbu] });
      queryClient.invalidateQueries({ queryKey: ["/api/hub/value-chain", selectedSbu] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update partner",
        variant: "destructive",
      });
    },
  });

  const startEditing = (product: { product: HubProduct; allocations: PartnerShareAllocation[] }) => {
    setEditingProductId(product.product.id);
    setEditedAllocations([...product.allocations]);
  };

  const cancelEditing = () => {
    setEditingProductId(null);
    setEditedAllocations([]);
  };

  const updateAllocationValue = (index: number, value: number) => {
    const updated = [...editedAllocations];
    updated[index] = { ...updated[index], shareValue: value };
    setEditedAllocations(updated);
  };

  const calculateTotal = (allocations: PartnerShareAllocation[]) => {
    return allocations
      .filter((a) => a.shareType === "percentage" && a.isActive)
      .reduce((sum, a) => sum + a.shareValue, 0);
  };

  const saveAllocations = () => {
    if (!editingProductId) return;
    const total = calculateTotal(editedAllocations);
    if (total !== 100) {
      toast({
        title: "Validation Error",
        description: `Percentages must total 100% (currently ${total}%)`,
        variant: "destructive",
      });
      return;
    }
    updateAllocationsMutation.mutate({ productId: editingProductId, allocations: editedAllocations });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "outline",
      active: "default",
      suspended: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")} data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Revenue Console</h1>
              <p className="text-sm text-muted-foreground">Manage partner share allocations</p>
            </div>
          </div>
          <Select value={selectedSbu} onValueChange={setSelectedSbu}>
            <SelectTrigger className="w-48" data-testid="select-sbu">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sbuOptions.map((sbu) => (
                <SelectItem key={sbu.id} value={sbu.id}>
                  {sbu.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products" data-testid="tab-products">
              <Package className="h-4 w-4 mr-2" />
              Products & Shares
            </TabsTrigger>
            <TabsTrigger value="partners" data-testid="tab-partners">
              <Users className="h-4 w-4 mr-2" />
              Partners
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : valueChain?.products && valueChain.products.length > 0 ? (
              valueChain.products.map((item) => {
                const isEditing = editingProductId === item.product.id;
                const allocations = isEditing ? editedAllocations : item.allocations;
                const total = calculateTotal(allocations);
                const isValid = total === 100;

                return (
                  <Card key={item.product.id} data-testid={`card-product-${item.product.id}`}>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {item.product.name}
                          <Badge variant="outline">{item.product.productType}</Badge>
                        </CardTitle>
                        <CardDescription>{item.product.description}</CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>
                            Retail: <strong>{item.product.retailPrice?.toLocaleString()} {item.product.currency}</strong>
                          </span>
                          {item.product.wholesalePrice ? (
                            <span>
                              Wholesale: <strong>{item.product.wholesalePrice.toLocaleString()} {item.product.currency}</strong>
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEditing}
                              data-testid="button-cancel-edit"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={saveAllocations}
                              disabled={!isValid || updateAllocationsMutation.isPending}
                              data-testid="button-save-allocations"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(item)}
                            data-testid="button-edit-allocations"
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium flex items-center gap-2">
                            <PieChart className="h-4 w-4" />
                            Revenue Share Allocation
                          </h4>
                          <div className="flex items-center gap-2">
                            {isValid ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {total}%
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                {total}% (must be 100%)
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-3">
                          {allocations.map((allocation, index) => (
                            <div
                              key={allocation.id || index}
                              className="flex items-center gap-4 p-3 border rounded-md bg-muted/30"
                              data-testid={`allocation-${allocation.role}`}
                            >
                              <div className="flex-1">
                                <p className="font-medium">{roleLabels[allocation.role] || allocation.role}</p>
                                {allocation.description && (
                                  <p className="text-sm text-muted-foreground">{allocation.description}</p>
                                )}
                              </div>
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={allocation.shareValue}
                                    onChange={(e) => updateAllocationValue(index, parseInt(e.target.value) || 0)}
                                    className="w-20 text-right"
                                    data-testid={`input-allocation-${allocation.role}`}
                                  />
                                  <span className="text-muted-foreground">%</span>
                                </div>
                              ) : (
                                <Badge variant="secondary" className="text-base px-3">
                                  {allocation.shareValue}%
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>

                        {item.partners.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <h5 className="text-sm font-medium text-muted-foreground mb-2">Assigned Partners</h5>
                            <div className="flex flex-wrap gap-2">
                              {item.partners.map((partner) => (
                                <Badge key={partner.id} variant="outline">
                                  {partner.company || partner.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No products found for this business unit.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Partner Applications
                </CardTitle>
                <CardDescription>Manage partner onboarding and status</CardDescription>
              </CardHeader>
              <CardContent>
                {partners && partners.length > 0 ? (
                  <div className="space-y-3">
                    {partners.map((partner) => (
                      <div
                        key={partner.id}
                        className="flex items-center justify-between p-4 border rounded-md"
                        data-testid={`partner-${partner.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{partner.company || partner.name}</h4>
                            {getStatusBadge(partner.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {partner.name} &bull; {partner.email}
                          </p>
                          <p className="text-sm text-muted-foreground">Roles: {partner.roles?.join(", ")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {partner.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePartnerMutation.mutate({ id: partner.id, status: "approved" })}
                                data-testid={`button-approve-${partner.id}`}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updatePartnerMutation.mutate({ id: partner.id, status: "rejected" })}
                                data-testid={`button-reject-${partner.id}`}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {partner.status === "approved" && (
                            <Button
                              size="sm"
                              onClick={() => updatePartnerMutation.mutate({ id: partner.id, status: "active" })}
                              data-testid={`button-activate-${partner.id}`}
                            >
                              Activate
                            </Button>
                          )}
                          {partner.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updatePartnerMutation.mutate({ id: partner.id, status: "suspended" })}
                              data-testid={`button-suspend-${partner.id}`}
                            >
                              Suspend
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No partner applications yet. Partners can apply at{" "}
                    <span 
                      className="text-primary cursor-pointer hover:underline" 
                      onClick={() => setLocation("/hub/partner-onboarding")}
                    >
                      /hub/partner-onboarding
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
