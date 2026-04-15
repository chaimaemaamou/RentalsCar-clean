// Utility helpers for working with JWT tokens stored in localStorage

export interface DecodedJwt {
  header: any
  payload: {
    sub?: string
    exp?: number
    iat?: number
    iss?: string
    roles?: string[] | string
    [key: string]: any
  }
  signature: string
}

function base64UrlDecode(segment: string): string {
  try {
    const s = segment.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = typeof window === "undefined" ? Buffer.from(s, "base64").toString("utf8") : atob(s)
    return decoded
  } catch {
    return "{}"
  }
}

export function decodeJwt(token: string): DecodedJwt | null {
  if (!token) return null
  const parts = token.split(".")
  if (parts.length !== 3) return null
  const [headerB64, payloadB64, signature] = parts
  try {
    const headerJson = base64UrlDecode(headerB64)
    const payloadJson = base64UrlDecode(payloadB64)
    return {
      header: JSON.parse(headerJson),
      payload: JSON.parse(payloadJson),
      signature,
    }
  } catch {
    return null
  }
}

export function getStoredJwt(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("jwt_token")
}

export function getJwtClaims(): DecodedJwt["payload"] | null {
  const token = getStoredJwt()
  const decoded = token ? decodeJwt(token) : null
  return decoded?.payload || null
}

export function isJwtExpired(token: string): boolean {
  const decoded = decodeJwt(token)
  if (!decoded?.payload.exp) return false
  const nowSeconds = Math.floor(Date.now() / 1000)
  return nowSeconds >= decoded.payload.exp
}

export function isAuthenticated(): boolean {
  const token = getStoredJwt()
  if (!token) return false
  return !isJwtExpired(token)
}
