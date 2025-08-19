import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DiscussionForum } from "@/components/DiscussionForum";
import { PollsAndVotes } from "@/components/PollsAndVotes";
import { ProfileManager } from "@/components/ProfileManager";
import { FootballGames } from "@/components/FootballGames";
import { FootballQuotesAndMemes } from "@/components/FootballQuotesAndMemes";
import { CommunityChallenges } from "@/components/CommunityChallenges";
import { 
  Users, 
  MessageCircle, 
  ThumbsUp, 
  Share, 
  TrendingUp,
  Calendar,
  Trophy,
  Star,
  Send,
  Gamepad2,
  Quote,
  Target
} from "lucide-react";

const Community = () => {
  const [newPost, setNewPost] = useState("");

  const posts = [
    {
      id: 1,
      author: {
        name: "Ahmed Hassan",
        avatar: "AH",
        role: "Top Contributor"
      },
      content: "What are your predictions for this weekend's CAF Champions League matches? Al Ahly looking strong! 🔥",
      timestamp: "2 hours ago",
      likes: 23,
      comments: 8,
      trending: true
    },
    {
      id: 2,
      author: {
        name: "Sarah Mohammed",
        avatar: "SM",
        role: "Quiz Master"
      },
      content: "Just completed the African Football Quiz and scored 95%! Who else is taking the challenge? 🏆",
      timestamp: "4 hours ago",
      likes: 31,
      comments: 12
    },
    {
      id: 3,
      author: {
        name: "David Okafor",
        avatar: "DO",
        role: "Live Match Expert"
      },
      content: "Live from the stadium! The atmosphere here for Nigeria vs South Africa is electric! ⚡",
      timestamp: "6 hours ago",
      likes: 45,
      comments: 19
    }
  ];

  const topContributors = [
    { name: "Ahmed Hassan", posts: 124, likes: 1250, avatar: "AH" },
    { name: "Sarah Mohammed", posts: 89, likes: 890, avatar: "SM" },
    { name: "David Okafor", posts: 67, likes: 720, avatar: "DO" },
    { name: "Fatima Al-Zahra", posts: 45, likes: 580, avatar: "FZ" },
  ];

  const upcomingEvents = [
    {
      title: "CAF Champions League Final Watch Party",
      date: "This Saturday",
      participants: 45
    },
    {
      title: "African Football Trivia Night",
      date: "Next Tuesday",
      participants: 32
    },
    {
      title: "AFCON 2025 Predictions Contest",
      date: "Next Week",
      participants: 128
    }
  ];

  const handlePostSubmit = () => {
    if (newPost.trim()) {
      // Here you would typically send the post to your backend
      console.log("New post:", newPost);
      setNewPost("");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Community Hub</h1>
            <p className="text-muted-foreground">Connect, discuss, and share your passion for African football</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="feed">Community Feed</TabsTrigger>
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
                <TabsTrigger value="polls">Polls & Votes</TabsTrigger>
                <TabsTrigger value="games">🎮 Games</TabsTrigger>
                <TabsTrigger value="quotes">💬 Quotes</TabsTrigger>
                <TabsTrigger value="challenges">🏆 Challenges</TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-6">
                {/* Create Post */}
                <Card className="bg-gradient-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Share with the Community</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="What's on your mind about African football?"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="min-h-[100px] bg-background/50"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <Badge variant="secondary">🏆 Predictions</Badge>
                        <Badge variant="secondary">⚽ Match Discussion</Badge>
                        <Badge variant="secondary">📊 Analysis</Badge>
                      </div>
                      <Button onClick={handlePostSubmit} disabled={!newPost.trim()}>
                        <Send className="w-4 h-4 mr-2" />
                        Post
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts Feed */}
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id} className="bg-gradient-card border-border hover:border-primary/50 transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {post.author.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{post.author.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {post.author.role}
                              </Badge>
                              {post.trending && (
                                <Badge variant="secondary" className="text-xs">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Trending
                                </Badge>
                              )}
                              <span className="text-muted-foreground text-sm">{post.timestamp}</span>
                            </div>
                            <p className="text-foreground">{post.content}</p>
                            <div className="flex items-center gap-4">
                              <Button variant="ghost" size="sm" className="gap-2">
                                <ThumbsUp className="w-4 h-4" />
                                {post.likes}
                              </Button>
                              <Button variant="ghost" size="sm" className="gap-2">
                                <MessageCircle className="w-4 h-4" />
                                {post.comments}
                              </Button>
                              <Button variant="ghost" size="sm" className="gap-2">
                                <Share className="w-4 h-4" />
                                Share
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="discussions" className="space-y-4">
                <DiscussionForum />
              </TabsContent>

              <TabsContent value="polls" className="space-y-4">
                <PollsAndVotes />
              </TabsContent>
              
              <TabsContent value="games" className="space-y-4">
                <FootballGames />
              </TabsContent>
              
              <TabsContent value="quotes" className="space-y-4">
                <FootballQuotesAndMemes />
              </TabsContent>
              
              <TabsContent value="challenges" className="space-y-4">
                <CommunityChallenges />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Manager */}
            <ProfileManager />
            
            {/* Top Contributors */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topContributors.map((contributor, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-muted-foreground w-4">
                        #{index + 1}
                      </span>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {contributor.avatar}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{contributor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {contributor.posts} posts • {contributor.likes} likes
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Community Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="space-y-2">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{event.date}</span>
                      <span>{event.participants} joining</span>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      Join Event
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gradient-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Members</span>
                  <span className="font-bold">2,847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posts Today</span>
                  <span className="font-bold">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Online Now</span>
                  <span className="font-bold text-green-500">324</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;