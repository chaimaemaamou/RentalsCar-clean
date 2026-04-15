"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Car,
  CalendarDays,
  CreditCard,
  Users,
  Plus,
  X,
  Trash,
  Gauge,
  PieChart,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n-context"
import { api, Transmission, FuelType, type CarResponseDto, type RentalStatisticsDto } from "@/lib/api"
import { getStoredJwt, isJwtExpired } from "@/lib/jwt"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface CarFormState {
  brand: string
  model: string
  seats: number
  transmission: Transmission | ""
  fuelType: FuelType | ""
  dailyFee: number
  inventory: number
}

const initialCarForm: CarFormState = {
  brand: "",
  model: "",
  seats: 5,
  transmission: "",
  fuelType: "",
  dailyFee: 0,
  inventory: 1,
}

export default function ManagerDashboardPage() {
  const { t } = useI18n()
  const router = useRouter()
  const { toast } = useToast()
  const [cars, setCars] = useState<CarResponseDto[]>([])
  const [loadingCars, setLoadingCars] = useState(true)
  const [carError, setCarError] = useState<string | null>(null)
  const [statistics, setStatistics] = useState<RentalStatisticsDto | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [showCarPanel, setShowCarPanel] = useState(false)
  const [form, setForm] = useState<CarFormState>(initialCarForm)
  const [submitting, setSubmitting] = useState(false)
  const [tokenChecked, setTokenChecked] = useState(false)

  useEffect(() => {
    const token = getStoredJwt()
    if (!token || isJwtExpired(token)) {
      router.replace("/manager/login")
      return
    }
    setTokenChecked(true)
  }, [router])

  useEffect(() => {
    if (!tokenChecked) return
    let active = true
    ;(async () => {
      try {
        setLoadingCars(true)
        const list = await api.cars.getAll()
        if (!active) return
        setCars(list)
        setCarError(null)
      } catch (e: any) {
        if (active) setCarError(e.message || "Failed to load cars")
      } finally {
        if (active) setLoadingCars(false)
      }
    })()
    return () => {
      active = false
    }
  }, [tokenChecked])

  useEffect(() => {
    if (!tokenChecked) return
    let active = true
    ;(async () => {
      try {
        const data = await api.rentals.getStatistics()
        if (!active) return
        setStatistics(data)
        setStatsError(null)
      } catch (e: any) {
        if (active) setStatsError(e.message || "Failed to load statistics")
      }
    })()
    return () => {
      active = false
    }
  }, [tokenChecked])

  function updateForm<K extends keyof CarFormState>(key: K, value: CarFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.brand || !form.model || !form.transmission || !form.fuelType) {
      toast({ title: "Missing fields", description: "Fill required fields", variant: "destructive" })
      return
    }
    setSubmitting(true)
    try {
      const created = await api.cars.create({
        brand: form.brand,
        model: form.model,
        seats: form.seats,
        transmission: form.transmission as Transmission,
        fuelType: form.fuelType as FuelType,
        dailyFee: form.dailyFee,
        inventory: form.inventory,
      })
      setCars((prev) => [created, ...prev])
      setForm(initialCarForm)
      toast({ title: "Car created", description: `${created.brand} ${created.model} added.` })
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this car?")) return
    try {
      await api.cars.delete(id)
      setCars((prev) => prev.filter((c) => c.id !== id))
      toast({ title: "Car deleted", description: `ID ${id} removed.` })
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" })
    }
  }

  const totalFleet = cars.length
  const totalInventory = useMemo(() => cars.reduce((sum, car) => sum + (car.inventory ?? 0), 0), [cars])
  const activeRentals = statistics?.totalActiveRentals ?? 0
  const completedRentals = statistics?.totalCompletedRentals ?? 0
  const totalRevenue = Number(statistics?.totalRevenue ?? 0)
  const averageRentalPrice = Number(statistics?.averageRentalPrice ?? 0)
  const totalCustomers = statistics?.totalCustomers ?? 0
  const mostRentedBrand = statistics?.mostRentedCarBrand ?? "N/A"
  const availableFleet = Math.max(totalInventory - activeRentals, 0)
  const statusTotal = activeRentals + completedRentals
  const activePercent = statusTotal > 0 ? Math.round((activeRentals / statusTotal) * 100) : 0
  const completedPercent = statusTotal > 0 ? Math.round((completedRentals / statusTotal) * 100) : 0

  const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value)
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-MA", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(value)

  const brandUtilization = useMemo(() => {
    const counts = new Map<string, number>()
    cars.forEach((car) => {
      counts.set(car.brand, (counts.get(car.brand) ?? 0) + (car.inventory ?? 0))
    })
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label, value]) => ({
        label,
        value,
        percent: totalInventory > 0 ? Math.round((value / totalInventory) * 100) : 0,
      }))
  }, [cars, totalInventory])

  const statCards = [
    {
      title: "Fleet in stock",
      value: formatNumber(totalFleet),
      icon: Car,
      change: `${formatNumber(totalInventory)} units total`,
    },
    {
      title: "Active rentals",
      value: formatNumber(activeRentals),
      icon: CalendarDays,
      change: `Returned: ${formatNumber(completedRentals)}`,
    },
    {
      title: "Revenue",
      value: formatCurrency(totalRevenue),
      icon: CreditCard,
      change: `Average booking ${formatCurrency(averageRentalPrice)}`,
    },
    {
      title: "Customers",
      value: formatNumber(totalCustomers),
      icon: Users,
      change: `Top brand: ${mostRentedBrand}`,
    },
  ]

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/5 bg-gradient-to-br from-black via-[#090909] to-[#030303] p-8 text-white shadow-2xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-primary/80">Manager Overview</p>
            <div>
              <h1 className="text-4xl font-display font-bold tracking-tight">{t("dashboard.title")}</h1>
              <p className="text-white/60 mt-2 max-w-xl">
                Monitor fleet performance, rentals, and revenue in real time. Keep clients moving with instant insights and quick car management.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1">
                <Gauge className="h-3.5 w-3.5 text-primary" /> Utilization {totalFleet > 0 ? Math.round((activeRentals / totalFleet) * 100) : 0}%
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1">
                <PieChart className="h-3.5 w-3.5 text-primary" /> Inventory {formatNumber(totalInventory)} units
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> 24h concierge active
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-primary/60 text-primary hover:bg-primary/10"
              onClick={() => setShowCarPanel((s) => !s)}
            >
              {showCarPanel ? (
                <>
                  <X className="mr-2 h-4 w-4" /> Close car manager
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Manage fleet
                </>
              )}
            </Button>
          </div>
        </div>
        {statsError && <p className="mt-4 text-sm text-red-400">{statsError}</p>}
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-white/10 bg-black/40 text-white backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/70">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stat.value}</div>
              <p className="text-xs text-white/50 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="col-span-4 border-white/10 bg-black/40 text-white backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Status focus</CardTitle>
            <p className="text-sm text-white/60">Active vs returned rentals</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Active rentals</span>
              <span className="font-semibold text-primary">{formatNumber(activeRentals)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>Returned rentals</span>
              <span className="font-semibold text-emerald-400">{formatNumber(completedRentals)}</span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400" style={{ width: `${activePercent}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>Active {activePercent}%</span>
              <span>Returned {completedPercent}%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 border-white/10 bg-black/40 text-white backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Top brands</CardTitle>
            <p className="text-sm text-white/60">Based on current inventory</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {brandUtilization.length === 0 && <p className="text-sm text-white/60">Add cars to view brand trends.</p>}
            {brandUtilization.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>{item.label}</span>
                  <span className="font-semibold">{item.percent}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary/40" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {showCarPanel && (
        <Card className="border-white/10 bg-black/40 text-white backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Car Management</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-4 mb-8">
              <div className="grid md:grid-cols-3 gap-4">
                <Input placeholder="Brand" value={form.brand} onChange={(e) => updateForm("brand", e.target.value)} />
                <Input placeholder="Model" value={form.model} onChange={(e) => updateForm("model", e.target.value)} />
                <Input type="number" placeholder="Seats" value={form.seats} onChange={(e) => updateForm("seats", Number(e.target.value))} />
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <Input type="number" placeholder="Daily Fee (MAD)" value={form.dailyFee} onChange={(e) => updateForm("dailyFee", Number(e.target.value))} />
                <Input type="number" placeholder="Inventory" value={form.inventory} onChange={(e) => updateForm("inventory", Number(e.target.value))} />
                <select
                  className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
                  value={form.transmission}
                  onChange={(e) => updateForm("transmission", e.target.value as Transmission | "")}
                >
                  <option value="">Transmission</option>
                  {Object.values(Transmission).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <select
                  className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm"
                  value={form.fuelType}
                  onChange={(e) => updateForm("fuelType", e.target.value as FuelType | "")}
                >
                  <option value="">Fuel Type</option>
                  {Object.values(FuelType).map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={submitting} className="bg-primary text-black hover:bg-primary/90">
                {submitting ? "Creating..." : "Create Car"}
              </Button>
            </form>
            {loadingCars && <p className="text-muted-foreground">Loading cars...</p>}
            {carError && !loadingCars && <p className="text-red-400">{carError}</p>}
            {!loadingCars && !carError && cars.length === 0 && <p className="text-muted-foreground">No cars found.</p>}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => (
                <Card key={car.id} className="bg-white/5 border border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex justify-between items-center">
                      <span>
                        {car.brand} {car.model}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(car.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-400/10"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1 text-muted-foreground">
                    <p>Fee: MAD {car.dailyFee}</p>
                    <p>Seats: {car.seats}</p>
                    <p>Transmission: {car.transmission}</p>
                    <p>Fuel: {car.fuelType}</p>
                    <p>Inventory: {car.inventory}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="col-span-4 border-white/10 bg-black/40 text-white backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Fleet inventory snapshot</CardTitle>
            <p className="text-sm text-white/60">Latest cars in the system.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {cars.slice(0, 5).map((car) => (
              <div key={car.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold">
                    {car.brand} {car.model}
                  </p>
                  <p className="text-white/50 text-xs">
                    Seats {car.seats} · {car.transmission} · {car.fuelType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-primary font-semibold">MAD {car.dailyFee}</p>
                  <p className="text-white/50 text-xs">{car.inventory} units</p>
                </div>
              </div>
            ))}
            {cars.length === 0 && <p className="text-sm text-white/60">Add cars to build your fleet.</p>}
          </CardContent>
        </Card>
        <Card className="col-span-3 border-white/10 bg-black/40 text-white backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <p className="text-sm text-white/60">Real-time unit status.</p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Available</span>
              <span className="font-semibold text-emerald-400">{formatNumber(availableFleet)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>With clients</span>
              <span className="font-semibold text-primary">{formatNumber(activeRentals)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total returned</span>
              <span className="font-semibold text-white">{formatNumber(completedRentals)}</span>
            </div>
            <div className="mt-4 h-3 w-full rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-primary" style={{ width: `${totalInventory > 0 ? (availableFleet / totalInventory) * 100 : 0}%` }} />
            </div>
            <p className="text-xs text-white/50">Inventory sourced from live car records.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
