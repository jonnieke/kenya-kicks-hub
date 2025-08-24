import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Share2, 
  Copy, 
  ExternalLink, 
  BarChart3, 
  Target,
  Zap,
  Star,
  Gift,
  Settings
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AffiliateStats {
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  conversionRate: number;
  averageCommission: number;
  monthlyEarnings: number;
  topPerformingLinks: Array<{
    id: string;
    name: string;
    clicks: number;
    conversions: number;
    earnings: number;
  }>;
}

interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  category: string;
  clicks: number;
  conversions: number;
  earnings: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export function EnhancedAffiliateDashboard() {
  const [stats, setStats] = useState<AffiliateStats>({
    totalClicks: 0,
    totalConversions: 0,
    totalEarnings: 0,
    conversionRate: 0,
    averageCommission: 0,
    monthlyEarnings: 0,
    topPerformingLinks: []
  });
  
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      setLoading(true);
      
      // Set mock data for demonstration purposes
      setStats({
        totalClicks: 15420,
        totalConversions: 847,
        totalEarnings: 2847.50,
        conversionRate: 5.49,
        averageCommission: 3.36,
        monthlyEarnings: 456.80,
        topPerformingLinks: [
          {
            id: '1',
            name: 'Premier League Betting',
            clicks: 3240,
            conversions: 189,
            earnings: 567.00
          },
          {
            id: '2',
            name: 'Champions League Odds',
            clicks: 2890,
            conversions: 156,
            earnings: 468.00
          },
          {
            id: '3',
            name: 'Live Match Predictions',
            clicks: 2150,
            conversions: 98,
            earnings: 294.00
          }
        ]
      });

      // Set mock links data
      setLinks([
        {
          id: '1',
          name: 'Premier League Betting',
          url: 'https://ballmtaani.com/predictions?ref=user123&cat=premier-league',
          category: 'Premier League',
          clicks: 3240,
          conversions: 189,
          earnings: 567.00,
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: '2', 
          name: 'Champions League Odds',
          url: 'https://ballmtaani.com/predictions?ref=user123&cat=champions-league',
          category: 'Champions League',
          clicks: 2890,
          conversions: 156,
          earnings: 468.00,
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast.error('Failed to load affiliate data');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const generateAffiliateLink = (baseUrl: string, category: string) => {
    const userId = 'user123'; // Get from auth context
    const timestamp = Date.now();
    return `${baseUrl}?ref=${userId}&cat=${category}&t=${timestamp}`;
  };

  const createNewLink = async (name: string, category: string, baseUrl: string) => {
    try {
      const newLink: AffiliateLink = {
        id: Date.now().toString(),
        name,
        url: generateAffiliateLink(baseUrl, category),
        category,
        status: 'active',
        clicks: 0,
        conversions: 0,
        earnings: 0,
        createdAt: new Date().toISOString()
      };

      setLinks(prev => [newLink, ...prev]);
      toast.success('New affiliate link created!');
    } catch (error) {
      console.error('Error creating link:', error);
      toast.error('Failed to create affiliate link');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Affiliate Dashboard</h1>
            <p className="text-muted-foreground">Track your earnings and optimize your performance</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              <Star className="w-3 h-3 mr-1" />
              Gold Level Affiliate
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-card border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalClicks.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-accent/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversions</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalConversions.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-foreground">${stats.totalEarnings.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="links">My Links</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Top Performing Links */}
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent" />
                    Top Performing Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topPerformingLinks.map((link, index) => (
                      <div key={link.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{link.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {link.clicks.toLocaleString()} clicks • {link.conversions} conversions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">${link.earnings.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {((link.conversions / link.clicks) * 100).toFixed(1)}% CR
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gradient-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full bg-gradient-primary hover:bg-gradient-accent">
                    <Share2 className="w-4 h-4 mr-2" />
                    Create New Link
                  </Button>
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                  <Button variant="outline" className="w-full">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Request Payout
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Invite Friends
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Performance Chart */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Chart visualization coming soon</p>
                    <p className="text-sm">Monthly earnings: ${stats.monthlyEarnings.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links" className="space-y-6">
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Affiliate Links</CardTitle>
                  <Button className="bg-gradient-primary hover:bg-gradient-accent">
                    <Share2 className="w-4 h-4 mr-2" />
                    Create New Link
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {links.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Share2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No affiliate links created yet</p>
                      <p className="text-sm">Create your first link to start earning</p>
                    </div>
                  ) : (
                    links.map((link) => (
                      <div key={link.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">{link.name}</h3>
                            <Badge variant={link.status === 'active' ? 'default' : 'secondary'}>
                              {link.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{link.url}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{link.clicks} clicks</span>
                            <span>{link.conversions} conversions</span>
                            <span>${link.earnings.toFixed(2)} earned</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(link.url)}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Advanced analytics dashboard coming soon</p>
                    <p className="text-sm">Track clicks, conversions, and earnings over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle>Earnings & Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Available Balance</p>
                      <p className="text-2xl font-bold text-green-600">${stats.totalEarnings.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold text-primary">${stats.monthlyEarnings.toFixed(2)}</p>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Next Payout</p>
                      <p className="text-2xl font-bold text-accent">$500.00</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button size="lg" className="bg-gradient-primary hover:bg-gradient-accent">
                      <DollarSign className="w-5 h-5 mr-2" />
                      Request Payout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default EnhancedAffiliateDashboard;
