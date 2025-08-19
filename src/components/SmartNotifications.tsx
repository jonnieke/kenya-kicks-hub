import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Star, 
  Trophy, 
  Target, 
  Users, 
  TrendingUp,
  Settings,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'premium' | 'match' | 'prediction';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'system' | 'match' | 'prediction' | 'social' | 'premium';
  expiresAt?: Date;
}

interface NotificationPreferences {
  matchUpdates: boolean;
  predictionResults: boolean;
  socialInteractions: boolean;
  premiumOffers: boolean;
  systemAlerts: boolean;
  soundEnabled: boolean;
  pushEnabled: boolean;
}

const SmartNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    matchUpdates: true,
    predictionResults: true,
    socialInteractions: true,
    premiumOffers: true,
    systemAlerts: true,
    soundEnabled: true,
    pushEnabled: true
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Mock notifications - replace with real data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'match',
        title: 'Match Started!',
        message: 'Arsenal vs Chelsea is now LIVE',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        isRead: false,
        actionUrl: '/live-scores',
        actionText: 'Watch Live',
        priority: 'high',
        category: 'match'
      },
      {
        id: '2',
        type: 'prediction',
        title: 'Prediction Result',
        message: 'Your prediction for Man City vs Liverpool was correct! +KES 150',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        isRead: false,
        actionUrl: '/predictions',
        actionText: 'View Details',
        priority: 'medium',
        category: 'prediction'
      },
      {
        id: '3',
        type: 'premium',
        title: 'Premium Feature Unlocked',
        message: 'You now have access to advanced betting insights',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isRead: false,
        actionUrl: '/premium',
        actionText: 'Explore',
        priority: 'medium',
        category: 'premium'
      },
      {
        id: '4',
        type: 'social',
        title: 'New Community Member',
        message: 'John Doe joined your prediction group',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: true,
        priority: 'low',
        category: 'social'
      },
      {
        id: '5',
        type: 'system',
        title: 'System Update',
        message: 'New features have been added to Ball Mtaani',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isRead: true,
        actionUrl: '/whats-new',
        actionText: 'Learn More',
        priority: 'low',
        category: 'system'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'premium': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'match': return <Trophy className="w-5 h-5 text-blue-500" />;
      case 'prediction': return <Target className="w-5 h-5 text-green-500" />;
      case 'social': return <Users className="w-5 h-5 text-purple-500" />;
      case 'system': return <Info className="w-5 h-5 text-gray-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'premium': return 'border-yellow-200 bg-yellow-50';
      case 'match': return 'border-blue-200 bg-blue-50';
      case 'prediction': return 'border-green-200 bg-green-50';
      case 'social': return 'border-purple-200 bg-purple-50';
      case 'system': return 'border-gray-200 bg-gray-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Recalculate unread count
    const newUnreadCount = notifications.filter(n => n.id !== id && !n.isRead).length;
    setUnreadCount(newUnreadCount);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const playNotificationSound = () => {
    if (preferences.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      // Navigate to action URL
      window.location.href = notification.actionUrl;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (notification.category) {
      case 'match': return preferences.matchUpdates;
      case 'prediction': return preferences.predictionResults;
      case 'social': return preferences.socialInteractions;
      case 'premium': return preferences.premiumOffers;
      case 'system': return preferences.systemAlerts;
      default: return true;
    }
  });

  const unreadNotifications = filteredNotifications.filter(n => !n.isRead);

  return (
    <>
      {/* Audio element for notification sounds */}
      <audio ref={audioRef} preload="auto">
        <source src="/notification-sound.mp3" type="audio/mpeg" />
      </audio>

      {/* Notification Bell */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative group">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 min-w-[20px] h-5 animate-pulse"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
            <span className="absolute inset-0 bg-accent/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-96 max-h-[80vh] overflow-y-auto">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount} new
                </Badge>
              )}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-6 px-2 text-xs"
              >
                Mark all read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
              >
                Clear all
              </Button>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <DropdownMenuItem
                      className={`p-4 cursor-pointer ${getNotificationColor(notification.type)} ${
                        !notification.isRead ? 'border-l-4 border-l-primary' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-sm font-semibold text-foreground">
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          
                          {notification.actionUrl && notification.actionText && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notification);
                              }}
                            >
                              {notification.actionText}
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <DropdownMenuSeparator />

          {/* Settings */}
          <DropdownMenuLabel className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Notification Settings
            </span>
          </DropdownMenuLabel>

          <div className="p-3 space-y-2">
            {Object.entries(preferences).map(([key, value]) => {
              if (key === 'soundEnabled' || key === 'pushEnabled') return null;
              
              const label = key.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
              
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePreference(key as keyof NotificationPreferences)}
                    className={`h-6 px-2 ${value ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    {value ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </Button>
                </div>
              );
            })}
          </div>

          <DropdownMenuSeparator />

          {/* View All */}
          <DropdownMenuItem className="text-center text-primary font-medium">
            View All Notifications
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default SmartNotifications;
