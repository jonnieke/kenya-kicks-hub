import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Copy, Plus, ExternalLink, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AffiliateApplication } from "@/components/AffiliateApplication"
import { AffiliateStats } from "@/components/AffiliateStats"
import { AffiliateLinkManager } from "@/components/AffiliateLinkManager"

interface Affiliate {
  id: string
  user_id: string
  company_name: string
  contact_email: string
  affiliate_code: string
  status: string
  commission_rate: number
  total_clicks: number
  total_conversions: number
  total_earnings: number
  created_at: string
}

export default function Affiliates() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAffiliate()
    }
  }, [user])

  const fetchAffiliate = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle()

      if (error) throw error
      setAffiliate(data)
    } catch (error) {
      console.error('Error fetching affiliate:', error)
      toast({
        title: "Error",
        description: "Failed to load affiliate data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-success-foreground'
      case 'pending':
        return 'bg-warning text-warning-foreground'
      case 'rejected':
        return 'bg-destructive text-destructive-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access the affiliate program.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!affiliate) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Join Our Affiliate Program
              </CardTitle>
              <CardDescription>
                Earn commissions by promoting FootballKE to your audience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AffiliateApplication onSuccess={fetchAffiliate} />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {affiliate.company_name}
          </p>
        </div>
        <Badge className={getStatusColor(affiliate.status)}>
          {affiliate.status.charAt(0).toUpperCase() + affiliate.status.slice(1)}
        </Badge>
      </div>

      {affiliate.status === 'approved' && (
        <>
          <AffiliateStats affiliate={affiliate} />
          <AffiliateLinkManager affiliateId={affiliate.id} />
        </>
      )}

      {affiliate.status === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle>Application Under Review</CardTitle>
            <CardDescription>
              Your affiliate application is currently being reviewed by our team.
              We'll notify you via email once a decision has been made.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Company Name</Label>
                  <p>{affiliate.company_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Contact Email</Label>
                  <p>{affiliate.contact_email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Applied On</Label>
                  <p>{new Date(affiliate.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Commission Rate</Label>
                  <p>{(affiliate.commission_rate * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {affiliate.status === 'rejected' && (
        <Card>
          <CardHeader>
            <CardTitle>Application Rejected</CardTitle>
            <CardDescription>
              Unfortunately, your affiliate application was not approved at this time.
              Please contact support if you have questions.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}