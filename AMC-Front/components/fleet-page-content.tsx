"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Fuel,
  Gauge,
  Users,
  ArrowRight,
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  Car,
} from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import type { CarResponseDto } from "@/lib/api"
import { api, Transmission, FuelType } from "@/lib/api"
import { useI18n } from "@/lib/i18n-context"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { RentalForm } from "@/components/rental-form"
import { resolveMediaUrl } from "@/lib/media"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

const SECURITY_DEPOSIT_MAD = 5000

type SortOption = "price-asc" | "price-desc" | "name-asc" | "seats-desc"

export function FleetPageContent() {
  const [cars, setCars] = useState<CarResponseDto[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCar, setSelectedCar] = useState<CarResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t, language } = useI18n()

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [selectedTransmission, setSelectedTransmission] = useState<string>("all")
  const [selectedFuelType, setSelectedFuelType] = useState<string>("all")
  const [selectedSeats, setSelectedSeats] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [sortBy, setSortBy] = useState<SortOption>("price-desc")
  const [showFilters, setShowFilters] = useState(false)

  // Fetch cars
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await api.cars.getAll()
        if (active) {
          setCars(data)
          // Set initial price range based on data
          if (data.length > 0) {
            const prices = data.map((c) => c.dailyFee)
            setPriceRange([Math.min(...prices), Math.max(...prices)])
          }
        }
      } catch (e: any) {
        if (active) setError(e.message || "Failed to load cars")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  // Get unique values for filters
  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(cars.map((c) => c.brand))]
    return uniqueBrands.sort()
  }, [cars])

  const seatOptions = useMemo(() => {
    const uniqueSeats = [...new Set(cars.map((c) => c.seats))]
    return uniqueSeats.sort((a, b) => a - b)
  }, [cars])

  const maxPrice = useMemo(() => {
    if (cars.length === 0) return 1000
    return Math.max(...cars.map((c) => c.dailyFee))
  }, [cars])

  const minPrice = useMemo(() => {
    if (cars.length === 0) return 0
    return Math.min(...cars.map((c) => c.dailyFee))
  }, [cars])

  // Filtered and sorted cars
  const filteredCars = useMemo(() => {
    let result = [...cars]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (car) =>
          car.brand.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query)
      )
    }

    // Brand filter
    if (selectedBrand !== "all") {
      result = result.filter((car) => car.brand === selectedBrand)
    }

    // Transmission filter
    if (selectedTransmission !== "all") {
      result = result.filter((car) => car.transmission === selectedTransmission)
    }

    // Fuel type filter
    if (selectedFuelType !== "all") {
      result = result.filter((car) => car.fuelType === selectedFuelType)
    }

    // Seats filter
    if (selectedSeats !== "all") {
      result = result.filter((car) => car.seats === parseInt(selectedSeats))
    }

    // Price range filter
    result = result.filter(
      (car) => car.dailyFee >= priceRange[0] && car.dailyFee <= priceRange[1]
    )

    // Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.dailyFee - b.dailyFee)
        break
      case "price-desc":
        result.sort((a, b) => b.dailyFee - a.dailyFee)
        break
      case "name-asc":
        result.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`))
        break
      case "seats-desc":
        result.sort((a, b) => b.seats - a.seats)
        break
    }

    return result
  }, [cars, searchQuery, selectedBrand, selectedTransmission, selectedFuelType, selectedSeats, priceRange, sortBy])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedBrand !== "all") count++
    if (selectedTransmission !== "all") count++
    if (selectedFuelType !== "all") count++
    if (selectedSeats !== "all") count++
    if (priceRange[0] > minPrice || priceRange[1] < maxPrice) count++
    return count
  }, [selectedBrand, selectedTransmission, selectedFuelType, selectedSeats, priceRange, minPrice, maxPrice])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedBrand("all")
    setSelectedTransmission("all")
    setSelectedFuelType("all")
    setSelectedSeats("all")
    setPriceRange([minPrice, maxPrice])
  }

  return (
    <main className="flex-1 pt-28 pb-20">
      {/* Hero section */}
      <section className="relative py-16 overflow-hidden">
        {/* Background with animation */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-[150px] pointer-events-none animate-pulse" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="container relative z-10 px-4 md:px-6 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in-down">
              <Car className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">{t("fleet.hero.badge")}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight animate-fade-in-up">
              {t("fleet.hero.title")}
            </h1>
            <p className="text-lg text-white/60 leading-relaxed max-w-2xl mx-auto animate-fade-in-up stagger-2">
              {t("fleet.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Filters and content */}
      <section className="container px-4 md:px-6 mx-auto">
        {/* Search and filter bar */}
        <div className="sticky top-20 z-30 bg-background/80 backdrop-blur-xl py-4 -mx-4 px-4 md:-mx-6 md:px-6 border-b border-primary/10 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60 group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder={t("fleet.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative pl-12 h-12 bg-neutral-900 border-primary/20 text-white placeholder:text-white/40 focus:border-primary/50 focus:bg-neutral-900 focus:ring-1 focus:ring-primary/20 rounded-xl transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter toggle and sort */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`h-12 rounded-xl gap-2 font-semibold transition-all duration-300 ${
                  showFilters 
                    ? "bg-primary text-black border-primary hover:bg-primary/90" 
                    : "bg-neutral-900 border-primary/20 text-white hover:border-primary/50 hover:text-primary"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t("fleet.filters")}
                {activeFiltersCount > 0 && (
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    showFilters ? "bg-black/20 text-black" : "bg-primary text-black"
                  }`}>
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="h-12 w-[180px] bg-neutral-900 border-primary/20 text-white rounded-xl hover:border-primary/40 transition-colors">
                  <SelectValue placeholder={t("fleet.sort")} />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-primary/20 text-white rounded-xl shadow-xl shadow-black/50">
                  <SelectItem value="price-desc" className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary rounded-lg">{t("fleet.sort.priceDesc")}</SelectItem>
                  <SelectItem value="price-asc" className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary rounded-lg">{t("fleet.sort.priceAsc")}</SelectItem>
                  <SelectItem value="name-asc" className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary rounded-lg">{t("fleet.sort.nameAsc")}</SelectItem>
                  <SelectItem value="seats-desc" className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary rounded-lg">{t("fleet.sort.seatsDesc")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-primary/20 animate-fade-in-down">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                {/* Brand filter */}
                <div className="space-y-2">
                  <label className="text-xs text-primary font-semibold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {t("fleet.filter.brand")}
                  </label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger className={`h-12 rounded-xl transition-all duration-300 ${
                      selectedBrand !== "all" 
                        ? "bg-primary/10 border-primary/50 text-primary ring-1 ring-primary/20" 
                        : "bg-neutral-900 border-primary/20 text-white hover:border-primary/40 hover:bg-neutral-800"
                    }`}>
                      <SelectValue placeholder={t("fleet.filter.allBrands")} />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-primary/20 text-white rounded-xl shadow-xl shadow-black/50">
                      <SelectItem value="all" className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary rounded-lg">{t("fleet.filter.allBrands")}</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand} className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary rounded-lg">
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Transmission filter */}
                <div className="space-y-2">
                  <label className="text-xs text-primary font-semibold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {t("fleet.filter.transmission")}
                  </label>
                  <Select value={selectedTransmission} onValueChange={setSelectedTransmission}>
                    <SelectTrigger className={`h-12 rounded-xl transition-all duration-300 ${
                      selectedTransmission !== "all" 
                        ? "bg-primary/10 border-primary/50 text-primary ring-1 ring-primary/20" 
                        : "bg-neutral-900 border-primary/20 text-white hover:border-primary/40 hover:bg-neutral-800"
                    }`}>
                      <SelectValue placeholder={t("fleet.filter.allTypes")} />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-primary/20 text-white rounded-xl shadow-xl shadow-black/50">
                      <SelectItem value="all" className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary rounded-lg">{t("fleet.filter.allTypes")}</SelectItem>
                      <SelectItem value={Transmission.AUTOMATIC} className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary rounded-lg">{t("fleet.filter.automatic")}</SelectItem>
                      <SelectItem value={Transmission.MANUAL} className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary rounded-lg">{t("fleet.filter.manual")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fuel type filter */}
                <div className="space-y-2">
                  <label className="text-xs text-primary font-semibold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {t("fleet.filter.fuel")}
                  </label>
                  <Select value={selectedFuelType} onValueChange={setSelectedFuelType}>
                    <SelectTrigger className={`h-12 rounded-xl transition-all duration-300 ${
                      selectedFuelType !== "all" 
                        ? "bg-primary/10 border-primary/50 text-primary ring-1 ring-primary/20" 
                        : "bg-neutral-900 border-primary/20 text-white hover:border-primary/40 hover:bg-neutral-800"
                    }`}>
                      <SelectValue placeholder={t("fleet.filter.allTypes")} />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-primary/20 text-white rounded-xl shadow-xl shadow-black/50">
                      <SelectItem value="all" className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary rounded-lg">{t("fleet.filter.allTypes")}</SelectItem>
                      <SelectItem value={FuelType.GASOLINE} className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary rounded-lg">{t("fleet.filter.gasoline")}</SelectItem>
                      <SelectItem value={FuelType.DIESEL} className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary rounded-lg">{t("fleet.filter.diesel")}</SelectItem>
                      <SelectItem value={FuelType.ELECTRIC} className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary rounded-lg">{t("fleet.filter.electric")}</SelectItem>
                      <SelectItem value={FuelType.HYBRID} className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary rounded-lg">{t("fleet.filter.hybrid")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Seats filter */}
                <div className="space-y-2">
                  <label className="text-xs text-primary font-semibold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {t("fleet.filter.seats")}
                  </label>
                  <Select value={selectedSeats} onValueChange={setSelectedSeats}>
                    <SelectTrigger className={`h-12 rounded-xl transition-all duration-300 ${
                      selectedSeats !== "all" 
                        ? "bg-primary/10 border-primary/50 text-primary ring-1 ring-primary/20" 
                        : "bg-neutral-900 border-primary/20 text-white hover:border-primary/40 hover:bg-neutral-800"
                    }`}>
                      <SelectValue placeholder={t("fleet.filter.any")} />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-primary/20 text-white rounded-xl shadow-xl shadow-black/50">
                      <SelectItem value="all" className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary rounded-lg">{t("fleet.filter.any")}</SelectItem>
                      {seatOptions.map((seats) => (
                        <SelectItem key={seats} value={seats.toString()} className="hover:bg-primary/10 focus:bg-primary/10 focus:text-primary rounded-lg">
                          {seats} {t("fleet.filter.seatsCount")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price range */}
                <div className="space-y-3 col-span-2">
                  <label className="text-xs text-primary font-semibold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {t("fleet.filter.price")}
                  </label>
                  <div className="bg-neutral-900 border border-primary/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-bold text-lg" dir="ltr">{priceRange[0]} MAD</span>
                      <span className="text-primary/60">—</span>
                      <span className="text-primary font-bold text-lg" dir="ltr">{priceRange[1]} MAD</span>
                      <span className="text-white/50 text-sm">{t("car.daily")}</span>
                    </div>
                    <Slider
                      value={priceRange}
                      onValueChange={(v) => setPriceRange(v as [number, number])}
                      min={minPrice}
                      max={maxPrice}
                      step={10}
                      className="w-full [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-primary/30 [&_.relative]:bg-neutral-700 [&_[data-orientation=horizontal]>.absolute]:bg-gradient-to-r [&_[data-orientation=horizontal]>.absolute]:from-primary/80 [&_[data-orientation=horizontal]>.absolute]:to-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Clear filters */}
              {activeFiltersCount > 0 && (
                <div className="mt-6 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 gap-2"
                  >
                    <X className="w-4 h-4" />
                    {t("fleet.filter.clear")} ({activeFiltersCount})
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-white/60">
            {loading ? (
              t("fleet.loading")
            ) : (
              <>
                {t("fleet.results")} <span className="text-white font-semibold">{filteredCars.length}</span> {t("fleet.of")}{" "}
                <span className="text-white font-semibold">{cars.length}</span> {t("fleet.vehicles")}
              </>
            )}
          </p>
          {filteredCars.length > 0 && !loading && (
            <div className="hidden md:flex items-center gap-2 text-sm text-white/60">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span>{t("fleet.available")}</span>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-white/60 text-lg">{t("fleet.loading")}</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
                {error}
              </div>
              <p className="text-white/60">{t("fleet.tryAgain")}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredCars.length === 0 && (
          <div className="flex items-center justify-center py-32">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-glow">
                <Car className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-2">{t("fleet.empty")}</h3>
              <p className="text-white/60 mb-6">
                {cars.length === 0
                  ? t("fleet.empty")
                  : t("fleet.noResults")}
              </p>
              {activeFiltersCount > 0 && (
                <Button onClick={clearFilters} className="bg-primary text-black hover:bg-primary/90">
                  {t("fleet.filter.clear")}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Car grid */}
        {!loading && !error && filteredCars.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCars.map((car, index) => (
              <article
                key={car.id}
                className="group relative rounded-2xl overflow-hidden bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] hover:border-primary/40 hover:bg-white/[0.06] transition-all duration-500 flex flex-col animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image container */}
                <Link href={`/fleet/${car.id}`} className="relative aspect-[4/3] overflow-hidden block">
                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

                  {/* Price badge */}
                  <div className="absolute top-3 right-3 z-20">
                    <div className="bg-black/60 backdrop-blur-md text-white font-semibold px-2.5 py-1 rounded-lg text-xs border border-white/10" dir="ltr">
                      {car.dailyFee} <span className="text-primary">MAD</span>
                    </div>
                  </div>

                  {/* Car image */}
                  <Image
                    src={resolveMediaUrl(car.imageGallery?.[0])}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Bottom info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                    <h3 className="text-lg font-display font-bold text-white group-hover:text-primary transition-colors">
                      {car.brand} <span className="font-normal text-white/70">{car.model}</span>
                    </h3>
                  </div>
                </Link>

                {/* Card body */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Specs row - compact */}
                  <div className="flex items-center justify-between gap-2 mb-4 py-2 px-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                    <div className="flex items-center gap-1.5 text-white/60">
                      <Users className="w-3.5 h-3.5 text-primary/70" />
                      <span className="text-[11px]">{car.seats}</span>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <div className="flex items-center gap-1.5 text-white/60">
                      <Gauge className="w-3.5 h-3.5 text-primary/70" />
                      <span className="text-[11px]">{car.transmission === "AUTOMATIC" ? "Auto" : "Manual"}</span>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <div className="flex items-center gap-1.5 text-white/60">
                      <Fuel className="w-3.5 h-3.5 text-primary/70" />
                      <span className="text-[11px]">{car.fuelType === "GASOLINE" ? "Petrol" : car.fuelType === "DIESEL" ? "Diesel" : car.fuelType === "ELECTRIC" ? "Electric" : "Hybrid"}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-auto space-y-2">
                    <Button
                      className="w-full bg-primary/90 hover:bg-primary text-black font-semibold h-9 text-sm transition-all"
                      onClick={() => {
                        setSelectedCar(car)
                        setIsDialogOpen(true)
                      }}
                    >
                      {t("car.book")}
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="w-full text-white/40 hover:text-white hover:bg-white/5 h-8 text-xs"
                    >
                      <Link href={`/fleet/${car.id}`} className="flex items-center justify-center gap-1.5">
                        {t("fleet.view")}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Booking dialog */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              setSelectedCar(null)
            }
          }}
        >
          <DialogContent className="sm:max-w-[420px] bg-neutral-950 border-primary/20 text-white">
            <VisuallyHidden>
              <DialogTitle>
                {selectedCar ? `${t("car.book")} ${selectedCar.brand} ${selectedCar.model}` : t("car.book")}
              </DialogTitle>
            </VisuallyHidden>
            {selectedCar && (
              <RentalForm
                car={selectedCar}
                onSuccess={() => {
                  setIsDialogOpen(false)
                  setSelectedCar(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </section>
    </main>
  )
}
