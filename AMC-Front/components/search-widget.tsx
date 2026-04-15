"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { CalendarIcon, Briefcase, Car, Search } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export function SearchWidget() {
  const router = useRouter()
  const [tripType, setTripType] = useState("business")
  const [deliveryMethod, setDeliveryMethod] = useState("agency")
  const [pickupCity, setPickupCity] = useState("Agadir")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = () => {
    setIsSubmitting(true)
    const params = new URLSearchParams({
      trip: tripType,
      city: pickupCity,
      start: startDate ? startDate.toISOString().split("T")[0] : "",
      end: endDate ? endDate.toISOString().split("T")[0] : "",
      handover: deliveryMethod,
    })
    router.push(`/fleet?${params.toString()}`)
    setIsSubmitting(false)
  }

  return (
    <div className="bg-black/65 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground ml-1">Trip purpose</label>
          <Select value={tripType} onValueChange={setTripType}>
            <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white hover:bg-white/10 focus:ring-primary/50">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-primary" />
                <SelectValue placeholder="Select purpose" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-card border-white/10 text-white">
              <SelectItem value="business">Executive / Business</SelectItem>
              <SelectItem value="leisure">Leisure / Weekend</SelectItem>
              <SelectItem value="events">Events & VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground ml-1">Pick-up city</label>
          <Input
            value={pickupCity}
            onChange={(event) => setPickupCity(event.target.value)}
            placeholder="City or hotel"
            className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/60 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground ml-1">Pick-up date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-14 justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",
                  !startDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                {startDate ? format(startDate, "PPP") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-white/10 text-white">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="bg-card text-white" />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground ml-1">Return date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-14 justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white",
                  !endDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                {endDate ? format(endDate, "PPP") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-white/10 text-white">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="bg-card text-white" />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground ml-1">Hand-over preference</label>
          <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
            <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white hover:bg-white/10 focus:ring-primary/50">
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-primary" />
                <SelectValue placeholder="Select option" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-card border-white/10 text-white">
              <SelectItem value="agency">Agency pick-up</SelectItem>
              <SelectItem value="hotel">Hotel delivery</SelectItem>
              <SelectItem value="driver">With chauffeur</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between text-sm text-muted-foreground">
        <div>
          Tell us how you’d like to travel and our concierge will prepare a tailored quote in minutes.
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto h-14 bg-primary text-black hover:bg-primary/90 font-bold text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
        >
          <Search className="mr-2 h-5 w-5" />
          {isSubmitting ? "Preparing..." : "Build my rental plan"}
        </Button>
      </div>
    </div>
  )
}
