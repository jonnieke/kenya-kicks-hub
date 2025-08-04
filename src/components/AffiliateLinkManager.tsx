import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Copy, Plus, ExternalLink, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface AffiliateLink {
  id: string
  affiliate_id: string
  original_url: string
  tracking_code: string
  campaign_name: string
  is_active: boolean
  click_count: number
  conversion_count: number
  created_at: string
}

interface AffiliateLinkManagerProps {
  affiliateId: string
}

export function AffiliateLinkManager({ affiliateId }: AffiliateLinkManagerProps) {
  const { toast } = useToast()
  const [links, setLinks] = useState<AffiliateLink[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newLink, setNewLink] = useState({
    original_url: '',
    campaign_name: ''
  })

  useEffect(() => {
    fetchLinks()
  }, [affiliateId])

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLinks(data || [])
    } catch (error) {
      console.error('Error fetching links:', error)
      toast({
        title: "Error",
        description: "Failed to load affiliate links",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const createLink = async () => {
    if (!newLink.original_url || !newLink.campaign_name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    try {
      // Generate tracking code
      const { data: trackingCode, error: codeError } = await supabase
        .rpc('generate_tracking_code')

      if (codeError) throw codeError

      const { error } = await supabase
        .from('affiliate_links')
        .insert({
          affiliate_id: affiliateId,
          original_url: newLink.original_url,
          tracking_code: trackingCode,
          campaign_name: newLink.campaign_name,
          is_active: true
        })

      if (error) throw error

      toast({
        title: "Link Created",
        description: "Your affiliate link has been created successfully"
      })

      setNewLink({ original_url: '', campaign_name: '' })
      setCreateDialogOpen(false)
      fetchLinks()
    } catch (error) {
      console.error('Error creating link:', error)
      toast({
        title: "Error",
        description: "Failed to create affiliate link",
        variant: "destructive"
      })
    }
  }

  const toggleLinkStatus = async (linkId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('affiliate_links')
        .update({ is_active: !currentStatus })
        .eq('id', linkId)

      if (error) throw error

      toast({
        title: "Link Updated",
        description: `Link ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      })

      fetchLinks()
    } catch (error) {
      console.error('Error updating link:', error)
      toast({
        title: "Error",
        description: "Failed to update link status",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Link copied to clipboard"
    })
  }

  const generateAffiliateUrl = (trackingCode: string) => {
    return `${window.location.origin}?ref=${trackingCode}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Affiliate Links</CardTitle>
            <CardDescription>
              Create and manage your affiliate tracking links
            </CardDescription>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Affiliate Link</DialogTitle>
                <DialogDescription>
                  Generate a new tracking link for your campaigns
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="campaign_name">Campaign Name</Label>
                  <Input
                    id="campaign_name"
                    value={newLink.campaign_name}
                    onChange={(e) => setNewLink(prev => ({ ...prev, campaign_name: e.target.value }))}
                    placeholder="e.g., Social Media Campaign"
                  />
                </div>
                <div>
                  <Label htmlFor="original_url">Original URL (Optional)</Label>
                  <Input
                    id="original_url"
                    value={newLink.original_url}
                    onChange={(e) => setNewLink(prev => ({ ...prev, original_url: e.target.value }))}
                    placeholder="https://ballmtaani.com/specific-page"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank to use the main site URL
                  </p>
                </div>
                <Button onClick={createLink} className="w-full">
                  Create Link
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No affiliate links created yet</p>
            <p className="text-sm text-muted-foreground">Create your first link to start tracking</p>
          </div>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <div key={link.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{link.campaign_name}</h4>
                    <Badge variant={link.is_active ? "default" : "secondary"}>
                      {link.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleLinkStatus(link.id, link.is_active)}
                    >
                      {link.is_active ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <code className="flex-1 text-sm">
                      {generateAffiliateUrl(link.tracking_code)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(generateAffiliateUrl(link.tracking_code))}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(generateAffiliateUrl(link.tracking_code), '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Clicks</Label>
                      <p className="font-medium">{link.click_count}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Conversions</Label>
                      <p className="font-medium">{link.conversion_count}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Created</Label>
                      <p className="font-medium">{new Date(link.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}