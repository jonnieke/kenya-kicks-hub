import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  Trophy, 
  Users, 
  Clock, 
  Star,
  Zap,
  BarChart3,
  Calendar,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardMetric {
  label: string;
  value: string | number;
  change: number;
  icon: any;
  color: string;
}

interface QuickAction {
  label: string;
  description: string;
  icon: any;
  action: () => void;
  variant: 'default' | 'secondary' | 'outline';
}

const InteractiveDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Memoized metrics to prevent unnecessary recalculations
  const metrics = useMemo((): DashboardMetric[] => [
    {
      label: 'Predictions Made',
      value: 24,
      change: 12.5,
      icon: Target,
      color: 'text-blue-600'
    },
    {
      label: 'Success Rate',
      value: '78%',
      change: 5.2,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Points Earned',
      value: '1,250',
      change: 8.7,
      icon: Trophy,
      color: 'text-yellow-600'
    },
    {
      label: 'Active Streak',
      value: '7 days',
      change: 2,
      icon: Zap,
      color: 'text-purple-600'
    }
  ], []);

  // Memoized quick actions
  const quickActions = useMemo((): QuickAction[] => [
    {
      label: 'Make Prediction',
      description: 'Predict today\'s matches',
      icon: Target,
      action: () => window.location.href = '/predictions',
      variant: 'default'
    },
    {
      label: 'View Live Scores',
      description: 'Check current matches',
      icon: Activity,
      action: () => window.location.href = '/live-scores',
      variant: 'secondary'
    },
    {
      label: 'Join Community',
      description: 'Connect with other fans',
      icon: Users,
      action: () => window.location.href = '/chat',
      variant: 'outline'
    }
  ], []);

  // Memoized recent matches
  const recentMatches = useMemo(() => [
    { id: 1, home: 'Arsenal', away: 'Chelsea', score: '2-1', status: 'finished' },
    { id: 2, home: 'Man City', away: 'Liverpool', score: '1-1', status: 'live' },
    { id: 3, home: 'Man United', away: 'Tottenham', score: '3-0', status: 'finished' }
  ], []);

  // Callback functions to prevent recreation on every render
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const handleQuickAction = useCallback((action: QuickAction) => {
    action.action();
  }, []);

  if (!user) {
    return null; // Don't render dashboard for non-authenticated users
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="bg-gradient-card border border-primary/20 shadow-card hover:shadow-elevated transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-background" />
            </div>
            <span className="text-2xl font-bold">Your Dashboard</span>
            {user.user_metadata?.isPremium && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <Star className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="actions">Quick Actions</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="bg-background/50 border border-border/20 hover:border-primary/30 transition-colors">
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-background/80 flex items-center justify-center`}>
                          <metric.icon className={`w-6 h-6 ${metric.color}`} />
                        </div>
                        <div className="text-2xl font-bold mb-1">{metric.value}</div>
                        <div className="text-sm text-muted-foreground mb-2">{metric.label}</div>
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-green-600">+{metric.change}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Recent Activity */}
              <Card className="bg-background/50 border border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentMatches.map((match, index) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="font-medium">
                            {match.home} vs {match.away}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{match.score}</Badge>
                          <Badge variant={match.status === 'live' ? 'destructive' : 'default'}>
                            {match.status}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Prediction Performance */}
                <Card className="bg-background/50 border border-border/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Prediction Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>This Month</span>
                          <span>78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Last Month</span>
                          <span>72%</span>
                        </div>
                        <Progress value={72} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Chart */}
                <Card className="bg-background/50 border border-border/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Weekly Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                        <div key={day} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground w-8">{day}</span>
                          <div className="flex-1 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.random() * 60 + 20}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Quick Actions Tab */}
            <TabsContent value="actions" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card 
                      className="bg-background/50 border border-border/20 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:shadow-md"
                      onClick={() => handleQuickAction(action)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
                          <action.icon className="w-8 h-8 text-background" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{action.label}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{action.description}</p>
                        <Button variant={action.variant} className="w-full">
                          {action.label}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InteractiveDashboard;
