import { useState } from "react"
import { Home, Activity, Newspaper, TrendingUp, Brain, MessageCircle, Trophy, Users, LogOut, User } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Scores", url: "/live-scores", icon: Activity },
  { title: "News", url: "/news", icon: Newspaper },
  { title: "Predictions", url: "/predictions", icon: TrendingUp },
  { title: "Quizzes", url: "/quizzes", icon: Brain },
  { title: "Chat", url: "/chat", icon: MessageCircle },
  { title: "Leagues", url: "/leagues", icon: Trophy },
  { title: "Community", url: "/community", icon: Users },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"
  const { user, signOut } = useAuth()

  const isActive = (path: string) => currentPath === path
  const isExpanded = items.some((i) => isActive(i.url))
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "hover:bg-sidebar-accent/50"

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-background" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-lg text-sidebar-foreground">FootballKE</h2>
                <p className="text-xs text-sidebar-foreground/60">Kenyan Football Hub</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Football Hub</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        {user && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-sidebar-foreground/60">Admin</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <Button
                onClick={signOut}
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        )}

        {/* Auth Link for non-authenticated users */}
        {!user && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <Button asChild className="w-full">
              <NavLink to="/auth">
                <User className="w-4 h-4 mr-2" />
                {!isCollapsed ? "Sign In" : ""}
              </NavLink>
            </Button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}