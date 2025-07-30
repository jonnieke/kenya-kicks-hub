import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Users, Clock } from "lucide-react"

const chatRooms = [
  {
    id: 1,
    name: "Premier League Discussion",
    participants: 234,
    lastMessage: "What a goal by Haaland!",
    timeAgo: "2m ago",
    isActive: true
  },
  {
    id: 2,
    name: "Harambee Stars Fan Club",
    participants: 89,
    lastMessage: "Next match against Uganda will be crucial",
    timeAgo: "15m ago",
    isActive: false
  },
  {
    id: 3,
    name: "Gor Mahia Supporters",
    participants: 156,
    lastMessage: "K'Ogalo till I die! 💚",
    timeAgo: "1h ago",
    isActive: false
  }
]

const messages = [
  {
    id: 1,
    user: "FootballFanatic",
    message: "Did you guys see that Arsenal performance yesterday?",
    time: "10:30 AM",
    isOwn: false
  },
  {
    id: 2,
    user: "You",
    message: "Absolutely brilliant! Odegaard was on fire 🔥",
    time: "10:32 AM",
    isOwn: true
  },
  {
    id: 3,
    user: "GoMahiaFan",
    message: "Can't wait for the Mashemeji Derby this weekend",
    time: "10:35 AM",
    isOwn: false
  }
]

const Chat = () => {
  const [newMessage, setNewMessage] = useState("")
  const [selectedRoom, setSelectedRoom] = useState(1)

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      setNewMessage("")
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Community Chat</h1>
            <p className="text-muted-foreground">Connect with fellow football fans</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 h-[600px]">
          {/* Chat Rooms */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Chat Rooms</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {chatRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedRoom === room.id 
                        ? "bg-primary/20 border-r-2 border-primary" 
                        : "hover:bg-background/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{room.name}</h3>
                        {room.isActive && (
                          <div className="w-2 h-2 bg-football-green rounded-full animate-pulse" />
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {room.participants}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{room.lastMessage}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{room.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <div className="md:col-span-2">
            <Card className="bg-gradient-card border-border h-full flex flex-col">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {chatRooms.find(room => room.id === selectedRoom)?.name}
                  </CardTitle>
                  <Badge className="bg-football-green text-background">
                    <Users className="w-3 h-3 mr-1" />
                    {chatRooms.find(room => room.id === selectedRoom)?.participants} online
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {!message.isOwn && (
                          <div className="text-xs font-medium text-accent mb-1">
                            {message.user}
                          </div>
                        )}
                        <div className="text-sm">{message.message}</div>
                        <div className={`text-xs mt-1 ${
                          message.isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>
                          {message.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} className="bg-gradient-primary">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat