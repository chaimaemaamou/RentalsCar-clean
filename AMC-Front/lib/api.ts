// API Service for AMC Car Rental
// Uses proxy for client-side requests in production

// Use server-side URL for SSR, proxy for browser
const getApiBaseUrl = () => {
  // Server-side rendering (inside Docker)
  if (typeof window === 'undefined') {
    return process.env.NEXT_SERVER_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081"
  }
  // Client-side (browser) - use proxy in production, direct URL in development
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_USE_PROXY === 'true') {
    return '/api/proxy'
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081"
}

export const API_BASE_URL = getApiBaseUrl()

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, message: string, body?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

// --- DTOs ---

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export enum Transmission {
  MANUAL = "MANUAL",
  AUTOMATIC = "AUTOMATIC",
}

export enum FuelType {
  GASOLINE = "GASOLINE",
  DIESEL = "DIESEL",
  ELECTRIC = "ELECTRIC",
  HYBRID = "HYBRID",
}

export interface CarRequestDto {
  model: string
  brand: string
  inventory: number
  dailyFee: number
  seats: number
  transmission: Transmission
  fuelType: FuelType
  imageUrls: string[]
}

export interface CarResponseDto {
  id: number
  model: string
  brand: string
  inventory: number
  dailyFee: number
  seats: number
  transmission: Transmission
  fuelType: FuelType
  imageGallery: string[]
}

export interface FileUploadResponseDto {
  fileName: string
  url: string
}

// Reservation method chosen at booking time (no separate payment flow)
export enum ReservationMethod {
  AGENCY = "AGENCY", // pay at agency pickup
  DELIVERY = "DELIVERY", // pay on delivery
}

export interface RentalCreateRequestDto {
  carId: number
  rentalDate: string // YYYY-MM-DD
  returnDate: string // YYYY-MM-DD
  customerName: string
  customerPhone: string
  customerEmail: string
  driverLicenseNumber: string
  paymentMethod: ReservationMethod
}

export interface RentalResponseDto {
  id: number
  carId: number
  carBrand: string
  carModel: string
  rentalDate: string
  returnDate: string
  actualReturnDate: string | null
  customerName: string
  customerPhone: string
  customerEmail: string
  driverLicenseNumber: string
  dailyRate: number
  totalDays: number
  totalPrice: number
  status: string
  paymentMethod: string
  reservationMethod?: string // legacy field kept for backward compatibility
  deliveryFee: number
}

export interface RentalStatisticsDto {
  totalActiveRentals: number
  totalCompletedRentals: number
  totalRevenue: number
  averageRentalPrice: number
  mostRentedCarBrand: string
  totalCustomers: number
}

export enum DeliveryMethod {
  AGENCY = "AGENCY",
  DELIVERY = "DELIVERY",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
}

export enum PaymentType {
  PAYMENT = "PAYMENT",
}

export interface PaymentRequestDto {
  rentalId: number
  deliveryMethod: DeliveryMethod
  deliveryCity?: string
}

export interface PaymentResponseDto {
  id: number
  rentalId: number
  amountToPay: number
  deliveryFee: number
  deliveryMethod: DeliveryMethod
  deliveryCity: string | null
  status: PaymentStatus
  type: PaymentType
  paidAt: string | null
}

// --- API Client ---

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("jwt_token")
      if (!window.location.pathname.startsWith("/manager/login")) {
        window.location.href = "/manager/login"
      }
    }
    throw new Error("Unauthorized. Redirecting to login.")
  }

  if (!response.ok) {
    const errorText = await response.text()
    let parsedBody: unknown = null

    if (errorText) {
      try {
        parsedBody = JSON.parse(errorText)
      } catch {
        parsedBody = errorText
      }
    }

    const messageFromBody =
      typeof parsedBody === "object" && parsedBody !== null && "message" in parsedBody
        ? String((parsedBody as { message?: unknown }).message)
        : null

    throw new ApiError(
      response.status,
      messageFromBody ?? (errorText || response.statusText),
      parsedBody,
    )
  }

  const text = await response.text()
  if (!text) return null

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? ""
  if (contentType.includes("application/json")) {
    return JSON.parse(text)
  }

  return text
}

const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
}

