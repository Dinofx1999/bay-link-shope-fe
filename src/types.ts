export interface AffiliateLink {
  _id?: string
  index?: number
  label: string
  url?: string
  clicks?: number
}

export interface GalleryItem {
  type: 'image' | 'video'
  url: string
}

export interface MediaItem {
  _id: string
  title: string
  description: string
  type: 'image' | 'video'
  media?: GalleryItem[]
  mediaCount?: number
  mediaUrl?: string
  thumbnailUrl: string
  affiliateLinks: AffiliateLink[]
  tags: string[]
  isPublished: boolean
  pinned: boolean
  views: number
  unlocks: number
  order?: number
  locked?: boolean
  createdAt?: string
}

export interface SiteConfig {
  siteName: string
  tagline: string
  logoUrl: string
  themeColor: string
  gateMode: string
  lockMessage: string
  unlockButtonText: string
  contact: { facebook: string; tiktok: string; zalo: string }
}

export interface Overview {
  totalMedia: number
  published: number
  totalViews: number
  totalUnlocks: number
  totalClicks: number
  topMedia: Array<{ _id: string; title: string; type: string; views: number; unlocks: number; clicks: number }>
}
