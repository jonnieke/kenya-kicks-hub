import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminMatchManager } from "@/components/AdminMatchManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Activity, TrendingUp, Newspaper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserRole {
  role: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMatches: 0,
    liveMatches: 0,
    totalUsers: 0,
    activeAffiliates: 0
  });

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Access Denied",
          description: "Please log in to access admin features",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error checking roles:', error);
        setLoading(false);
        return;
      }

      const hasAdminRole = roles?.some((role: UserRole) => role.role === 'admin');
      setIsAdmin(hasAdminRole || false);
      
      if (!hasAdminRole) {
        toast({
          title: "Access Denied", 
          description: "You don't have admin privileges",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch matches stats
      const { data: matchesData } = await supabase
        .from('matches')
        .select('status');

      const totalMatches = matchesData?.length || 0;
      const liveMatches = matchesData?.filter(match => match.status === 'live').length || 0;

      // Fetch users count (approximate from profiles)
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch active affiliates
      const { count: affiliatesCount } = await supabase
        .from('affiliates')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      setStats({
        totalMatches,
        liveMatches,
        totalUsers: usersCount || 0,
        activeAffiliates: affiliatesCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="w-5 h-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel. Contact an administrator if you need access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage matches and system settings</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalMatches}</div>
              <div className="text-sm text-muted-foreground">Total Matches</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-6 h-6 mx-auto mb-2">
                <div className="w-2 h-2 bg-match-live rounded-full animate-pulse mx-auto"></div>
              </div>
              <div className="text-2xl font-bold">{stats.liveMatches}</div>
              <div className="text-sm text-muted-foreground">Live Now</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.activeAffiliates}</div>
              <div className="text-sm text-muted-foreground">Active Affiliates</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Status Badge */}
        <div className="flex justify-center">
          <Badge variant="default" className="bg-green-500/20 text-green-600 border-green-500/30">
            <Shield className="w-3 h-3 mr-1" />
            Admin Access Granted
          </Badge>
        </div>

        {/* Match Manager */}
        <AdminMatchManager />
        
        {/* News Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">News Management</CardTitle>
            <p className="text-muted-foreground">Manage news articles, comments, and engagement</p>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>News management functionality will be available after database migration is complete.</p>
              <p className="text-sm mt-2">Features include: Create articles, manage comments, moderate content</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;