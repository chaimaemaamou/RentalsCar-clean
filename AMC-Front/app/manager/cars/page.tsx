"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { 
  Plus, 
  Trash2, 
  Edit, 
  Upload, 
  X, 
  Search, 
  Car, 
  Fuel, 
  Users, 
  Gauge,
  MoreVertical,
  Eye,
  Grid3X3,
  List,
  SlidersHorizontal,
  Package
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { api, type CarResponseDto, type CarRequestDto, Transmission, FuelType } from "@/lib/api"
import { Label } from "@/components/ui/label"
import { resolveMediaUrl } from "@/lib/media"

export default function CarsPage() {
  const router = useRouter()
  const [cars, setCars] = useState<CarResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [uploadingAddImages, setUploadingAddImages] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [brandFilter, setBrandFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [addForm, setAddForm] = useState<CarRequestDto>({
    brand: "",
    model: "",
    seats: 5,
    transmission: Transmission.MANUAL,
    fuelType: FuelType.GASOLINE,
    dailyFee: 0,
    inventory: 1,
    imageUrls: [],
  })
  const { toast } = useToast()

  // Fetch cars
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setIsLoading(true)
        const data = await api.cars.getAll()
        if (!active) return
        setCars(data)
      } catch (e: any) {
        if (active) setError(e.message || "Failed to load cars")
      } finally {
        if (active) setIsLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  // Get unique brands for filter
  const brands = [...new Set(cars.map(c => c.brand))].sort()

  // Filter cars
  const filteredCars = cars.filter(car => {
    const matchesSearch = searchQuery.trim() === "" || 
      `${car.brand} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBrand = brandFilter === "all" || car.brand === brandFilter
    return matchesSearch && matchesBrand
  })

  // Stats
  const totalInventory = cars.reduce((sum, car) => sum + (car.inventory ?? 0), 0)
  const avgPrice = cars.length > 0 ? Math.round(cars.reduce((sum, car) => sum + car.dailyFee, 0) / cars.length) : 0

  async function refreshCars() {
    try {
      const list = await api.cars.getAll()
      setCars(list)
    } catch (e) {
      /* ignore */
    }
  }

  function updateAdd<K extends keyof CarRequestDto>(key: K, value: CarRequestDto[K]) {
    setAddForm(prev => ({ ...prev, [key]: value }))
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    try {
      setUploadingAddImages(true)
      const uploaded = await api.media.upload(files)
      const urls = uploaded.map((item) => item.url)
      updateAdd("imageUrls", [...addForm.imageUrls, ...urls])
      toast({ title: "Images uploaded", description: `${urls.length} file(s) ready.` })
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message ?? "Unable to upload images.", variant: "destructive" })
    } finally {
      setUploadingAddImages(false)
    }
  }

  const removeImageAt = (index: number) => {
    updateAdd("imageUrls", addForm.imageUrls.filter((_, i) => i !== index))
  }

  async function handleAddCar() {
    try {
      await api.cars.create(addForm)
      setIsAddOpen(false)
      setAddForm({
        brand: "",
        model: "",
        seats: 5,
        transmission: Transmission.MANUAL,
        fuelType: FuelType.GASOLINE,
        dailyFee: 0,
        inventory: 1,
        imageUrls: [],
      })
      await refreshCars()
      toast({ title: "Success", description: "Car added to fleet" })
    } catch (e: any) {
      toast({ title: "Add failed", description: e.message, variant: "destructive" })
    }
  }

  async function handleDeleteCar(id: number) {
    if (!confirm("Are you sure you want to delete this car?")) return
    try {
      await api.cars.delete(id)
      await refreshCars()
      toast({ title: "Deleted", description: `Car removed from fleet.` })
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Fleet Management</h1>
              <p className="text-sm text-white/50">Manage your vehicle inventory and pricing</p>
            </div>
          </div>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-black hover:bg-primary/90 font-semibold gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-neutral-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Vehicle</DialogTitle>
              <DialogDescription className="text-white/60">Enter the details of the new vehicle to add to your fleet.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Brand</Label>
                  <Input placeholder="e.g. Mercedes" className="bg-white/5 border-white/10 text-white" value={addForm.brand} onChange={e => updateAdd("brand", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Model</Label>
                  <Input placeholder="e.g. C-Class" className="bg-white/5 border-white/10 text-white" value={addForm.model} onChange={e => updateAdd("model", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Daily Fee (MAD)</Label>
                  <Input type="number" placeholder="500" className="bg-white/5 border-white/10 text-white" value={addForm.dailyFee || ""} onChange={e => updateAdd("dailyFee", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Seats</Label>
                  <Input type="number" className="bg-white/5 border-white/10 text-white" value={addForm.seats} onChange={e => updateAdd("seats", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Inventory</Label>
                  <Input type="number" className="bg-white/5 border-white/10 text-white" value={addForm.inventory} onChange={e => updateAdd("inventory", Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/70">Transmission</Label>
                  <Select value={addForm.transmission} onValueChange={v => updateAdd("transmission", v as Transmission)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/10">
                      {Object.values(Transmission).map(v => <SelectItem key={v} value={v} className="text-white">{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Fuel Type</Label>
                  <Select value={addForm.fuelType} onValueChange={v => updateAdd("fuelType", v as FuelType)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/10">
                      {Object.values(FuelType).map(v => <SelectItem key={v} value={v} className="text-white">{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70">Photos</Label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-xl px-4 py-6 text-center hover:border-primary/60 transition cursor-pointer bg-white/[0.02]">
                  <Upload className="w-8 h-8 mb-2 text-primary/60" />
                  <span className="text-sm text-white/60">{uploadingAddImages ? "Uploading..." : "Click to upload images"}</span>
                  <span className="text-xs text-white/40 mt-1">PNG, JPG up to 10MB</span>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files)}
                  />
                </label>
                {addForm.imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {addForm.imageUrls.map((url, idx) => (
                      <div key={url + idx} className="relative h-16 w-24 rounded-lg overflow-hidden border border-white/10 group">
                        <Image src={resolveMediaUrl(url)} alt="Car" fill className="object-cover" />
                        <button
                          type="button"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          onClick={() => removeImageAt(idx)}
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-white/20 text-white">Cancel</Button>
              <Button onClick={handleAddCar} className="bg-primary text-black hover:bg-primary/90 font-semibold">
                Add Vehicle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{cars.length}</p>
              <p className="text-xs text-white/50">Total Models</p>
            </div>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalInventory}</p>
              <p className="text-xs text-white/50">Total Units</p>
            </div>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">MAD</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{avgPrice}</p>
              <p className="text-xs text-white/50">Avg. Daily Rate</p>
            </div>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <span className="text-purple-400 font-bold text-sm">{brands.length}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{brands.length}</p>
              <p className="text-xs text-white/50">Brands</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 h-10"
            />
          </div>
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white h-10">
              <SlidersHorizontal className="w-4 h-4 mr-2 text-white/40" />
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-white/10">
              <SelectItem value="all" className="text-white">All Brands</SelectItem>
              {brands.map(brand => (
                <SelectItem key={brand} value={brand} className="text-white">{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/40">{filteredCars.length} vehicles</span>
          <div className="flex bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${viewMode === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-white/50">Loading fleet...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      ) : filteredCars.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/70 font-medium mb-1">No vehicles found</p>
            <p className="text-white/40 text-sm mb-4">
              {cars.length === 0 ? "Add your first vehicle to get started" : "Try adjusting your filters"}
            </p>
            {cars.length === 0 && (
              <Button onClick={() => setIsAddOpen(true)} className="bg-primary text-black hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Add First Vehicle
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCars.map((car) => (
            <div
              key={car.id}
              className="group bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300"
            >
              {/* Image */}
              <Link href={`/manager/cars/${car.id}`} className="block relative aspect-[16/10] bg-black/20 overflow-hidden">
                <Image
                  src={resolveMediaUrl(car.imageGallery?.[0])}
                  alt={`${car.brand} ${car.model}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                    car.inventory > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  }`}>
                    {car.inventory} in stock
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white font-semibold text-lg">{car.brand} {car.model}</p>
                </div>
              </Link>
              
              {/* Details */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {car.seats}
                    </span>
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5" /> {car.transmission === "AUTOMATIC" ? "Auto" : "Manual"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5" /> {car.fuelType}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-primary">{car.dailyFee}</span>
                    <span className="text-xs text-white/40 ml-1">MAD/day</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-neutral-900 border-white/10">
                      <DropdownMenuItem onClick={() => router.push(`/manager/cars/${car.id}`)} className="text-white gap-2">
                        <Eye className="w-4 h-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/manager/cars/${car.id}`)} className="text-white gap-2">
                        <Edit className="w-4 h-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={() => handleDeleteCar(car.id)} className="text-red-400 gap-2">
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-3 bg-white/[0.03] border-b border-white/[0.06] text-xs font-medium text-white/50 uppercase tracking-wider">
            <span>Image</span>
            <span>Vehicle</span>
            <span>Specs</span>
            <span>Rate</span>
            <span>Stock</span>
            <span></span>
          </div>
          {filteredCars.map((car) => (
            <div
              key={car.id}
              className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-3 items-center border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
            >
              <Link href={`/manager/cars/${car.id}`} className="relative w-20 h-14 rounded-lg overflow-hidden bg-black/20">
                <Image
                  src={resolveMediaUrl(car.imageGallery?.[0])}
                  alt={`${car.brand} ${car.model}`}
                  fill
                  className="object-cover"
                />
              </Link>
              <div>
                <Link href={`/manager/cars/${car.id}`} className="font-semibold text-white hover:text-primary transition-colors">
                  {car.brand} {car.model}
                </Link>
                <p className="text-xs text-white/40">ID: {car.id}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/50">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {car.seats}
                </span>
                <span>{car.transmission === "AUTOMATIC" ? "Auto" : "Manual"}</span>
                <span>{car.fuelType}</span>
              </div>
              <div>
                <span className="font-bold text-primary">{car.dailyFee}</span>
                <span className="text-xs text-white/40 ml-1">MAD</span>
              </div>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                car.inventory > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              }`}>
                {car.inventory}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-neutral-900 border-white/10">
                  <DropdownMenuItem onClick={() => router.push(`/manager/cars/${car.id}`)} className="text-white gap-2">
                    <Eye className="w-4 h-4" /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/manager/cars/${car.id}`)} className="text-white gap-2">
                    <Edit className="w-4 h-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={() => handleDeleteCar(car.id)} className="text-red-400 gap-2">
                    <Trash2 className="w-4 h-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
