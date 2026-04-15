"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Calendar, 
  Download, 
  Search, 
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  Car,
  ArrowRight,
  MoreVertical,
  Eye,
  Truck,
  MapPin,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api, type RentalResponseDto } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type StatusFilter = "ALL" | "DEMANDED" | "APPROVED" | "ACTIVE" | "RETURNED"
type MethodFilter = "ALL" | "AGENCY" | "DELIVERY"

const statusConfig = {
  DEMANDED: { label: "Pending", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock },
  APPROVED: { label: "Approved", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: CheckCircle2 },
  ACTIVE: { label: "Active", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: Car },
  RETURNED: { label: "Returned", color: "bg-gray-500/10 text-gray-400 border-gray-500/20", icon: CheckCircle2 },
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<RentalResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("ALL")
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"active" | "archived">("active")
  const { toast } = useToast()
  const router = useRouter()
  const isArchivedView = viewMode === "archived"

  // Fetch rentals
  const fetchRentals = async () => {
    try {
      setIsLoading(true)
      let data: RentalResponseDto[]
      if (isArchivedView) {
        data = await api.rentals.getArchived()
      } else {
        const filters = statusFilter === "ALL" ? undefined : { status: statusFilter }
        data = await api.rentals.getAll(filters)
      }
      setRentals(data)
      setError(null)
    } catch (e: any) {
      setError(e.message || "Failed to load rentals")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRentals()
  }, [statusFilter, isArchivedView])

  const statusCounts = useMemo(
    () => ({
      DEMANDED: rentals.filter((r) => r.status === "DEMANDED").length,
      APPROVED: rentals.filter((r) => r.status === "APPROVED").length,
      ACTIVE: rentals.filter((r) => r.status === "ACTIVE").length,
      RETURNED: rentals.filter((r) => r.status === "RETURNED").length,
    }),
    [rentals]
  )

  const totalRevenue = useMemo(() => 
    rentals.reduce((sum, r) => sum + (r.totalPrice || 0), 0)
  , [rentals])

  const filteredRentals = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return rentals.filter((rental) => {
      const method = rental.paymentMethod || rental.reservationMethod
      const matchesMethod = methodFilter === "ALL" || method === methodFilter
      const matchesSearch =
        term.length === 0 ||
        [rental.customerName, rental.customerEmail ?? "", rental.customerPhone ?? "", rental.carModel, rental.carBrand]
          .some((value) => value?.toLowerCase().includes(term) ?? false)
      return matchesMethod && matchesSearch
    })
  }, [rentals, methodFilter, searchTerm])

  const handleExportCsv = () => {
    if (filteredRentals.length === 0) {
      toast({ title: "No rentals", description: "Nothing to export with current filters." })
      return
    }

    const headers = ["ID", "Customer", "Vehicle", "Rental Period", "Payment Method", "Total", "Status"]
    const rows = filteredRentals.map((rental) => [
      `#${rental.id}`,
      `${rental.customerName} (${rental.customerEmail})`,
      `${rental.carBrand} ${rental.carModel}`,
      `${rental.rentalDate} → ${rental.returnDate} (${rental.totalDays} days)`,
      rental.paymentMethod || rental.reservationMethod,
      `${rental.totalPrice} MAD`,
      rental.status
    ])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `rentals-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast({ title: "Export ready", description: `Downloaded ${filteredRentals.length} rentals.` })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Rental Management</h1>
              <p className="text-sm text-white/50">
                {isArchivedView ? "View archived rentals" : "Track and manage all active bookings"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-lg p-1">
            <button
              onClick={() => setViewMode("active")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "active" ? "bg-primary text-black" : "text-white/60 hover:text-white"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setViewMode("archived")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "archived" ? "bg-primary text-black" : "text-white/60 hover:text-white"
              }`}
            >
              Archived
            </button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportCsv} 
            className="border-white/10 text-white/70 hover:text-white gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRentals}
            className="text-white/50 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {!isArchivedView && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <button
            onClick={() => setStatusFilter("DEMANDED")}
            className={`bg-white/[0.03] border rounded-xl p-4 text-left transition-all hover:border-amber-500/30 ${
              statusFilter === "DEMANDED" ? "border-amber-500/50 bg-amber-500/5" : "border-white/[0.06]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="text-2xl font-bold text-white">{statusCounts.DEMANDED}</span>
            </div>
            <p className="text-xs text-white/50">Pending</p>
          </button>
          
          <button
            onClick={() => setStatusFilter("APPROVED")}
            className={`bg-white/[0.03] border rounded-xl p-4 text-left transition-all hover:border-blue-500/30 ${
              statusFilter === "APPROVED" ? "border-blue-500/50 bg-blue-500/5" : "border-white/[0.06]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">{statusCounts.APPROVED}</span>
            </div>
            <p className="text-xs text-white/50">Approved</p>
          </button>
          
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`bg-white/[0.03] border rounded-xl p-4 text-left transition-all hover:border-emerald-500/30 ${
              statusFilter === "ACTIVE" ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/[0.06]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Car className="w-5 h-5 text-emerald-400" />
              <span className="text-2xl font-bold text-white">{statusCounts.ACTIVE}</span>
            </div>
            <p className="text-xs text-white/50">Active</p>
          </button>
          
          <button
            onClick={() => setStatusFilter("RETURNED")}
            className={`bg-white/[0.03] border rounded-xl p-4 text-left transition-all hover:border-gray-500/30 ${
              statusFilter === "RETURNED" ? "border-gray-500/50 bg-gray-500/5" : "border-white/[0.06]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
              <span className="text-2xl font-bold text-white">{statusCounts.RETURNED}</span>
            </div>
            <p className="text-xs text-white/50">Returned</p>
          </button>
          
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-xl font-bold text-white">{totalRevenue.toLocaleString()}</span>
            </div>
            <p className="text-xs text-primary/70">Revenue (MAD)</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Search customer, email, vehicle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-10"
          />
        </div>
        
        <div className="flex gap-3">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            disabled={isArchivedView}
          >
            <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white h-10">
              <Filter className="w-4 h-4 mr-2 text-white/40" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-white/10">
              <SelectItem value="ALL" className="text-white">All Status</SelectItem>
              <SelectItem value="DEMANDED" className="text-white">Pending</SelectItem>
              <SelectItem value="APPROVED" className="text-white">Approved</SelectItem>
              <SelectItem value="ACTIVE" className="text-white">Active</SelectItem>
              <SelectItem value="RETURNED" className="text-white">Returned</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={methodFilter} onValueChange={(value) => setMethodFilter(value as MethodFilter)}>
            <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white h-10">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-white/10">
              <SelectItem value="ALL" className="text-white">All Methods</SelectItem>
              <SelectItem value="AGENCY" className="text-white">
                <span className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Agency</span>
              </SelectItem>
              <SelectItem value="DELIVERY" className="text-white">
                <span className="flex items-center gap-2"><Truck className="w-3 h-3" /> Delivery</span>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {statusFilter !== "ALL" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter("ALL")}
              className="text-white/50 hover:text-white"
            >
              Clear
            </Button>
          )}
        </div>
        
        <span className="text-sm text-white/40 ml-auto">
          {filteredRentals.length} {filteredRentals.length === 1 ? "rental" : "rentals"}
        </span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-white/50">Loading rentals...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 mb-2">{error}</p>
            <Button variant="outline" onClick={fetchRentals}>Retry</Button>
          </div>
        </div>
      ) : filteredRentals.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/70 font-medium mb-1">No rentals found</p>
            <p className="text-white/40 text-sm">
              {rentals.length === 0 ? "No bookings yet" : "Try adjusting your filters"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRentals.map((rental) => {
            const status = statusConfig[rental.status as keyof typeof statusConfig] || statusConfig.RETURNED
            const StatusIcon = status.icon
            const method = rental.paymentMethod || rental.reservationMethod
            
            return (
              <div
                key={rental.id}
                onClick={() => router.push(`/manager/rentals/${rental.id}`)}
                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:border-primary/30 hover:bg-white/[0.03] transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Customer & ID */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono text-white/40">#{rental.id}</span>
                      <Badge className={`${status.color} border text-[10px] px-1.5 py-0`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                      <Badge variant="outline" className="border-white/10 text-white/50 text-[10px] px-1.5 py-0">
                        {method === "DELIVERY" ? <Truck className="w-3 h-3 mr-1" /> : <MapPin className="w-3 h-3 mr-1" />}
                        {method}
                      </Badge>
                    </div>
                    <p className="font-semibold text-white truncate">{rental.customerName}</p>
                    <p className="text-xs text-white/40 truncate">{rental.customerEmail} · {rental.customerPhone}</p>
                  </div>
                  
                  {/* Vehicle */}
                  <div className="md:w-48">
                    <p className="font-medium text-white">{rental.carBrand} {rental.carModel}</p>
                    <p className="text-xs text-white/40">{rental.dailyRate} MAD/day</p>
                  </div>
                  
                  {/* Dates */}
                  <div className="md:w-48">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Calendar className="w-3.5 h-3.5 text-primary/60" />
                      <span>{rental.rentalDate}</span>
                      <ArrowRight className="w-3 h-3 text-white/30" />
                      <span>{rental.returnDate}</span>
                    </div>
                    <p className="text-xs text-white/40 ml-5">{rental.totalDays} days</p>
                  </div>
                  
                  {/* Price */}
                  <div className="md:w-24 text-right">
                    <p className="text-lg font-bold text-primary">{rental.totalPrice}</p>
                    <p className="text-[10px] text-white/40">MAD</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/manager/rentals/${rental.id}`)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
