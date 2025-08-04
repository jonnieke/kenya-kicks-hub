import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface AffiliateApplicationProps {
  onSuccess: () => void
}

export function AffiliateApplication({ onSuccess }: AffiliateApplicationProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    company_name: '',
    contact_email: user?.email || '',
    website: '',
    marketing_channels: '',
    expected_traffic: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      // Generate affiliate code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_affiliate_code')

      if (codeError) throw codeError

      // Create affiliate application
      const { error } = await supabase
        .from('affiliates')
        .insert({
          user_id: user.id,
          company_name: formData.company_name,
          contact_email: formData.contact_email,
          affiliate_code: codeData,
          status: 'pending',
          commission_rate: 0.05 // 5% default commission
        })

      if (error) throw error

      toast({
        title: "Application Submitted",
        description: "Your affiliate application has been submitted for review."
      })

      onSuccess()
    } catch (error) {
      console.error('Error submitting application:', error)
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company_name">Company/Brand Name *</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="contact_email">Contact Email *</Label>
          <Input
            id="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="website">Website/Social Media Profile</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          placeholder="https://your-website.com"
        />
      </div>

      <div>
        <Label htmlFor="marketing_channels">Marketing Channels</Label>
        <Textarea
          id="marketing_channels"
          value={formData.marketing_channels}
          onChange={(e) => setFormData(prev => ({ ...prev, marketing_channels: e.target.value }))}
          placeholder="Describe how you plan to promote our platform (e.g., social media, blog, email marketing)"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="expected_traffic">Expected Monthly Traffic/Reach</Label>
        <Input
          id="expected_traffic"
          value={formData.expected_traffic}
          onChange={(e) => setFormData(prev => ({ ...prev, expected_traffic: e.target.value }))}
          placeholder="e.g., 10,000 monthly visitors, 5,000 social media followers"
        />
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Submitting..." : "Submit Application"}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
        <h4 className="font-medium mb-2">Program Benefits:</h4>
        <ul className="space-y-1">
          <li>• 5% commission on all referral signups</li>
          <li>• Real-time tracking and analytics</li>
          <li>• Monthly payouts</li>
          <li>• Marketing materials provided</li>
        </ul>
      </div>
    </form>
  )
}