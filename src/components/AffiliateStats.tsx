import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MousePointer, Users, DollarSign, TrendingUp } from "lucide-react"

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

interface AffiliateStatsProps {
  affiliate: Affiliate
}

export function AffiliateStats({ affiliate }: AffiliateStatsProps) {
  const conversionRate = affiliate.total_clicks > 0 
    ? ((affiliate.total_conversions / affiliate.total_clicks) * 100).toFixed(2)
    : '0.00'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
          <MousePointer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{affiliate.total_clicks.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            All-time link clicks
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversions</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{affiliate.total_conversions.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Successful referrals
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate}%</div>
          <p className="text-xs text-muted-foreground">
            Click to conversion ratio
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${affiliate.total_earnings.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            At {(affiliate.commission_rate * 100).toFixed(1)}% commission
          </p>
        </CardContent>
      </Card>
    </div>
  )
}