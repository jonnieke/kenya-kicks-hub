import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"

export function AffiliateRedirect() {
  const [searchParams] = useSearchParams()
  const refCode = searchParams.get('ref')

  useEffect(() => {
    if (refCode) {
      trackAffiliateClick(refCode)
    }
  }, [refCode])

  const trackAffiliateClick = async (trackingCode: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('track-affiliate-click', {
        body: {
          trackingCode,
          userAgent: navigator.userAgent,
          referrer: document.referrer
        }
      })

      if (error) {
        console.error('Error tracking affiliate click:', error)
        return
      }

      console.log('Affiliate click tracked:', data)
      
      // Store the tracking code in sessionStorage for potential conversion tracking
      sessionStorage.setItem('affiliate_ref', trackingCode)
      
    } catch (error) {
      console.error('Error in affiliate tracking:', error)
    }
  }

  // This component doesn't render anything visible
  return null
}