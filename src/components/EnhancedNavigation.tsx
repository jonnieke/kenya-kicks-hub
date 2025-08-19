import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Home, 
  Trophy, 
  TrendingUp, 
  Users, 
  Newspaper, 
  Settings, 
  Bell, 
  Search, 
  Menu, 
  X,
  Crown,
  Zap,
  Target,
  Star,
  LogOut,
  User,
  Shield,
  Gift,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import VoiceCommands, { footballVoiceCommands } from './VoiceCommands';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  isPremium?: boolean;
  isNew?: boolean;
  path: string; // Added for NavLink
}

interface ExtendedUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  isPremium?: boolean;
}

const navigationItems: NavigationItem[] = [
  { label: 'Home', href: '/', icon: Home, path: '/' },
  { label: 'Live Scores', href: '/live-scores', icon: Trophy, badge: 'LIVE', path: '/live-scores' },
  { label: 'Predictions', href: '/predictions', icon: TrendingUp, isPremium: true, path: '/predictions' },
  { label: 'News', href: '/news', icon: Newspaper, path: '/news' },
  { label: 'Community', href: '/chat', icon: Users, path: '/chat' },
  { label: 'Leagues', href: '/leagues', icon: Target, path: '/leagues' },
];

export const EnhancedNavigation = () => {
  const { user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Mock notification count - replace with real data
  useEffect(() => {
    setNotificationCount(3);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Extend user with additional properties
  const extendedUser: ExtendedUser | null = user ? {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    avatar: user.user_metadata?.avatar_url,
    isPremium: user.user_metadata?.isPremium || false
  } : null;

  const isActiveRoute = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Mobile Optimized */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-elevated transition-all duration-300">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-background" />
              </div>
              <span className="hidden sm:block text-xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                Ball Mtaani
              </span>
              <span className="sm:hidden text-lg font-bold bg-gradient-accent bg-clip-text text-transparent">
                BM
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "hover:bg-accent/50 hover:text-accent-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Voice Commands */}
            <div className="hidden sm:block">
              <VoiceCommands commands={footballVoiceCommands} />
            </div>

            {/* Search - Hidden on very small screens */}
            <div className="hidden sm:block">
              <Button
                variant="ghost"
                size="sm"
                className="w-9 h-9 p-0"
                onClick={() => setShowSearch(true)}
              >
                <Search className="w-4 h-4" />
                <span className="sr-only">Search</span>
              </Button>
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative w-9 h-9 p-0"
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full p-0"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || user.email || 'User'} />
                      <AvatarFallback className="bg-gradient-primary text-background font-semibold">
                        {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {user.user_metadata?.isPremium && (
                      <div className="absolute -top-1 -right-1">
                        <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.user_metadata?.isPremium && (
                    <DropdownMenuItem asChild>
                      <Link to="/premium" className="cursor-pointer">
                        <Crown className="mr-2 h-4 w-4 text-yellow-500" />
                        <span>Premium Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/affiliates" className="cursor-pointer">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Affiliate Program</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden w-9 h-9 p-0"
              onClick={() => setShowMobileMenu(true)}
            >
              <Menu className="w-5 h-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-md"
          >
            <div className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
                      "hover:bg-accent/50 hover:text-accent-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground"
                    )
                  }
                  onClick={() => setShowMobileMenu(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