const carService = {
  getAll: async (): Promise<CarResponseDto[]> => {
    return fetchWithAuth("/cars")
  },
  getById: async (id: number): Promise<CarResponseDto> => {
    return fetchWithAuth(`/cars/${id}`)
  },
  create: async (data: CarRequestDto): Promise<CarResponseDto> => {
    return fetchWithAuth("/cars", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  update: async (id: number, data: CarRequestDto): Promise<CarResponseDto> => {
    return fetchWithAuth(`/cars/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  delete: async (id: number): Promise<void> => {
    return fetchWithAuth(`/cars/${id}`, {
      method: "DELETE",
    })
  },
}

type RentalQueryParams = {
  isActive?: boolean
  status?: "DEMANDED" | "APPROVED" | "ACTIVE" | "RETURNED"
}

const rentalService = {
  getStatistics: async (): Promise<RentalStatisticsDto> => {
    return fetchWithAuth("/rentals/statistics")
  },
  create: async (data: RentalCreateRequestDto): Promise<RentalResponseDto> => {
    return fetchWithAuth("/rentals", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  getAll: async (filters?: RentalQueryParams): Promise<RentalResponseDto[]> => {
    const params = new URLSearchParams()
    if (filters?.isActive !== undefined) params.append("is_active", String(filters.isActive))
    if (filters?.status) params.append("status", filters.status)
    const query = params.toString() ? `?${params.toString()}` : ""
    return fetchWithAuth(`/rentals${query}`)
  },
  getArchived: async (): Promise<RentalResponseDto[]> => {
    return fetchWithAuth("/rentals/archived")
  },
  getById: async (id: number): Promise<RentalResponseDto> => {
    return fetchWithAuth(`/rentals/${id}`)
  },
  returnCar: async (id: number): Promise<void> => {
    return fetchWithAuth(`/rentals/${id}/return`, {
      method: "POST",
    })
  },
  approve: async (id: number): Promise<void> => {
    return fetchWithAuth(`/rentals/${id}/approve`, {
      method: "POST",
    })
  },
  updatePricing: async (id: number, totalPrice: number): Promise<RentalResponseDto> => {
    return fetchWithAuth(`/rentals/${id}/pricing`, {
      method: "PATCH",
      body: JSON.stringify({ totalPrice }),
    })
  },
  activate: async (id: number): Promise<void> => {
    return fetchWithAuth(`/rentals/${id}/activate`, {
      method: "POST",
    })
  },
  delete: async (id: number): Promise<void> => {
    return fetchWithAuth(`/rentals/${id}`, {
      method: "DELETE",
    })
  },
}

// Payments endpoints not used in current front-end workflow (handled at reservation time)

const paymentService = {
  create: async (rentalId: number, deliveryMethod: DeliveryMethod, deliveryCity?: string): Promise<PaymentResponseDto> => {
    const qs = `?rentalId=${rentalId}&deliveryMethod=${deliveryMethod}${deliveryCity ? `&deliveryCity=${encodeURIComponent(deliveryCity)}` : ""}`
    return fetchWithAuth(`/payments${qs}`, {
      method: "POST",
    })
  },
  markPaid: async (paymentId: number): Promise<PaymentResponseDto> => {
    return fetchWithAuth(`/payments/${paymentId}/mark-paid`, {
      method: "POST",
    })
  },
  getById: async (paymentId: number): Promise<PaymentResponseDto> => {
    return fetchWithAuth(`/payments/${paymentId}`)
  },
  findByRental: async (rentalId: number): Promise<PaymentResponseDto[]> => {
    return fetchWithAuth(`/payments/by-rental/${rentalId}`)
  },
}

const mediaService = {
  upload: async (files: FileList | File[]): Promise<FileUploadResponseDto[]> => {
    const formData = new FormData()
    const normalizedFiles = Array.isArray(files) ? files : Array.from(files ?? [])
    normalizedFiles.forEach((file) => {
      formData.append("files", file)
    })
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null
    const response = await fetch("/api/files/upload", {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })
    if (!response.ok) {
      throw new Error(await response.text())
    }
    return response.json()
  },
}

export const api = {
  auth: authService,
  cars: carService,
  rentals: rentalService,
  payments: paymentService,
  media: mediaService,
}
