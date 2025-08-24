import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  MapPin, 
  Phone,
  Heart,
  Trophy,
  TrendingUp,
  Users,
  MessageCircle,
  BookOpen
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground">FootballKE</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your ultimate destination for Kenyan football news, live scores, predictions, and community discussions. Stay connected with the beautiful game.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Quick Links</h4>
            <nav className="flex flex-col space-y-3">
              <Link to="/live-scores" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2">
                <TrendingUp className="h-3 w-3" />
                <span>Live Scores</span>
              </Link>
              <Link to="/news" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2">
                <BookOpen className="h-3 w-3" />
                <span>Latest News</span>
              </Link>
              <Link to="/predictions" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2">
                <Trophy className="h-3 w-3" />
                <span>Match Predictions</span>
              </Link>
              <Link to="/leagues" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2">
                <Users className="h-3 w-3" />
                <span>Leagues & Tables</span>
              </Link>
              <Link to="/community" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center space-x-2">
                <MessageCircle className="h-3 w-3" />
                <span>Community</span>
              </Link>
            </nav>
          </div>

          {/* More Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">More</h4>
            <nav className="flex flex-col space-y-3">
              <Link to="/quizzes" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Football Quizzes
              </Link>
              <Link to="/affiliates" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Affiliate Program
              </Link>
              <Link to="/chat" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                AI Chat Assistant
              </Link>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                About Us
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Contact
              </a>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Stay Updated</h4>
            <p className="text-muted-foreground text-sm">
              Get the latest football news and match updates delivered to your inbox.
            </p>
            <div className="space-y-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="h-9 text-sm"
              />
              <Button size="sm" className="w-full h-9 text-sm">
                <Mail className="h-3 w-3 mr-2" />
                Subscribe
              </Button>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2 text-muted-foreground text-xs">
                <MapPin className="h-3 w-3" />
                <span>Nairobi, Kenya</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground text-xs">
                <Mail className="h-3 w-3" />
                <span>hello@footballke.com</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-xs text-muted-foreground">
            <p className="flex items-center">
              © {currentYear} FootballKE. Made with <Heart className="h-3 w-3 mx-1 text-red-500" /> in Kenya
            </p>
          </div>
          
          <div className="flex flex-wrap items-center space-x-4 text-xs">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Cookie Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}