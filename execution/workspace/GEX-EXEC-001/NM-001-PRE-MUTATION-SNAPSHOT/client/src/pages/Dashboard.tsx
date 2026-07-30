import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  LayoutDashboard, Users, Briefcase, MessageSquare, Settings, 
  Bell, BarChart3, Globe, FileText, Bot, Link2, LogOut,
  Plus, Filter, Search, ChevronDown, Mail, Phone, Calendar,
  CheckCircle, Clock, AlertCircle, XCircle, ArrowRight,
  Building2, Package, Percent, Globe2
} from 'lucide-react';
import { SBUManagement } from '@/components/admin/SBUManagement';
import { ProgramsManagement } from '@/components/admin/ProgramsManagement';
import { CommissionRulesManagement } from '@/components/admin/CommissionRulesManagement';
import { LandingPagesManagement } from '@/components/admin/LandingPagesManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Enquiry, Member, Partner, Country, Service } from '@shared/schema';
import NotificationPreferencesPanel from "@/components/notifications/NotificationPreferencesPanel";

type DashboardStats = {
  totalEnquiries: number;
  newEnquiries: number;
  inProgressEnquiries: number;
  convertedClients: number;
  totalMembers: number;
  totalPartners: number;
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-500',
  contacted: 'bg-yellow-500',
  in_progress: 'bg-purple-500',
  qualified: 'bg-green-500',
  converted: 'bg-emerald-600',
  closed: 'bg-gray-500',
};

const statusIcons: Record<string, typeof CheckCircle> = {
  new: AlertCircle,
  contacted: Clock,
  in_progress: Clock,
  qualified: CheckCircle,
  converted: CheckCircle,
  closed: XCircle,
};

