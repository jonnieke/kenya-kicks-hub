import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Eye, Users, TrendingUp, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Affiliate {
  id: string;
  user_id: string | null;
  affiliate_code: string;
  contact_email: string;
  company_name: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commission_rate: number;
  total_clicks: number;
  total_conversions: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

const AdminAffiliateManager = () => {
  const { toast } = useToast();
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [formData, setFormData] = useState({
    affiliate_code: "",
    contact_email: "",
    company_name: "",
    status: "pending" as Affiliate['status'],
    commission_rate: 10
  });

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-500/20 text-yellow-600' },
    { value: 'approved', label: 'Approved', color: 'bg-green-500/20 text-green-600' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-500/20 text-red-600' },
    { value: 'suspended', label: 'Suspended', color: 'bg-gray-500/20 text-gray-600' }
  ];

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the data to match our interface
      const typedData: Affiliate[] = (data || []).map(item => ({
        ...item,
        status: item.status as Affiliate['status']
      }));
      
      setAffiliates(typedData);
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch affiliates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const affiliateData = {
        affiliate_code: formData.affiliate_code,
        contact_email: formData.contact_email,
        company_name: formData.company_name,
        status: formData.status,
        commission_rate: formData.commission_rate,
        total_clicks: 0,
        total_conversions: 0,
        total_earnings: 0
      };

      if (editingAffiliate) {
        const { error } = await supabase
          .from('affiliates')
          .update(affiliateData)
          .eq('id', editingAffiliate.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Affiliate updated successfully"
        });
        setIsEditDialogOpen(false);
      } else {
        const { error } = await supabase
          .from('affiliates')
          .insert([affiliateData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Affiliate created successfully"
        });
        setIsCreateDialogOpen(false);
      }

      resetForm();
      fetchAffiliates();
    } catch (error) {
      console.error('Error saving affiliate:', error);
      toast({
        title: "Error",
        description: "Failed to save affiliate",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (affiliate: Affiliate) => {
    setEditingAffiliate(affiliate);
    setFormData({
      affiliate_code: affiliate.affiliate_code,
      contact_email: affiliate.contact_email,
      company_name: affiliate.company_name,
      status: affiliate.status,
      commission_rate: affiliate.commission_rate
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this affiliate?')) return;

    try {
      const { error } = await supabase
        .from('affiliates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Affiliate deleted successfully"
      });
      fetchAffiliates();
    } catch (error) {
      console.error('Error deleting affiliate:', error);
      toast({
        title: "Error",
        description: "Failed to delete affiliate",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: Affiliate['status']) => {
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Affiliate status updated to ${newStatus}`
      });
      fetchAffiliates();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      affiliate_code: "",
      contact_email: "",
      company_name: "",
      status: "pending",
      commission_rate: 10
    });
    setEditingAffiliate(null);
  };

  const getStatusIcon = (status: Affiliate['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'suspended':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Affiliate Management</h2>
          <p className="text-muted-foreground">Manage affiliate partners, approvals, and performance</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Affiliate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Affiliate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="affiliate_code">Affiliate Code *</Label>
                  <Input
                    id="affiliate_code"
                    value={formData.affiliate_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, affiliate_code: e.target.value }))}
                    placeholder="Enter affiliate code"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="Enter contact email"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Affiliate['status']) => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="commission_rate">Commission Rate (%) *</Label>
                  <Input
                    id="commission_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.commission_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: parseFloat(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Affiliate</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Affiliates List */}
      <div className="grid gap-4">
        {affiliates.map(affiliate => (
          <Card key={affiliate.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{affiliate.affiliate_code}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{affiliate.contact_email}</span>
                      <span>•</span>
                      <span>{affiliate.company_name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(affiliate)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(affiliate.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(affiliate.status)}
                    <Badge 
                      className={statuses.find(s => s.value === affiliate.status)?.color || ''}
                    >
                      {affiliate.status.charAt(0).toUpperCase() + affiliate.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Performance</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {affiliate.total_clicks}
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {affiliate.total_conversions}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Earnings</p>
                  <div className="flex items-center text-sm font-medium">
                    <DollarSign className="w-4 h-4 mr-1" />
                    ${affiliate.total_earnings.toFixed(2)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Commission</p>
                  <Badge variant="outline">{affiliate.commission_rate}%</Badge>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2 mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">Quick Actions:</span>
                {affiliate.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(affiliate.id, 'approved')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(affiliate.id, 'rejected')}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                {affiliate.status === 'approved' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(affiliate.id, 'suspended')}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Suspend
                  </Button>
                )}
                {affiliate.status === 'suspended' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(affiliate.id, 'approved')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Reactivate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Affiliate</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_affiliate_code">Affiliate Code *</Label>
                <Input
                  id="edit_affiliate_code"
                  value={formData.affiliate_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, affiliate_code: e.target.value }))}
                  placeholder="Enter affiliate code"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_contact_email">Contact Email *</Label>
                <Input
                  id="edit_contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="Enter contact email"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit_company_name">Company Name *</Label>
              <Input
                id="edit_company_name"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Affiliate['status']) => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_commission_rate">Commission Rate (%) *</Label>
                <Input
                  id="edit_commission_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: parseFloat(e.target.value) }))}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Affiliate</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAffiliateManager;