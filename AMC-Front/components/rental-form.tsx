"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, differenceInDays } from "date-fns"
import {
  CalendarIcon,
  Loader2,
  User,
  Mail,
  Phone,
  CreditCard,
  Car,
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  Clock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import type { CarResponseDto, RentalCreateRequestDto, ReservationMethod } from "@/lib/api"
import { ApiError, api } from "@/lib/api"
import { resolveMediaUrl } from "@/lib/media"
import Image from "next/image"
import { useI18n } from "@/lib/i18n-context"

const SECURITY_DEPOSIT_MAD = 5000

const MOROCCO_PHONE_REGEX = /^(?:\+212|0)([5-7]\d{8})$/

// Create schema dynamically with translations
const createFormSchema = (t: (key: string) => string) =>
  z
    .object({
      customerName: z.string().trim().min(2, t("validation.nameMin")),
      customerEmail: z.string().trim().email(t("validation.emailInvalid")),
      customerPhone: z
        .string()
        .trim()
        .transform((value) => value.replace(/[\s-]/g, ""))
        .refine((value) => MOROCCO_PHONE_REGEX.test(value), {
          message: t("validation.phoneInvalid"),
        }),
      driverLicenseNumber: z.string().trim().min(4, t("validation.licenseRequired")),
      rentalDate: z.date().refine((date) => date > new Date(), t("validation.startDateFuture")),
      returnDate: z.date(),
      paymentMethod: z.enum(["AGENCY", "DELIVERY"]),
    })
    .refine((data) => data.returnDate > data.rentalDate, {
      message: t("validation.returnAfterRental"),
      path: ["returnDate"],
    })

type RentalFormData = z.infer<ReturnType<typeof createFormSchema>>

interface RentalFormProps {
  car: CarResponseDto
  onSuccess?: () => void
  hideDialogChrome?: boolean
}

export function RentalForm({ car, onSuccess, hideDialogChrome = false }: RentalFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{
    variant: "success" | "error"
    title: string
    description: string
  } | null>(null)
  const { toast } = useToast()
  const { t, language } = useI18n()

  // Create schema with current language translations
  const formSchema = useMemo(() => createFormSchema(t), [t])

  const form = useForm<RentalFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      driverLicenseNumber: "",
      paymentMethod: "AGENCY",
    },
    mode: "onBlur",
  })

  const watchRentalDate = form.watch("rentalDate")
  const watchReturnDate = form.watch("returnDate")

  const priceEstimate = useMemo(() => {
    if (!watchRentalDate || !watchReturnDate) return null
    const days = differenceInDays(watchReturnDate, watchRentalDate)
    if (days <= 0) return null
    return {
      days,
      dailyRate: car.dailyFee,
      total: days * car.dailyFee,
    }
  }, [watchRentalDate, watchReturnDate, car.dailyFee])

  const getFirstErrorMessage = (errors: typeof form.formState.errors): string | null => {
    const walk = (error: unknown): string | null => {
      if (!error) return null
      if (typeof error === "object" && error !== null) {
        if (
          "message" in (error as Record<string, unknown>) &&
          typeof (error as Record<string, unknown>).message === "string"
        ) {
          return (error as Record<string, unknown>).message as string
        }
        for (const value of Object.values(error as Record<string, unknown>)) {
          const nested = walk(value)
          if (nested) return nested
        }
      }
      return null
    }
    return walk(errors)
  }

  const handleInvalid = (errors: typeof form.formState.errors) => {
    const message = getFirstErrorMessage(errors) ?? t("booking.validation")
    toast({
      title: t("booking.validation"),
      description: message,
      variant: "destructive",
    })
    setFeedback({
      variant: "error",
      title: t("booking.validation"),
      description: message,
    })
  }

  async function onSubmit(values: RentalFormData) {
    setIsLoading(true)
    setFeedback(null)
    try {
      const payload: RentalCreateRequestDto = {
        carId: car.id,
        rentalDate: format(values.rentalDate, "yyyy-MM-dd"),
        returnDate: format(values.returnDate, "yyyy-MM-dd"),
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: values.customerEmail,
        driverLicenseNumber: values.driverLicenseNumber,
        paymentMethod: values.paymentMethod as ReservationMethod,
      }

      const result = await api.rentals.create(payload)

      const successDescription = `${t("booking.successDesc")} ${result.totalPrice} MAD`
      toast({
        title: t("booking.success"),
        description: successDescription,
      })
      setFeedback({
        variant: "success",
        title: t("booking.success"),
        description: successDescription,
      })

      form.reset()
      setTimeout(() => onSuccess?.(), 2000)
    } catch (error) {
      if (error instanceof ApiError) {
        const isConflict = error.status === 409
        const conflictDescription =
          error.message || t("booking.error")
        toast({
          title: isConflict ? t("booking.carBooked") : t("booking.failed"),
          description: conflictDescription,
          variant: isConflict ? "default" : "destructive",
        })
        setFeedback({
          variant: "error",
          title: isConflict ? t("booking.unavailable") : t("booking.failed"),
          description: conflictDescription,
        })
      } else {
        console.error("Booking error:", error)
        toast({
          title: t("booking.failed"),
          description: t("booking.error"),
          variant: "destructive",
        })
        setFeedback({
          variant: "error",
          title: t("booking.failed"),
          description: t("booking.error"),
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysLabel = (days: number) => {
    if (language === "ar") {
      return days === 1 ? t("booking.days") : t("booking.daysPlural")
    }
    return days === 1 ? t("booking.days") : t("booking.daysPlural")
  }

  return (
    <div className="space-y-4">
      {/* Header with car preview */}
      {!hideDialogChrome && (
        <div className="relative">
          {/* Car image banner - compact */}
          <div className="relative h-24 -mx-6 -mt-6 mb-3 overflow-hidden rounded-t-lg">
            <Image
              src={resolveMediaUrl(car.imageGallery?.[0])}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
            <div className="absolute bottom-3 left-5 right-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">
                    {t("booking.reserveNow")}
                  </p>
                  <h2 className="text-lg font-display font-bold text-white">
                    {car.brand} {car.model}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary">{car.dailyFee} MAD</p>
                  <p className="text-[10px] text-white/50">{t("booking.perDay")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust badges - compact */}
          <div className="flex items-center justify-center gap-4 py-2 border-y border-white/5 mb-4 bg-black/20">
            {[
              { icon: Shield, text: t("booking.badge.insured") },
              { icon: Clock, text: t("booking.badge.support") },
              { icon: CheckCircle2, text: t("booking.badge.cancel") },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-1 text-[10px] text-white/50">
                <badge.icon className="w-3 h-3 text-primary/70" />
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success/Error feedback - compact */}
      {feedback && (
        <div
          className={cn(
            "relative overflow-hidden rounded-lg p-3 animate-in slide-in-from-top-2 duration-300",
            feedback.variant === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20"
              : "bg-red-500/10 border border-red-500/20"
          )}
        >
          <div className="flex items-start gap-2">
            {feedback.variant === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  feedback.variant === "success" ? "text-emerald-400" : "text-red-400"
                )}
              >
                {feedback.title}
              </p>
              <p className="text-xs text-white/60">{feedback.description}</p>
            </div>
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, handleInvalid)} className="space-y-3">
          {/* Personal Information Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary/80">
              <User className="w-3 h-3" />
              <span>{t("booking.personalInfo")}</span>
            </div>

            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormControl>
                    <div className="relative group">
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder={t("booking.name")}
                        {...field}
                        className="pl-8 h-9 text-sm bg-black/40 border-white/10 text-white placeholder:text-white/25 rounded-lg focus:border-primary/40 focus:ring-1 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 text-[10px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-primary transition-colors" />
                        <Input
                          placeholder={t("booking.email")}
                          {...field}
                          className="pl-8 h-9 text-sm bg-black/40 border-white/10 text-white placeholder:text-white/25 rounded-lg focus:border-primary/40 focus:ring-1 focus:ring-primary/10 transition-all"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormControl>
                      <div className="relative group">
                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-primary transition-colors" />
                        <Input
                          placeholder={t("booking.phone")}
                          {...field}
                          dir="ltr"
                          className="pl-8 h-9 text-sm bg-black/40 border-white/10 text-white placeholder:text-white/25 rounded-lg focus:border-primary/40 focus:ring-1 focus:ring-primary/10 transition-all"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="driverLicenseNumber"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormControl>
                    <div className="relative group">
                      <CreditCard className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder={t("booking.license")}
                        {...field}
                        className="pl-8 h-9 text-sm bg-black/40 border-white/10 text-white placeholder:text-white/25 rounded-lg focus:border-primary/40 focus:ring-1 focus:ring-primary/10 transition-all"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Rental Dates Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary/80">
              <CalendarIcon className="w-3 h-3" />
              <span>{t("booking.rentalPeriod")}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="rentalDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "h-9 px-2.5 text-left text-sm font-normal bg-black/40 border-white/10 hover:bg-black/60 hover:border-primary/30 hover:text-white rounded-lg transition-all",
                              !field.value && "text-white/25",
                              field.value && "text-white border-primary/20"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary/70" />
                            {field.value ? format(field.value, "MMM d, yyyy") : <span>{t("booking.pickup")}</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-black border-primary/20 rounded-lg shadow-xl shadow-black/50"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="bg-black text-white rounded-lg"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-red-400 text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="returnDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "h-9 px-2.5 text-left text-sm font-normal bg-black/40 border-white/10 hover:bg-black/60 hover:border-primary/30 hover:text-white rounded-lg transition-all",
                              !field.value && "text-white/25",
                              field.value && "text-white border-primary/20"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary/70" />
                            {field.value ? format(field.value, "MMM d, yyyy") : <span>{t("booking.return")}</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-black border-primary/20 rounded-lg shadow-xl shadow-black/50"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="bg-black text-white rounded-lg"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-red-400 text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Payment Method Section - compact cards */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary/80">
              <Car className="w-3 h-3" />
              <span>{t("booking.deliveryMethod")}</span>
            </div>

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-2"
                    >
                      <FormItem>
                        <FormControl>
                          <label
                            className={cn(
                              "relative flex flex-col items-center gap-1.5 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                              field.value === "AGENCY"
                                ? "border-primary/50 bg-primary/5"
                                : "border-white/10 bg-black/30 hover:border-white/20"
                            )}
                          >
                            <RadioGroupItem value="AGENCY" className="sr-only" />
                            <MapPin
                              className={cn(
                                "w-5 h-5",
                                field.value === "AGENCY" ? "text-primary" : "text-white/30"
                              )}
                            />
                            <div className="text-center">
                              <p
                                className={cn(
                                  "text-xs font-medium",
                                  field.value === "AGENCY" ? "text-primary" : "text-white/70"
                                )}
                              >
                                {t("booking.agency")}
                              </p>
                            </div>
                          </label>
                        </FormControl>
                      </FormItem>
                      <FormItem>
                        <FormControl>
                          <label
                            className={cn(
                              "relative flex flex-col items-center gap-1.5 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                              field.value === "DELIVERY"
                                ? "border-primary/50 bg-primary/5"
                                : "border-white/10 bg-black/30 hover:border-white/20"
                            )}
                          >
                            <RadioGroupItem value="DELIVERY" className="sr-only" />
                            <Truck
                              className={cn(
                                "w-5 h-5",
                                field.value === "DELIVERY" ? "text-primary" : "text-white/30"
                              )}
                            />
                            <div className="text-center">
                              <p
                                className={cn(
                                  "text-xs font-medium",
                                  field.value === "DELIVERY" ? "text-primary" : "text-white/70"
                                )}
                              >
                                {t("booking.delivery")}
                              </p>
                            </div>
                          </label>
                        </FormControl>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-red-400 text-[10px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Price Summary - compact */}
          {priceEstimate && (
            <div className="rounded-lg bg-black/40 border border-primary/10 p-3 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Sparkles className="w-3 h-3 text-primary/70" />
                    <span className="text-[10px] font-medium text-primary/70 uppercase tracking-wider">{t("booking.total")}</span>
                  </div>
                  <p className="text-[10px] text-white/40">
                    {priceEstimate.days} {getDaysLabel(priceEstimate.days)} × {priceEstimate.dailyRate} MAD
                  </p>
                </div>
                <p className="text-2xl font-display font-bold text-white">
                  {priceEstimate.total}
                  <span className="text-sm text-primary"> MAD</span>
                </p>
              </div>
            </div>
          )}

          {/* Submit Button - compact */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 bg-primary text-black hover:bg-primary/90 font-bold text-sm rounded-lg shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("booking.processing")}
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t("booking.confirm")}
              </>
            )}
          </Button>

          <p className="text-[11px] text-center text-primary/80 leading-relaxed">
            {t("booking.deposit")}: {SECURITY_DEPOSIT_MAD.toLocaleString("en-US")} MAD — {t("booking.deposit.note")}
          </p>

          {/* Terms note */}
          <p className="text-[10px] text-center text-white/30">
            {t("booking.terms")}{" "}
            <a href="#" className="text-primary/70 hover:underline">
              {t("booking.terms.link")}
            </a>{" "}
            &{" "}
            <a href="#" className="text-primary/70 hover:underline">
              {t("booking.policy.link")}
            </a>
          </p>
        </form>
      </Form>
    </div>
  )
}
