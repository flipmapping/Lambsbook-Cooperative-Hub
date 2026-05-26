import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Package, GraduationCap, Leaf, Building2, Store } from "lucide-react";
import type { HubProduct } from "@shared/schema";

const sbuOptions = [
  { id: "sbu2", name: "Education (SBU 2)", description: "Tropicana, CTBC, Lambsbook", icon: GraduationCap },
  { id: "sbu4", name: "Agri Products (SBU 4)", description: "Gac Puree, Deligac Noodles", icon: Leaf },
];

const partnerTypes = [
  { value: "school", label: "School/Institution", icon: Building2 },
  { value: "distributor", label: "Distributor", icon: Package },
  { value: "retailer", label: "Retailer", icon: Store },
  { value: "tutor", label: "Tutor/Instructor", icon: Users },
];

const partnerFormSchema = z.object({
  sbuId: z.string().min(1, "Please select a business unit"),
  roles: z.array(z.string()).min(1, "Please select at least one role"),
  company: z.string().min(2, "Organization name must be at least 2 characters"),
  name: z.string().min(2, "Contact name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(7, "Phone number must be at least 7 digits"),
  capabilities: z.string().optional(),
  notes: z.string().optional(),
});

type PartnerFormData = z.infer<typeof partnerFormSchema>;

export default function PartnerOnboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedSbu, setSelectedSbu] = useState<string>("");

  const form = useForm<PartnerFormData>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      sbuId: "",
      roles: [],
      company: "",
      name: "",
      email: "",
      phone: "",
      capabilities: "",
      notes: "",
    },
  });

  const { data: products } = useQuery<HubProduct[]>({
    queryKey: ["/api/hub/products", selectedSbu],
    enabled: !!selectedSbu,
  });

  const createPartnerMutation = useMutation({
    mutationFn: async (data: PartnerFormData) => {
      return await apiRequest("POST", "/api/hub/partners", data);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Thank you for your interest! We'll review your application and contact you within 2-3 business days.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hub/partners"] });
      setLocation("/hub");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PartnerFormData) => {
    createPartnerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/hub")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Partner Onboarding</h1>
            <p className="text-sm text-muted-foreground">Join the Lambsbook Partner Network</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Business Unit
              </CardTitle>
              <CardDescription>
                Choose which business unit you want to partner with
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {sbuOptions.map((sbu) => {
                  const Icon = sbu.icon;
                  const isSelected = selectedSbu === sbu.id;
                  return (
                    <Card
                      key={sbu.id}
                      className={`cursor-pointer transition-all hover-elevate ${
                        isSelected ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => {
                        setSelectedSbu(sbu.id);
                        form.setValue("sbuId", sbu.id);
                      }}
                      data-testid={`card-sbu-${sbu.id}`}
                    >
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className={`p-2 rounded-md ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{sbu.name}</h3>
                          <p className="text-sm text-muted-foreground">{sbu.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {selectedSbu && products && products.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Available Products/Programs</h4>
                  <div className="grid gap-2">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 border rounded-md"
                        data-testid={`product-${product.id}`}
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            {product.revenueModel === "percentage" ? "% Share" : "Fixed Fee"}
                          </Badge>
                          <p className="text-sm font-medium mt-1">
                            {product.retailPrice?.toLocaleString()} {product.currency}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedSbu && (
            <Card>
              <CardHeader>
                <CardTitle>Partner Information</CardTitle>
                <CardDescription>
                  Tell us about your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="roles"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Partner Role(s)</FormLabel>
                            <Select 
                              onValueChange={(val) => field.onChange([val])} 
                              value={field.value?.[0] || ""}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-partner-role">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {partnerTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Organization Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your organization name"
                                {...field}
                                data-testid="input-company"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Primary contact person"
                                {...field}
                                data-testid="input-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="contact@organization.com"
                                {...field}
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+84 xxx xxx xxx"
                                {...field}
                                data-testid="input-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    </div>

                    <FormField
                      control={form.control}
                      name="capabilities"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capabilities (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What products/services can you provide or distribute?"
                              className="resize-none"
                              {...field}
                              data-testid="input-capabilities"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your organization and why you want to partner with us"
                              className="resize-none min-h-[100px]"
                              {...field}
                              data-testid="input-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLocation("/hub")}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createPartnerMutation.isPending}
                        data-testid="button-submit"
                      >
                        {createPartnerMutation.isPending ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
