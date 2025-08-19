import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
  keywords: string[];
}

interface VoiceCommandsProps {
  commands: VoiceCommand[];
  className?: string;
}

export const VoiceCommands = ({ commands, className = "" }: VoiceCommandsProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          if (navigator.vibrate) {
            navigator.vibrate(50); // Start listening feedback
          }
        };

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript) {
            setTranscript(finalTranscript);
            processVoiceCommand(finalTranscript.toLowerCase().trim());
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          setTranscript('');
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          toast.error(`Voice recognition error: ${event.error}`);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processVoiceCommand = (spokenText: string) => {
    console.log('Processing voice command:', spokenText);
    
    // Find matching command
    const matchedCommand = commands.find(cmd => 
      cmd.keywords.some(keyword => 
        spokenText.includes(keyword.toLowerCase())
      )
    );

    if (matchedCommand) {
      // Haptic feedback for successful command
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
      
      matchedCommand.action();
      toast.success(`✓ ${matchedCommand.description}`);
      
      // Speak confirmation if available
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(matchedCommand.description);
        utterance.rate = 1.2;
        utterance.volume = 0.7;
        speechSynthesis.speak(utterance);
      }
    } else {
      toast.error('Command not recognized. Try saying "show commands" for help.');
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast.error('Could not start voice recognition');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className={`relative ${className}`}>
      {/* Voice Control Button */}
      <Button
        variant={isListening ? "default" : "outline"}
        size="sm"
        onClick={toggleListening}
        className={`relative ${isListening ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
        aria-label={isListening ? "Stop listening" : "Start voice commands"}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <MicOff className="w-4 h-4" />
          </motion.div>
        ) : (
          <Mic className="w-4 h-4" />
        )}
        
        {isListening && (
          <motion.div
            className="absolute -inset-1 rounded-lg bg-red-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </Button>

      {/* Help Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowCommands(!showCommands)}
        className="ml-2"
        aria-label="Show voice commands help"
      >
        <Volume2 className="w-4 h-4" />
      </Button>

      {/* Listening Indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-12 left-0 z-50"
          >
            <Card className="p-3 bg-red-500 text-white border-red-600 shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Mic className="w-4 h-4" />
                </motion.div>
                <span>Listening...</span>
              </div>
              {transcript && (
                <div className="text-xs mt-1 opacity-80">
                  "{transcript}"
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Commands Help Panel */}
      <AnimatePresence>
        {showCommands && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-12 left-0 z-50 w-80"
          >
            <Card className="shadow-xl border-2 border-primary/20 bg-background/95 backdrop-blur-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Voice Commands</h3>
                  <Badge variant="secondary" className="text-xs">
                    {commands.length} available
                  </Badge>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {commands.map((cmd, index) => (
                    <div key={index} className="p-2 bg-accent/20 rounded-lg">
                      <div className="font-medium text-sm">{cmd.command}</div>
                      <div className="text-xs text-muted-foreground">{cmd.description}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cmd.keywords.map((keyword, i) => (
                          <Badge key={i} variant="outline" className="text-xs px-1 py-0">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                  <p>💡 Tip: Speak clearly and use keywords like "show", "go to", "find"</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Predefined voice commands for football app
export const footballVoiceCommands: VoiceCommand[] = [
  {
    command: "Show live scores",
    action: () => window.location.href = '/live-scores',
    description: "Opening live scores",
    keywords: ['show', 'live', 'scores', 'matches']
  },
  {
    command: "Go to predictions",
    action: () => window.location.href = '/predictions',
    description: "Opening predictions page",
    keywords: ['go', 'predictions', 'predict', 'betting']
  },
  {
    command: "Show news",
    action: () => window.location.href = '/news',
    description: "Opening football news",
    keywords: ['show', 'news', 'articles', 'updates']
  },
  {
    command: "Open community",
    action: () => window.location.href = '/chat',
    description: "Opening community chat",
    keywords: ['open', 'community', 'chat', 'discuss']
  },
  {
    command: "View leagues",
    action: () => window.location.href = '/leagues',
    description: "Opening league tables",
    keywords: ['view', 'leagues', 'tables', 'standings']
  },
  {
    command: "Go home",
    action: () => window.location.href = '/',
    description: "Going to homepage",
    keywords: ['go', 'home', 'homepage', 'main']
  },
  {
    command: "Refresh page",
    action: () => window.location.reload(),
    description: "Refreshing current page",
    keywords: ['refresh', 'reload', 'update']
  },
  {
    command: "Show commands",
    action: () => {},
    description: "Showing available commands",
    keywords: ['show', 'commands', 'help', 'what can']
  }
];

export default VoiceCommands;
