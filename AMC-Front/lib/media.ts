const FALLBACK_PLACEHOLDER = "/placeholder.jpg"

// Get the base URL for media files
const getMediaBaseUrl = () => {
  // In production with proxy, use /api/proxy for media
  if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_USE_PROXY === 'true')) {
    return '/api/proxy'
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081"
}

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return FALLBACK_PLACEHOLDER
  if (/^https?:\/\//i.test(url)) return url

  // For relative URLs starting with /media/, use backend URL
  if (url.startsWith('/media/')) {
    const base = getMediaBaseUrl()
    return `${base}${url}`
  }

  // For other relative URLs, resolve normally
  const base = getMediaBaseUrl()
  if (!base) return url || FALLBACK_PLACEHOLDER
  return `${base}${url}`
}

