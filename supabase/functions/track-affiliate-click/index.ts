import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  trackingCode: string
  userAgent?: string
  referrer?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { trackingCode, userAgent, referrer }: RequestBody = await req.json()

    if (!trackingCode) {
      return new Response(
        JSON.stringify({ error: 'Tracking code is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Processing affiliate click for tracking code:', trackingCode)

    // Find the affiliate link
    const { data: affiliateLink, error: linkError } = await supabaseClient
      .from('affiliate_links')
      .select(`
        id,
        affiliate_id,
        original_url,
        is_active,
        affiliates (
          id,
          status
        )
      `)
      .eq('tracking_code', trackingCode)
      .eq('is_active', true)
      .single()

    if (linkError || !affiliateLink) {
      console.error('Affiliate link not found:', linkError)
      return new Response(
        JSON.stringify({ error: 'Invalid tracking code' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if affiliate is approved
    if (affiliateLink.affiliates?.status !== 'approved') {
      console.error('Affiliate not approved')
      return new Response(
        JSON.stringify({ error: 'Affiliate not approved' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get client IP and other details
    const clientIP = req.headers.get('CF-Connecting-IP') || 
                    req.headers.get('X-Forwarded-For') || 
                    req.headers.get('X-Real-IP') || 
                    'unknown'

    // Parse user agent for browser and device info
    const parseUserAgent = (ua: string) => {
      const browser = ua.includes('Chrome') ? 'Chrome' :
                     ua.includes('Firefox') ? 'Firefox' :
                     ua.includes('Safari') ? 'Safari' :
                     ua.includes('Edge') ? 'Edge' : 'Unknown'
      
      const deviceType = ua.includes('Mobile') ? 'Mobile' :
                        ua.includes('Tablet') ? 'Tablet' : 'Desktop'
      
      return { browser, deviceType }
    }

    const { browser, deviceType } = parseUserAgent(userAgent || '')

    // Record the click
    const { error: clickError } = await supabaseClient
      .from('affiliate_clicks')
      .insert({
        affiliate_id: affiliateLink.affiliate_id,
        affiliate_link_id: affiliateLink.id,
        ip_address: clientIP,
        user_agent: userAgent,
        referrer: referrer,
        browser: browser,
        device_type: deviceType,
        country: null, // Could be enhanced with IP geolocation
        city: null
      })

    if (clickError) {
      console.error('Error recording click:', clickError)
      return new Response(
        JSON.stringify({ error: 'Failed to record click' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update click count on the affiliate link
    const { error: updateError } = await supabaseClient
      .from('affiliate_links')
      .update({ 
        click_count: affiliateLink.click_count + 1 
      })
      .eq('id', affiliateLink.id)

    if (updateError) {
      console.error('Error updating click count:', updateError)
    }

    // Update total clicks on affiliate
    const { error: affiliateUpdateError } = await supabaseClient
      .from('affiliates')
      .update({ 
        total_clicks: supabaseClient.raw('total_clicks + 1')
      })
      .eq('id', affiliateLink.affiliate_id)

    if (affiliateUpdateError) {
      console.error('Error updating affiliate total clicks:', affiliateUpdateError)
    }

    console.log('Affiliate click recorded successfully')

    // Return the redirect URL
    const redirectUrl = affiliateLink.original_url || 'https://ballmtaani.com'
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        redirectUrl: redirectUrl,
        message: 'Click tracked successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})