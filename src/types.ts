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
  author?: string
  authorName?: string
  pay?: number
  earnings?: number
}

export interface User {
  _id: string
  username: string
  fullName: string
  role: 'Admin' | 'User'
  isActive: boolean
  payPerPost: number
  note?: string
  posts?: number
  views?: number
  earnings?: number
  createdAt?: string
}

export interface SalaryConfig {
  mode: 'per_post' | 'per_view' | 'per_unlock' | 'per_click'
  rate: number
}

export interface SiteConfig {
  siteName: string
  tagline: string
  logoUrl: string
  themeColor: string
  gateMode: string
  lockMessage: string
  unlockButtonText: string
  unlockTtlMinutes: number
  salary?: SalaryConfig
  clickDedupHours: number
  contact: { facebook: string; tiktok: string; zalo: string }
}

export interface Overview {
  totalMedia: number
  published: number
  totalViews: number
  totalUnlocks: number
  totalClicks: number
  rawClicks?: number
  totalEarnings: number
  topMedia: Array<{ _id: string; title: string; type: string; views: number; unlocks: number; clicks: number; authorName?: string; earnings?: number }>
  byUser?: Array<{ id: string; name: string; posts: number; views: number; earnings: number }>
}