export default function Dashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: enquiries = [], isLoading: enquiriesLoading } = useQuery<Enquiry[]>({
    queryKey: ['/api/enquiries', statusFilter],
    queryFn: async () => {
      const url = statusFilter === 'all' ? '/api/enquiries' : `/api/enquiries?status=${statusFilter}`;
      const res = await fetch(url);
      return res.json();
    },
  });

  const { data: members = [] } = useQuery<Member[]>({
    queryKey: ['/api/members'],
  });

  const { data: partners = [] } = useQuery<Partner[]>({
    queryKey: ['/api/partners'],
  });

  const { data: countries = [] } = useQuery<Country[]>({
    queryKey: ['/api/countries'],
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  useEffect(() => {
    fetch('/api/seed-data', { method: 'POST' });
  }, []);

  const updateEnquiryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Enquiry> }) => {
      return apiRequest('PATCH', `/api/enquiries/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({ title: 'Enquiry updated successfully' });
    },
  });

  const createMemberMutation = useMutation({
    mutationFn: async (data: Partial<Member>) => {
      return apiRequest('POST', '/api/members', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/members'] });
      setIsAddMemberOpen(false);
      toast({ title: 'Member added successfully' });
    },
  });

  const createPartnerMutation = useMutation({
    mutationFn: async (data: Partial<Partner>) => {
      return apiRequest('POST', '/api/partners', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      setIsAddPartnerOpen(false);
      toast({ title: 'Partner added successfully' });
    },
  });

  const filteredEnquiries = enquiries.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, section: 'main' },
    { id: 'enquiries', label: 'Enquiries', icon: MessageSquare, section: 'main' },
    { id: 'members', label: 'Team Members', icon: Users, section: 'main' },
    { id: 'partners', label: 'Partners', icon: Briefcase, section: 'main' },
    { id: 'sbus', label: 'Business Units', icon: Building2, section: 'hub' },
    { id: 'programs', label: 'Programs', icon: Package, section: 'hub' },
    { id: 'commissions', label: 'Commissions', icon: Percent, section: 'hub' },
    { id: 'landing-pages', label: 'Landing Pages', icon: Globe2, section: 'hub' },
    { id: 'integrations', label: 'Integrations', icon: Link2, section: 'settings' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, section: 'settings' },
    { id: 'content', label: 'Site Content', icon: FileText, section: 'settings' },
    { id: 'settings', label: 'Settings', icon: Settings, section: 'settings' },
  ];

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r bg-card hidden lg:block">
        <div className="p-4 border-b">
          <h1 className="font-bold text-lg">Lambsbook Hub</h1>
          <p className="text-xs text-muted-foreground">Admin Dashboard</p>
        </div>
        <ScrollArea className="h-[calc(100vh-80px)]">
          <nav className="p-2 space-y-1">
            <p className="text-xs text-muted-foreground px-3 py-1">Main</p>
            {navItems.filter(i => i.section === 'main').map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
                onClick={() => setActiveTab(item.id)}
                data-testid={`nav-${item.id}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
            <Separator className="my-2" />
            <p className="text-xs text-muted-foreground px-3 py-1">Agentic Hub</p>
            {navItems.filter(i => i.section === 'hub').map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
                onClick={() => setActiveTab(item.id)}
                data-testid={`nav-${item.id}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
            <Separator className="my-2" />
            <p className="text-xs text-muted-foreground px-3 py-1">Configuration</p>
            {navItems.filter(i => i.section === 'settings').map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
                onClick={() => setActiveTab(item.id)}
                data-testid={`nav-${item.id}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
          <Separator className="my-2" />
          <div className="p-2">
            <Button variant="ghost" className="w-full justify-start gap-2" asChild>
              <a href="/">
                <Globe className="h-4 w-4" />
                View Website
              </a>
            </Button>
          </div>
        </ScrollArea>
      </aside>

      <main className="flex-1 overflow-hidden">
        <header className="h-14 border-b flex items-center justify-between px-4 gap-4">
          <div className="flex items-center gap-2">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-[180px] lg:hidden" data-testid="select-mobile-nav">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {navItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <h2 className="font-semibold hidden lg:block">
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <ScrollArea className="h-[calc(100vh-56px)]">
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card data-testid="stat-total-enquiries">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>

                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalEnquiries || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.newEnquiries || 0} new this week
                      </p>
                    </CardContent>
                  </Card>

                  <Card data-testid="stat-in-progress">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.inProgressEnquiries || 0}</div>
                      <p className="text-xs text-muted-foreground">Active follow-ups</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="stat-converted">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">Converted Clients</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.convertedClients || 0}</div>
                      <p className="text-xs text-muted-foreground">Successful conversions</p>
                    </CardContent>
                  </Card>

                  <Card data-testid="stat-team">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                      <CardTitle className="text-sm font-medium">Team & Partners</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(stats?.totalMembers || 0) + (stats?.totalPartners || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stats?.totalMembers || 0} members, {stats?.totalPartners || 0} partners
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-4">
                  <NotificationPreferencesPanel />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Enquiries</CardTitle>
                      <CardDescription>Latest submissions from the website</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {enquiries.slice(0, 5).map((enquiry) => (
                          <div key={enquiry.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${statusColors[enquiry.status] || 'bg-gray-400'}`} />
                              <div>
                                <p className="font-medium text-sm">{enquiry.name}</p>
                                <p className="text-xs text-muted-foreground">{enquiry.inquiryType}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {enquiry.status}
                            </Badge>
                          </div>
                        ))}
                        {enquiries.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">No enquiries yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                      <Button variant="outline" className="justify-start" onClick={() => setActiveTab('enquiries')} data-testid="button-view-enquiries">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        View All Enquiries
                        <ArrowRight className="h-4 w-4 ml-auto" />
                      </Button>
                      <Button variant="outline" className="justify-start" onClick={() => setIsAddMemberOpen(true)} data-testid="button-add-member">
                        <Users className="h-4 w-4 mr-2" />
                        Add Team Member
                        <ArrowRight className="h-4 w-4 ml-auto" />
                      </Button>
                      <Button variant="outline" className="justify-start" onClick={() => setActiveTab('integrations')} data-testid="button-configure-integrations">
                        <Link2 className="h-4 w-4 mr-2" />
                        Configure Integrations
                        <ArrowRight className="h-4 w-4 ml-auto" />
                      </Button>
                      <Button variant="outline" className="justify-start" onClick={() => setActiveTab('ai-assistant')} data-testid="button-ai-assistant">
                        <Bot className="h-4 w-4 mr-2" />
                        AI Assistant Settings
                        <ArrowRight className="h-4 w-4 ml-auto" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'enquiries' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex gap-2 flex-1 w-full sm:w-auto">
                    <div className="relative flex-1 sm:max-w-xs">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search enquiries..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        data-testid="input-search-enquiries"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4">
                  {filteredEnquiries.map((enquiry) => {
                    const StatusIcon = statusIcons[enquiry.status] || AlertCircle;
                    return (
                      <Card key={enquiry.id} className="hover-elevate cursor-pointer" onClick={() => setSelectedEnquiry(enquiry)} data-testid={`card-enquiry-${enquiry.id}`}>
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-full ${statusColors[enquiry.status] || 'bg-gray-400'} flex items-center justify-center text-white`}>
                                <StatusIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{enquiry.name}</h3>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" /> {enquiry.email}
                                  </span>
                                  {enquiry.phone && (
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Phone className="h-3 w-3" /> {enquiry.phone}
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="secondary">{enquiry.inquiryType}</Badge>
                                  {enquiry.countryOfInterest && (
                                    <Badge variant="outline">{enquiry.countryOfInterest}</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={statusColors[enquiry.status]}>{enquiry.status}</Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(enquiry.createdAt!).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {filteredEnquiries.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold mb-2">No enquiries found</h3>
                        <p className="text-muted-foreground">
                          {searchQuery ? 'Try adjusting your search or filters' : 'Enquiries from your website will appear here'}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Dialog open={!!selectedEnquiry} onOpenChange={() => setSelectedEnquiry(null)}>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Enquiry Details</DialogTitle>
                      <DialogDescription>View and manage this enquiry</DialogDescription>
                    </DialogHeader>
                    {selectedEnquiry && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Name</Label>
                            <p className="font-medium">{selectedEnquiry.name}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Email</Label>
                            <p className="font-medium">{selectedEnquiry.email}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Phone</Label>
                            <p className="font-medium">{selectedEnquiry.phone || 'N/A'}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Inquiry Type</Label>
                            <p className="font-medium">{selectedEnquiry.inquiryType}</p>
                          </div>
                        </div>
                        
                        {selectedEnquiry.message && (
                          <div>
                            <Label className="text-muted-foreground">Message</Label>
                            <p className="mt-1 text-sm">{selectedEnquiry.message}</p>
                          </div>
                        )}

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                              value={selectedEnquiry.status}
                              onValueChange={(value) => {
                                updateEnquiryMutation.mutate({ id: selectedEnquiry.id, data: { status: value } });
                                setSelectedEnquiry({ ...selectedEnquiry, status: value });
                              }}
                            >
                              <SelectTrigger data-testid="select-enquiry-status">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="qualified">Qualified</SelectItem>
                                <SelectItem value="converted">Converted</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Assign To</Label>
                            <Select
                              value={selectedEnquiry.assignedMemberId || ''}
                              onValueChange={(value) => {
                                updateEnquiryMutation.mutate({ id: selectedEnquiry.id, data: { assignedMemberId: value } });
                                setSelectedEnquiry({ ...selectedEnquiry, assignedMemberId: value });
                              }}
                            >
                              <SelectTrigger data-testid="select-enquiry-assign">
                                <SelectValue placeholder="Select member" />
                              </SelectTrigger>
                              <SelectContent>
                                {members.map((member) => (
                                  <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Internal Notes</Label>
                          <Textarea
                            placeholder="Add notes about this enquiry..."
                            defaultValue={selectedEnquiry.notes || ''}
                            onBlur={(e) => {
                              if (e.target.value !== selectedEnquiry.notes) {
                                updateEnquiryMutation.mutate({ id: selectedEnquiry.id, data: { notes: e.target.value } });
                              }
                            }}
                            data-testid="textarea-enquiry-notes"
                          />
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setSelectedEnquiry(null)}>Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <Button onClick={() => setIsAddMemberOpen(true)} data-testid="button-add-member-top">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {members.map((member) => (
                    <Card key={member.id} data-testid={`card-member-${member.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{member.name}</h4>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                            <p className="text-sm text-muted-foreground mt-1">{member.email}</p>
                            {member.phone && <p className="text-sm text-muted-foreground">{member.phone}</p>}
                          </div>
                          <Badge variant={member.isActive ? 'default' : 'secondary'}>
                            {member.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          Code: {member.code}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {members.length === 0 && (
                    <Card className="col-span-full">
                      <CardContent className="p-8 text-center">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold mb-2">No team members yet</h3>
                        <p className="text-muted-foreground mb-4">Add team members to assign enquiries</p>
                        <Button onClick={() => setIsAddMemberOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Member
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Team Member</DialogTitle>
                      <DialogDescription>Add a new member to your team</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createMemberMutation.mutate({
                        code: `MEM-${Date.now().toString(36).toUpperCase()}`,
                        name: formData.get('name') as string,
                        email: formData.get('email') as string,
                        phone: formData.get('phone') as string || undefined,
                        role: formData.get('role') as string,
                      });
                    }}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="member-name">Name</Label>
                          <Input id="member-name" name="name" required data-testid="input-member-name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="member-email">Email</Label>
                          <Input id="member-email" name="email" type="email" required data-testid="input-member-email" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="member-phone">Phone</Label>
                          <Input id="member-phone" name="phone" data-testid="input-member-phone" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="member-role">Role</Label>
                          <Select name="role" defaultValue="consultant">
                            <SelectTrigger data-testid="select-member-role">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="consultant">Consultant</SelectItem>
                              <SelectItem value="support">Support</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={createMemberMutation.isPending} data-testid="button-submit-member">
                          {createMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {activeTab === 'partners' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Partners</h3>
                  <Button onClick={() => setIsAddPartnerOpen(true)} data-testid="button-add-partner">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Partner
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {partners.map((partner) => (
                    <Card key={partner.id} data-testid={`card-partner-${partner.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{partner.name}</h4>
                            {partner.company && <p className="text-sm text-muted-foreground">{partner.company}</p>}
                            <p className="text-sm text-muted-foreground mt-1">{partner.email}</p>
                          </div>
                          <Badge variant={partner.isActive ? 'default' : 'secondary'}>
                            {partner.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          Code: {partner.code}
                          {partner.commissionRate && ` • ${partner.commissionRate}% commission`}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {partners.length === 0 && (
                    <Card className="col-span-full">
                      <CardContent className="p-8 text-center">
                        <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold mb-2">No partners yet</h3>
                        <p className="text-muted-foreground mb-4">Add partners who refer clients to you</p>
                        <Button onClick={() => setIsAddPartnerOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Partner
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Dialog open={isAddPartnerOpen} onOpenChange={setIsAddPartnerOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Partner</DialogTitle>
                      <DialogDescription>Add a new partner to your network</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createPartnerMutation.mutate({
                        code: `PTR-${Date.now().toString(36).toUpperCase()}`,
                        name: formData.get('name') as string,
                        email: formData.get('email') as string,
                        phone: formData.get('phone') as string || undefined,
                        company: formData.get('company') as string || undefined,
                        commissionRate: parseInt(formData.get('commission') as string) || undefined,
                      });
                    }}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="partner-name">Name</Label>
                          <Input id="partner-name" name="name" required data-testid="input-partner-name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="partner-email">Email</Label>
                          <Input id="partner-email" name="email" type="email" required data-testid="input-partner-email" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="partner-phone">Phone</Label>
                          <Input id="partner-phone" name="phone" data-testid="input-partner-phone" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="partner-company">Company</Label>
                          <Input id="partner-company" name="company" data-testid="input-partner-company" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="partner-commission">Commission Rate (%)</Label>
                          <Input id="partner-commission" name="commission" type="number" min="0" max="100" data-testid="input-partner-commission" />
                        </div>
                      </div>
                      <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsAddPartnerOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={createPartnerMutation.isPending} data-testid="button-submit-partner">
                          {createPartnerMutation.isPending ? 'Adding...' : 'Add Partner'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {activeTab === 'integrations' && (
              <IntegrationsTab />
            )}

            {activeTab === 'ai-assistant' && (
              <AIAssistantTab />
            )}

            {activeTab === 'content' && (
              <ContentManagementTab />
            )}

            {activeTab === 'sbus' && (
              <SBUManagement />
            )}

            {activeTab === 'programs' && (
              <ProgramsManagement />
            )}

            {activeTab === 'commissions' && (
              <CommissionRulesManagement />
            )}

            {activeTab === 'landing-pages' && (
              <LandingPagesManagement />
            )}

            {activeTab === 'settings' && (
              <SettingsTab countries={countries} services={services} />
            )}
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

function IntegrationsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">External Integrations</h3>
        <p className="text-muted-foreground">Connect your dashboard with external services</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center text-white font-bold text-xs">CU</div>
              ClickUp
            </CardTitle>
            <CardDescription>Project management and task tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Automatically create tasks for new enquiries and track follow-ups in ClickUp.
            </p>
            <Button variant="outline" data-testid="button-connect-clickup">Connect ClickUp</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">AP</div>
              Apollo.io
            </CardTitle>
            <CardDescription>Sales intelligence and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Enrich lead data and automate outreach sequences with Apollo.io integration.
            </p>
            <Button variant="outline" data-testid="button-connect-apollo">Connect Apollo</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center text-white font-bold text-xs">M</div>
              Manus.ai
            </CardTitle>
            <CardDescription>AI-powered automation platform</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create AI agents to automate customer interactions and data processing with Manus.ai.
            </p>
            <Button variant="outline" data-testid="button-connect-manus">Connect Manus</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold text-xs">SB</div>
              Supabase
            </CardTitle>
            <CardDescription>Database and authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Sync member and partner data with your Supabase database for unified management.
            </p>
            <Button variant="outline" data-testid="button-connect-supabase">Connect Supabase</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>Configure how team members receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Email (SendGrid)</p>
                <p className="text-sm text-muted-foreground">Send email notifications for new enquiries</p>
              </div>
            </div>
            <Button variant="outline" size="sm" data-testid="button-configure-email">Configure</Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">SMS (Twilio)</p>
                <p className="text-sm text-muted-foreground">Send SMS alerts for urgent enquiries</p>
              </div>
            </div>
            <Button variant="outline" size="sm" data-testid="button-configure-sms">Configure</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AIAssistantTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">AI Assistant Configuration</h3>
        <p className="text-muted-foreground">Configure AI-powered features for your application</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Service Bot</CardTitle>
            <CardDescription>AI-powered chat for website visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Automatically answer common questions about EB3 visas, study abroad, and services.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable Chat Widget</span>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-qualify Leads</span>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Generation</CardTitle>
            <CardDescription>AI-powered prospect identification</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Use AI to identify and score potential clients based on their interactions.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Lead Scoring</span>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Smart Suggestions</span>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Automation</CardTitle>
            <CardDescription>AI-assisted content updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Automatically update FAQs, success stories, and service descriptions using AI.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">FAQ Updates</span>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Multilingual Translation</span>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback Analysis</CardTitle>
            <CardDescription>AI-powered sentiment analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Analyze client feedback and enquiry messages to identify trends and improvements.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sentiment Detection</span>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Topic Clustering</span>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Recommendations</CardTitle>
          <CardDescription>How to enhance your app with external AI platforms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Manus.ai Integration</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Manus.ai can be used to create autonomous AI agents that handle:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Automated email responses to enquiries</li>
              <li>Document preparation and verification workflows</li>
              <li>Multi-step visa application tracking</li>
              <li>Client onboarding automation</li>
            </ul>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Apollo.ai Integration</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Apollo.io can enhance your lead management with:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Enriched contact information for enquiries</li>
              <li>Automated email sequences for follow-ups</li>
              <li>Lead scoring based on engagement</li>
              <li>Integration with your CRM workflow</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ContentManagementTab() {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Site Content Management</h3>
        <p className="text-muted-foreground">Manage dynamic content on your website</p>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList>
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section Content</CardTitle>
              <CardDescription>Edit the main banner content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Main Title (English)</Label>
                <Input defaultValue="Your Path to the American Dream" data-testid="input-hero-title" />
              </div>
              <div className="space-y-2">
                <Label>Subtitle (English)</Label>
                <Textarea defaultValue="EB3 Work Visa Program - Permanent Residency for You and Your Family" data-testid="textarea-hero-subtitle" />
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Auto-translate to 7 languages</Badge>
                <Badge variant="secondary">AI-assisted</Badge>
              </div>
              <Button onClick={() => toast({ title: 'Content saved successfully' })} data-testid="button-save-hero">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Services Content</CardTitle>
              <CardDescription>Manage service descriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Service content management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>FAQ Content</CardTitle>
              <CardDescription>Manage frequently asked questions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">FAQ content management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Success Stories</CardTitle>
              <CardDescription>Manage client testimonials</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Testimonials management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsTab({ countries, services }: { countries: Country[]; services: Service[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Settings</h3>
        <p className="text-muted-foreground">Manage your dashboard settings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Countries</CardTitle>
            <CardDescription>Countries you serve</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {countries.map((country) => (
                <div key={country.id} className="flex items-center justify-between p-2 border rounded">
                  <span>{country.name} ({country.code})</span>
                  <Badge variant={country.isActive ? 'default' : 'secondary'}>
                    {country.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
              {countries.length === 0 && (
                <p className="text-sm text-muted-foreground">Loading countries...</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>Services you offer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{service.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({service.code})</span>
                  </div>
                  <Badge variant="outline">{service.category}</Badge>
                </div>
              ))}
              {services.length === 0 && (
                <p className="text-sm text-muted-foreground">Loading services...</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
