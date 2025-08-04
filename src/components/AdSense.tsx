import { useEffect } from 'react'

interface AdSenseProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  className?: string
  style?: React.CSSProperties
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export function AdSense({ adSlot, adFormat = 'auto', className = '', style }: AdSenseProps) {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  // Don't render ads in development
  if (import.meta.env.DEV) {
    return (
      <div className={`bg-muted/20 border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-muted-foreground text-sm p-4 ${className}`} style={style}>
        AdSense Ad Placeholder (Dev Mode)
      </div>
    )
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block', ...style }}
      data-ad-client="ca-pub-YOUR_PUBLISHER_ID" // Replace with your AdSense publisher ID
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
    />
  )
}

// Predefined ad components for common placements
export function BannerAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="YOUR_BANNER_AD_SLOT"
      adFormat="horizontal"
      className={className}
      style={{ minHeight: '90px' }}
    />
  )
}

export function SidebarAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="YOUR_SIDEBAR_AD_SLOT"
      adFormat="vertical"
      className={className}
      style={{ minHeight: '250px', width: '300px' }}
    />
  )
}

export function InArticleAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="YOUR_IN_ARTICLE_AD_SLOT"
      adFormat="rectangle"
      className={className}
      style={{ minHeight: '250px' }}
    />
  )
}

export function MobileAd({ className }: { className?: string }) {
  return (
    <AdSense
      adSlot="YOUR_MOBILE_AD_SLOT"
      adFormat="auto"
      className={className}
      style={{ minHeight: '50px' }}
    />
  )
}