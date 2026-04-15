"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Fuel, Gauge, Users, ArrowRight, Star, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import type { CarResponseDto } from "@/lib/api"
import { api } from "@/lib/api"
import { useI18n } from "@/lib/i18n-context"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { RentalForm } from "@/components/rental-form"
import { resolveMediaUrl } from "@/lib/media"

const SECURITY_DEPOSIT_MAD = 5000

interface FleetSectionProps {
  limit?: number
  initialCars?: CarResponseDto[]
}

export function FleetSection({ limit, initialCars = [] }: FleetSectionProps = {}) {
  const [cars, setCars] = useState<CarResponseDto[]>(() => {
    if (typeof limit === "number" && initialCars.length > limit) {
      return [...initialCars]
        .sort((a, b) => Number(b.dailyFee ?? 0) - Number(a.dailyFee ?? 0))
        .slice(0, limit)
    }
    return initialCars
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCar, setSelectedCar] = useState<CarResponseDto | null>(null)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const { t } = useI18n()

  const [loading, setLoading] = useState(initialCars.length === 0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        if (initialCars.length === 0) {
          setLoading(true)
        }
        const data = await api.cars.getAll()
        if (active) {
          const sorted = [...data].sort((a, b) => Number(b.dailyFee ?? 0) - Number(a.dailyFee ?? 0))
          const curated = typeof limit === "number" ? sorted.slice(0, limit) : sorted
          setCars(curated)
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
  }, [limit, initialCars.length])

  return (
    <section id="fleet" className="relative py-32 overflow-hidden">
      {/* Light grey/charcoal section background */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-800/90 to-neutral-900" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-primary" />
              <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">
                {t("fleet.collection")}
              </p>
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
              {t("fleet.title")}
            </h2>
            <p className="text-lg text-white/60 leading-relaxed">
              {t("fleet.subtitle")}
            </p>
          </div>
          {typeof limit === "number" && (
            <Button
              asChild
              size="lg"
              className="group bg-transparent border-2 border-primary/50 text-primary hover:bg-primary hover:text-black font-bold px-8 h-14 transition-all duration-300"
            >
              <Link href="/fleet" className="flex items-center gap-3">
                {t("fleet.viewFull")}
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-white/60">{t("fleet.loading")}</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-24">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && cars.length === 0 && (
          <div className="text-center py-24">
            <p className="text-white/60 text-lg">{t("fleet.empty")}</p>
          </div>
        )}

        {/* Car grid */}
        {!loading && !error && cars.length > 0 && (
          <>
            {typeof limit === "number" && (
              <div className="flex items-center gap-2 mb-8 text-sm text-white/60">
                <Star className="w-4 h-4 text-primary" />
                <span>{t("fleet.premium")} ({Math.min(limit, cars.length)})</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car, index) => (
                <article
                  key={car.id}
                  className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 hover:border-primary/50 transition-all duration-700 flex flex-col animate-fade-in-up"
                  onMouseEnter={() => setHoveredCard(car.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Image container */}
                  <Link href={`/fleet/${car.id}`} className="relative h-72 overflow-hidden block">
                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

                    {/* Price badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary blur-lg opacity-50" />
                        <div className="relative bg-primary text-black font-bold px-4 py-2 rounded-full text-sm flex items-center gap-1 shadow-lg">
                          <span className="text-lg">{car.dailyFee} MAD</span>
                          <span className="text-xs opacity-70">{t("car.daily")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Premium badge for top cars */}
                    {index < 1 && typeof limit === "number" && (
                      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-primary px-3 py-1.5 rounded-full text-xs font-semibold border border-primary/30">
                        <Zap className="w-3 h-3" />
                        {t("fleet.topPick")}
                      </div>
                    )}

                    {/* Car image */}
                    <Image
                      src={resolveMediaUrl(car.imageGallery?.[0])}
                      alt={`${car.brand} ${car.model}`}
                      fill
                      className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />

                    {/* Bottom info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-1 group-hover:text-primary transition-colors duration-300">
                        {car.brand}
                      </h3>
                      <p className="text-white/70 text-lg">{car.model}</p>
                    </div>
                  </Link>

                  {/* Card body */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Specs grid */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {[
                        { icon: Users, value: car.seats, label: "Seats" },
                        { icon: Gauge, value: car.transmission.toLowerCase(), label: "Trans" },
                        { icon: Fuel, value: car.fuelType.toLowerCase(), label: "Fuel" },
                      ].map((spec, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors border border-transparent group-hover:border-white/10"
                        >
                          <spec.icon className="w-5 h-5 text-primary" />
                          <span className="text-xs text-white capitalize font-medium">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-auto space-y-3">
                      <Button
                        className="w-full bg-primary text-black hover:bg-primary/90 font-bold h-14 text-base shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
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
                        className="w-full text-white/60 hover:text-white hover:bg-white/5 h-12"
                      >
                        <Link href={`/fleet/${car.id}`} className="flex items-center justify-center gap-2">
                          {t("fleet.view")}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                      <p className="text-center text-[11px] leading-relaxed text-white/50">
                        {t("booking.deposit")}: {SECURITY_DEPOSIT_MAD.toLocaleString("en-US")} MAD — {t("booking.deposit.note")}
                      </p>
                    </div>
                  </div>

                  {/* Hover glow effect */}
                  <div
                    className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
                      hoveredCard === car.id ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
                  </div>
                </article>
              ))}
            </div>
          </>
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
          <DialogContent className="sm:max-w-[420px] bg-neutral-950 border-white/10 text-white">
            <VisuallyHidden>
              <DialogTitle>
                {selectedCar ? `Book ${selectedCar.brand} ${selectedCar.model}` : "Book a Car"}
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
      </div>
    </section>
  )
}
