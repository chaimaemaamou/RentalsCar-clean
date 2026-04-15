import type { CarResponseDto } from "@/lib/api"

const DEFAULT_API_BASE_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081"

async function fetchFromApi<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${DEFAULT_API_BASE_URL}${path}`, {
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      console.error(`Failed to fetch ${path}:`, response.status, await response.text())
      return null
    }

    return (await response.json()) as T
  } catch (error) {
    console.error(`Error fetching ${path}:`, error)
    return null
  }
}

export async function fetchCars(): Promise<CarResponseDto[]> {
  const data = await fetchFromApi<CarResponseDto[]>("/cars")
  if (!data || !Array.isArray(data)) {
    return []
  }
  return data
}

export async function fetchCarById(id: string | number): Promise<CarResponseDto | null> {
  if (!id && id !== 0) return null
  const data = await fetchFromApi<CarResponseDto>(`/cars/${id}`)
  return data
}

