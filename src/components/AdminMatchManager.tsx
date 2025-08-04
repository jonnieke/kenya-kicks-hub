import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, Clock } from "lucide-react";

interface MatchForm {
  home_team: string;
  away_team: string;
  league: string;
  match_date: string;
  start_time: string;
  status: string;
  venue?: string;
}

export const AdminMatchManager = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MatchForm>({
    home_team: "",
    away_team: "",
    league: "",
    match_date: "",
    start_time: "",
    status: "upcoming",
    venue: ""
  });

  const handleInputChange = (field: keyof MatchForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.home_team || !formData.away_team || !formData.league || !formData.match_date) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Combine date and time for match_date and start_time
      const matchDateTime = formData.start_time 
        ? `${formData.match_date}T${formData.start_time}:00Z`
        : `${formData.match_date}T00:00:00Z`;

      const { error } = await supabase
        .from('matches')
        .insert({
          home_team: formData.home_team,
          away_team: formData.away_team,
          league: formData.league,
          match_date: matchDateTime,
          start_time: formData.start_time ? matchDateTime : null,
          status: formData.status,
          venue: formData.venue || null,
          api_match_id: `manual_${Date.now()}`
        });

      if (error) {
        console.error('Error adding match:', error);
        toast({
          title: "Error",
          description: "Failed to add match. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Match added successfully!",
      });

      // Reset form
      setFormData({
        home_team: "",
        away_team: "",
        league: "",
        match_date: "",
        start_time: "",
        status: "upcoming",
        venue: ""
      });

    } catch (error) {
      console.error('Error adding match:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickAddCAFMatches = async () => {
    setIsLoading(true);
    
    const todayMatches = [
      {
        home_team: "Congo",
        away_team: "Sudan", 
        league: "CAF African Nations Championship",
        match_date: new Date().toISOString().split('T')[0],
        start_time: "17:00",
        status: "upcoming",
        venue: "Stadium"
      },
      {
        home_team: "Senegal",
        away_team: "Nigeria",
        league: "CAF African Nations Championship", 
        match_date: new Date().toISOString().split('T')[0],
        start_time: "20:00",
        status: "upcoming",
        venue: "Stadium"
      }
    ];

    try {
      for (const match of todayMatches) {
        const matchDateTime = `${match.match_date}T${match.start_time}:00Z`;
        
        await supabase
          .from('matches')
          .insert({
            ...match,
            match_date: matchDateTime,
            start_time: matchDateTime,
            api_match_id: `manual_caf_${Date.now()}_${Math.random()}`
          });
      }

      toast({
        title: "Success",
        description: "Today's CAF matches added successfully!",
      });
    } catch (error) {
      console.error('Error adding CAF matches:', error);
      toast({
        title: "Error",
        description: "Failed to add CAF matches",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Admin: Add Match Manually
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Add Today's CAF Matches */}
        <div className="p-4 bg-primary/10 rounded-lg">
          <h3 className="font-semibold mb-2">Quick Add: Today's CAF CHAN Matches</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Add Congo vs Sudan (17:00) and Senegal vs Nigeria (20:00)
          </p>
          <Button 
            onClick={quickAddCAFMatches}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            Add Today's Matches
          </Button>
        </div>

        {/* Manual Match Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="home_team">Home Team *</Label>
              <Input
                id="home_team"
                value={formData.home_team}
                onChange={(e) => handleInputChange('home_team', e.target.value)}
                placeholder="e.g., Congo"
                required
              />
            </div>
            <div>
              <Label htmlFor="away_team">Away Team *</Label>
              <Input
                id="away_team"
                value={formData.away_team}
                onChange={(e) => handleInputChange('away_team', e.target.value)}
                placeholder="e.g., Sudan"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="league">League *</Label>
            <Select value={formData.league} onValueChange={(value) => handleInputChange('league', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select league" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CAF African Nations Championship">CAF African Nations Championship</SelectItem>
                <SelectItem value="FKF Premier League">FKF Premier League</SelectItem>
                <SelectItem value="Premier League">Premier League</SelectItem>
                <SelectItem value="La Liga">La Liga</SelectItem>
                <SelectItem value="Bundesliga">Bundesliga</SelectItem>
                <SelectItem value="Serie A">Serie A</SelectItem>
                <SelectItem value="Ligue 1">Ligue 1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="match_date" className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Match Date *
              </Label>
              <Input
                id="match_date"
                type="date"
                value={formData.match_date}
                onChange={(e) => handleInputChange('match_date', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="start_time" className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Start Time
              </Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="ft">Full Time</SelectItem>
                  <SelectItem value="ht">Half Time</SelectItem>
                  <SelectItem value="postponed">Postponed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                placeholder="Stadium name (optional)"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Adding Match..." : "Add Match"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};