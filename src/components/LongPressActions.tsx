import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Heart, 
  Share2, 
  Bookmark, 
  Target, 
  Eye, 
  Bell,
  MessageCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface LongPressAction {
  id: string;
  label: string;
  icon: any;
  action: () => void;
  color?: string;
}

interface LongPressActionsProps {
  children: React.ReactNode;
  actions: LongPressAction[];
  className?: string;
  hapticFeedback?: boolean;
}

export const LongPressActions = ({ 
  children, 
  actions, 
  className = "",
  hapticFeedback = true 
}: LongPressActionsProps) => {
  const [showActions, setShowActions] = useState(false);
  const [pressPosition, setPressPosition] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const pressStartTime = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    pressStartTime.current = Date.now();
    const touch = e.touches[0];
    setPressPosition({ x: touch.clientX, y: touch.clientY });

    longPressTimer.current = setTimeout(() => {
      if (hapticFeedback && navigator.vibrate) {
        navigator.vibrate(100); // Long press haptic feedback
      }
      setShowActions(true);
    }, 500); // 500ms for long press
  }, [hapticFeedback]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const pressDuration = Date.now() - pressStartTime.current;
    
    // If it was a quick tap (less than 200ms), close actions
    if (pressDuration < 200 && showActions) {
      setShowActions(false);
    }
  }, [showActions]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    pressStartTime.current = Date.now();
    setPressPosition({ x: e.clientX, y: e.clientY });

    longPressTimer.current = setTimeout(() => {
      setShowActions(true);
    }, 500);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const pressDuration = Date.now() - pressStartTime.current;
    
    if (pressDuration < 200 && showActions) {
      setShowActions(false);
    }
  }, [showActions]);

  const handleActionClick = useCallback((action: LongPressAction) => {
    if (hapticFeedback && navigator.vibrate) {
      navigator.vibrate(50); // Action tap feedback
    }
    
    action.action();
    setShowActions(false);
    toast.success(`${action.label} activated`);
  }, [hapticFeedback]);

  const handleBackdropClick = useCallback(() => {
    setShowActions(false);
  }, []);

  return (
    <>
      <div
        className={`relative ${className}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()} // Prevent default context menu
      >
        {children}
      </div>

      {/* Actions Menu */}
      <AnimatePresence>
        {showActions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
              onClick={handleBackdropClick}
            />

            {/* Actions Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0, x: pressPosition.x, y: pressPosition.y }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: pressPosition.x - 150, // Center the menu
                y: pressPosition.y - 100
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed z-50 w-80"
              style={{ 
                left: 0, 
                top: 0,
                transform: `translate(${Math.max(20, Math.min(pressPosition.x - 150, window.innerWidth - 320))}px, ${Math.max(20, Math.min(pressPosition.y - 100, window.innerHeight - 200))}px)`
              }}
            >
              <Card className="p-4 shadow-2xl border-2 border-primary/20 bg-background/95 backdrop-blur-md">
                <div className="text-sm font-medium text-muted-foreground mb-3 text-center">
                  Quick Actions
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  {actions.map((action, index) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-16 w-full flex-col gap-1 hover:bg-primary/10 ${action.color || ''}`}
                        onClick={() => handleActionClick(action)}
                      >
                        <action.icon className="w-6 h-6" />
                        <span className="text-xs">{action.label}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* Close hint */}
                <div className="text-xs text-muted-foreground text-center mt-3">
                  Tap outside to close
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Predefined action sets for common use cases
export const matchCardActions = (matchId: string): LongPressAction[] => [
  {
    id: 'like',
    label: 'Like',
    icon: Heart,
    action: () => console.log('Like match', matchId),
    color: 'text-red-500'
  },
  {
    id: 'share',
    label: 'Share',
    icon: Share2,
    action: () => {
      if (navigator.share) {
        navigator.share({
          title: 'Match Update',
          text: 'Check out this match!',
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    }
  },
  {
    id: 'bookmark',
    label: 'Save',
    icon: Bookmark,
    action: () => console.log('Bookmark match', matchId),
    color: 'text-yellow-500'
  },
  {
    id: 'predict',
    label: 'Predict',
    icon: Target,
    action: () => console.log('Predict match', matchId),
    color: 'text-blue-500'
  },
  {
    id: 'details',
    label: 'Details',
    icon: Eye,
    action: () => console.log('View details', matchId)
  },
  {
    id: 'notify',
    label: 'Notify',
    icon: Bell,
    action: () => console.log('Set notification', matchId),
    color: 'text-orange-500'
  },
  {
    id: 'discuss',
    label: 'Discuss',
    icon: MessageCircle,
    action: () => console.log('Discuss match', matchId),
    color: 'text-green-500'
  },
  {
    id: 'copy',
    label: 'Copy',
    icon: Copy,
    action: () => {
      navigator.clipboard.writeText(`Match ${matchId} - ${window.location.href}`);
      toast.success('Match info copied!');
    }
  }
];

export default LongPressActions;
