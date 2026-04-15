"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { 
  ArrowLeft, 
  Fuel, 
  Gauge, 
  Loader2, 
  Users, 
  Shield, 
  Clock, 
  Star, 
  Sparkles, 
  Award,
  Calendar,
  X
} from "lucide-react"

import { api, type CarResponseDto } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { RentalForm } from "@/components/rental-form"
import { resolveMediaUrl } from "@/lib/media"
import { useI18n } from "@/lib/i18n-context"

const SECURITY_DEPOSIT_MAD = 5000

interface FleetDetailProps {
  carId: string
}

export function FleetDetail({ carId }: FleetDetailProps) {
  const { t } = useI18n()
  const [car, setCar] = useState<CarResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await api.cars.getById(Number(carId))
        if (!active) return
        setCar(data)
        setError(null)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "Unable to load this vehicle.")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [carId])

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsBookingOpen(false)
    }
    if (isBookingOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isBookingOpen])

  const allImages = (car?.imageGallery ?? []).map(resolveMediaUrl)
  const primaryImage = allImages[selectedImageIndex] || resolveMediaUrl(null)

  return (
    <div className="relative min-h-screen">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-background to-neutral-950" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-5xl relative z-10 px-4 md:px-6 mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <Button asChild variant="ghost" className="text-white/80 hover:text-primary px-0 group">
            <Link href="/fleet" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {t("fleet.backToFleet")}
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-primary/20 animate-pulse" />
              <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground animate-pulse text-sm">{t("fleet.loadingDetails")}</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto text-center py-24 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-3xl">😕</span>
            </div>
            <p className="text-xl font-display text-white">{t("fleet.loadError")}</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button asChild className="bg-primary text-black hover:bg-primary/90 font-bold px-6">
              <Link href="/fleet">{t("fleet.returnToFleet")}</Link>
            </Button>
          </div>
        ) : car ? (
          <>
            {/* Car Title & Price Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 mb-2">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary font-medium">{t("fleet.luxuryVehicle")}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                  {car.brand} <span className="text-primary">{car.model}</span>
                </h1>
              </div>
              <div className="text-left md:text-right">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1">{t("fleet.dailyRate")}</p>
                <p className="text-2xl md:text-3xl font-display font-bold text-white">
                  {car.dailyFee} <span className="text-sm text-primary">MAD</span>
                  <span className="text-xs text-white/40 font-normal"> /{t("booking.perDay")}</span>
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
              {/* Left - Images */}
              <div className="space-y-3">
                {/* Main image - better aspect ratio */}
                <div className="relative group">
                  <div className="absolute -inset-px bg-gradient-to-br from-primary/20 via-transparent to-transparent rounded-2xl" />
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-black/50">
                    <Image 
                      src={primaryImage} 
                      alt={`${car.brand} ${car.model}`} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" 
                      priority 
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-primary text-black text-[10px] font-bold flex items-center gap-1">
                        <Star className="w-2.5 h-2.5" />
                        {t("fleet.topPick")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thumbnail gallery */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border transition-all duration-200 ${
                          selectedImageIndex === idx 
                            ? "border-primary ring-1 ring-primary/30" 
                            : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
                        }`}
                      >
                        <Image src={img} alt={`${car.brand} ${car.model} ${idx + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Features - Compact horizontal strip */}
                <div className="flex items-center gap-3 py-3 border-t border-b border-white/5">
                  {[
                    { icon: Shield, label: t("booking.badge.insured") },
                    { icon: Clock, label: t("booking.badge.support") },
                    { icon: Award, label: t("booking.badge.premium") },
                  ].map((feature, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-1.5 text-xs text-white/60"
                    >
                      <feature.icon className="w-3.5 h-3.5 text-primary/70" />
                      <span>{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Details & Booking CTA */}
              <div className="space-y-4">
                {/* Specs card - Compact */}
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-4">
                  {/* Specs grid - smaller */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-white/5 p-3 text-center">
                      <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                      <div className="text-[10px] text-white/40 uppercase tracking-wide">{t("fleet.seats")}</div>
                      <div className="text-sm font-semibold text-white">{car.seats}</div>
                    </div>
                    <div className="rounded-lg bg-white/5 p-3 text-center">
                      <Gauge className="w-4 h-4 text-primary mx-auto mb-1" />
                      <div className="text-[10px] text-white/40 uppercase tracking-wide">{t("fleet.transmission")}</div>
                      <div className="text-[11px] font-semibold text-white">{car.transmission}</div>
                    </div>
                    <div className="rounded-lg bg-white/5 p-3 text-center">
                      <Fuel className="w-4 h-4 text-primary mx-auto mb-1" />
                      <div className="text-[10px] text-white/40 uppercase tracking-wide">{t("fleet.fuel")}</div>
                      <div className="text-[11px] font-semibold text-white">{car.fuelType}</div>
                    </div>
                  </div>

                  {/* Inventory - smaller */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-xs text-emerald-400">{t("fleet.inventory")}</span>
                    <span className="text-sm font-bold text-white">
                      {car.inventory} {car.inventory === 1 ? t("fleet.unit") : t("fleet.units")}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-white/50 leading-relaxed">
                    {t("fleet.reserveDesc")}
                  </p>

                  {/* Deposit notice - smaller */}
                  <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-[11px]">
                      <span className="text-primary font-semibold">{t("booking.deposit")}: {SECURITY_DEPOSIT_MAD.toLocaleString("en-US")} MAD</span>
                      <span className="text-white/40"> — {t("fleet.depositNote")}</span>
                    </p>
                  </div>
                </div>

                {/* Book Now Button - Beautiful CTA */}
                <Button 
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full h-12 bg-gradient-to-r from-primary via-primary to-amber-400 text-black font-bold text-sm rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Calendar className="w-4 h-4 mr-2" />
                  {t("booking.reserveNow")}
                </Button>

                <p className="text-[10px] text-center text-white/30">
                  {t("fleet.noPaymentRequired")}
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Booking Modal */}
      {isBookingOpen && car && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsBookingOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button 
              onClick={() => setIsBookingOpen(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            
            {/* Form content */}
            <div className="p-5">
              <RentalForm car={car} onSuccess={() => setIsBookingOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
