import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Quote, 
  Heart, 
  Share2, 
  RefreshCw, 
  TrendingUp,
  Star,
  MessageCircle,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Quote {
  id: string;
  text: string;
  author: string;
  category: 'motivational' | 'funny' | 'philosophical' | 'tactical';
  likes: number;
  shares: number;
  language: 'English' | 'Swahili' | 'Arabic' | 'French';
  region: 'Kenya' | 'Africa' | 'Global';
}

interface Meme {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'local' | 'african' | 'international';
  tags: string[];
  likes: number;
  shares: number;
  createdBy: string;
  isLocal: boolean;
}

export const FootballQuotesAndMemes = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [currentMeme, setCurrentMeme] = useState<Meme | null>(null);
  const [activeTab, setActiveTab] = useState<'quotes' | 'memes'>('quotes');
  const [likedQuotes, setLikedQuotes] = useState<Set<string>>(new Set());
  const [likedMemes, setLikedMemes] = useState<Set<string>>(new Set());
  const [copiedQuote, setCopiedQuote] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const quotes: Quote[] = [
    {
      id: '1',
      text: "Football is not just a game, it's a way of life. In Kenya, we don't just play football, we live it with passion and pride.",
      author: "Dennis Oliech",
      category: 'motivational',
      likes: 245,
      shares: 89,
      language: 'English',
      region: 'Kenya'
    },
    {
      id: '2',
      text: "Kupiga mpira si kazi tu, ni uhai wetu. Tunapiga mpira kwa moyo na roho.",
      author: "Victor Wanyama",
      category: 'motivational',
      likes: 189,
      shares: 67,
      language: 'Swahili',
      region: 'Kenya'
    },
    {
      id: '3',
      text: "The ball is round, the game lasts 90 minutes, and everything else is pure theory.",
      author: "Jose Mourinho",
      category: 'philosophical',
      likes: 156,
      shares: 45,
      language: 'English',
      region: 'Global'
    },
    {
      id: '4',
      text: "Football is like life - it requires perseverance, self-denial, hard work, sacrifice, dedication and respect for authority.",
      author: "Vince Lombardi",
      category: 'motivational',
      likes: 203,
      shares: 78,
      language: 'English',
      region: 'Global'
    },
    {
      id: '5',
      text: "Kila siku ni mpira mpya. Leo unaweza kuwa mshindi, kesho unaweza kuwa mshindwa. Lakini mpira unaendelea.",
      author: "Gor Mahia Legend",
      category: 'philosophical',
      likes: 134,
      shares: 52,
      language: 'Swahili',
      region: 'Kenya'
    },
    {
      id: '6',
      text: "In Africa, football is not just sport. It's hope, it's dreams, it's the way out of poverty for many young talents.",
      author: "Samuel Eto'o",
      category: 'motivational',
      likes: 298,
      shares: 156,
      language: 'English',
      region: 'Africa'
    },
    {
      id: '7',
      text: "Tactics are like a beautiful woman - they need to be understood, not just admired.",
      author: "Arrigo Sacchi",
      category: 'tactical',
      likes: 167,
      shares: 89,
      language: 'English',
      region: 'Global'
    },
    {
      id: '8',
      text: "AFC Leopards vs Gor Mahia is not just a match, it's a war of pride, history, and passion.",
      author: "Local Fan",
      category: 'funny',
      likes: 445,
      shares: 234,
      language: 'English',
      region: 'Kenya'
    }
  ];

  const memes: Meme[] = [
    {
      id: '1',
      title: "When Gor Mahia Wins",
      description: "K'Ogalo fans be like: 'Told you we're the best!' 😂",
      imageUrl: "/memes/gor-mahia-win.jpg",
      category: 'local',
      tags: ['Gor Mahia', 'Kenya', 'Victory', 'Fans'],
      likes: 567,
      shares: 234,
      createdBy: "K'Ogalo Fan",
      isLocal: true
    },
    {
      id: '2',
      title: "AFC Leopards vs Gor Mahia",
      description: "The only derby where even the referees are scared 😅",
      imageUrl: "/memes/ingwe-vs-gor.jpg",
      category: 'local',
      tags: ['Derby', 'AFC Leopards', 'Gor Mahia', 'Kenya'],
      likes: 789,
      shares: 456,
      createdBy: "Nairobi Football",
      isLocal: true
    },
    {
      id: '3',
      title: "Kenyan Referee Logic",
      description: "Offside? Let me check with VAR... Oh wait, we don't have VAR 😂",
      imageUrl: "/memes/kenyan-referee.jpg",
      category: 'local',
      tags: ['Referee', 'VAR', 'Kenya', 'Funny'],
      likes: 456,
      shares: 234,
      createdBy: "Referee Memes",
      isLocal: true
    },
    {
      id: '4',
      title: "CAF Champions League",
      description: "When your team finally qualifies after 20 years 🎉",
      imageUrl: "/memes/caf-champions.jpg",
      category: 'african',
      tags: ['CAF', 'Champions League', 'Qualification', 'Africa'],
      likes: 678,
      shares: 345,
      createdBy: "African Football",
      isLocal: false
    },
    {
      id: '5',
      title: "Transfer Window Madness",
      description: "Kenyan clubs announcing 50 new signings in one day 😱",
      imageUrl: "/memes/transfer-window.jpg",
      category: 'local',
      tags: ['Transfers', 'Kenya', 'Clubs', 'Signings'],
      likes: 345,
      shares: 178,
      createdBy: "Transfer News KE",
      isLocal: true
    }
  ];

  useEffect(() => {
    if (quotes.length > 0) {
      setCurrentQuote(quotes[0]);
    }
    if (memes.length > 0) {
      setCurrentMeme(memes[0]);
    }
  }, []);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setCurrentQuote(quotes[randomIndex]);
  };

  const getRandomMeme = () => {
    const randomIndex = Math.floor(Math.random() * memes.length);
    setCurrentMeme(memes[randomIndex]);
  };

  const handleQuoteLike = (quoteId: string) => {
    setLikedQuotes(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(quoteId)) {
        newLiked.delete(quoteId);
      } else {
        newLiked.add(quoteId);
      }
      return newLiked;
    });
  };

  const handleMemeLike = (memeId: string) => {
    setLikedMemes(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(memeId)) {
        newLiked.delete(memeId);
      } else {
        newLiked.add(memeId);
      }
      return newLiked;
    });
  };

  const copyQuote = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedQuote(text);
      setTimeout(() => setCopiedQuote(null), 2000);
    } catch (err) {
      console.error('Failed to copy quote:', err);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'motivational': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'funny': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'philosophical': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'tactical': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getRegionIcon = (region: string) => {
    switch (region) {
      case 'Kenya': return '🇰🇪';
      case 'Africa': return '🌍';
      case 'Global': return '🌐';
      default: return '🌍';
    }
  };

  return (
    <Card className="bg-gradient-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Quote className="w-6 h-6 text-primary" />
          Quotes & Memes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'quotes' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('quotes')}
            className="flex-1"
          >
            <Quote className="w-4 h-4 mr-2" />
            Famous Quotes
          </Button>
          <Button
            variant={activeTab === 'memes' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('memes')}
            className="flex-1"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Local Memes
          </Button>
        </div>

        {/* Quotes Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'quotes' && currentQuote && (
            <motion.div
              key={currentQuote.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <Quote className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                  <blockquote className="text-xl font-medium text-gray-800 mb-4 leading-relaxed">
                    "{currentQuote.text}"
                  </blockquote>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="font-semibold text-gray-700">— {currentQuote.author}</span>
                    <span className="text-lg">{getRegionIcon(currentQuote.region)}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Badge variant="outline" className={getCategoryColor(currentQuote.category)}>
                      {currentQuote.category}
                    </Badge>
                    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                      {currentQuote.language}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuoteLike(currentQuote.id)}
                      className={`gap-2 ${
                        likedQuotes.has(currentQuote.id) ? 'text-red-500' : 'text-gray-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${
                        likedQuotes.has(currentQuote.id) ? 'fill-current' : ''
                      }`} />
                      {currentQuote.likes + (likedQuotes.has(currentQuote.id) ? 1 : 0)}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyQuote(currentQuote.text)}
                      className="gap-2 text-gray-500"
                    >
                      {copiedQuote === currentQuote.text ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {copiedQuote === currentQuote.text ? 'Copied!' : 'Copy'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowShareModal(true)}
                      className="gap-2 text-gray-500"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="text-center mt-4">
                <Button onClick={getRandomQuote} variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  New Quote
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Memes Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'memes' && currentMeme && (
            <motion.div
              key={currentMeme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {currentMeme.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{currentMeme.description}</p>
                  </div>
                  
                  {/* Meme Image Placeholder */}
                  <div className="bg-gradient-to-br from-yellow-200 to-orange-200 rounded-lg p-8 text-center mb-4">
                    <div className="text-6xl mb-2">😂</div>
                <p className="text-gray-600 text-sm">
                  {currentMeme.imageUrl ? 'Meme Image' : 'Local Kenyan Football Meme'}
                </p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={currentMeme.isLocal ? 'default' : 'secondary'}>
                        {currentMeme.isLocal ? '🇰🇪 Local' : '🌍 African'}
                      </Badge>
                      <Badge variant="outline">{currentMeme.category}</Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      by {currentMeme.createdBy}
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentMeme.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMemeLike(currentMeme.id)}
                        className={`gap-2 ${
                          likedMemes.has(currentMeme.id) ? 'text-red-500' : 'text-gray-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${
                          likedMemes.has(currentMeme.id) ? 'fill-current' : ''
                        }`} />
                        {currentMeme.likes + (likedMemes.has(currentMeme.id) ? 1 : 0)}
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="gap-2 text-gray-500">
                        <MessageCircle className="w-4 h-4" />
                        {currentMeme.shares}
                      </Button>
                    </div>
                    
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="text-center mt-4">
                <Button onClick={getRandomMeme} variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Next Meme
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowShareModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-background p-6 rounded-lg max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-4">Share This Quote</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start gap-3" variant="outline">
                    <span className="text-blue-500">📘</span>
                    Share on Facebook
                  </Button>
                  <Button className="w-full justify-start gap-3" variant="outline">
                    <span className="text-blue-400">🐦</span>
                    Share on Twitter
                  </Button>
                  <Button className="w-full justify-start gap-3" variant="outline">
                    <span className="text-green-500">📱</span>
                    Share on WhatsApp
                  </Button>
                  <Button className="w-full justify-start gap-3" variant="outline">
                    <span className="text-red-500">📷</span>
                    Share on Instagram
                  </Button>
                </div>
                <Button 
                  onClick={() => setShowShareModal(false)} 
                  className="w-full mt-4"
                >
                  Close
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default FootballQuotesAndMemes;
