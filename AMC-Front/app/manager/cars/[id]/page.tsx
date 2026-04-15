"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { api, type CarResponseDto, type CarRequestDto, Transmission, FuelType } from "@/lib/api"
import { resolveMediaUrl } from "@/lib/media"
import { 
  Trash2, 
  Plus, 
  X, 
  ArrowLeft, 
  ImageIcon, 
  Car, 
  Save,
  Fuel,
  Users,
  Gauge,
  Package,
  Upload,
  GripVertical,
  AlertTriangle
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function CarDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = Number(params?.id)
  const [car, setCar] = useState<CarResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<CarRequestDto | null>(null)
  const [saving, setSaving] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id || Number.isNaN(id)) return
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await api.cars.getById(id)
        if (!active) return
        setCar(data)
        setImageUrls(data.imageGallery || [])
        setForm({
          brand: data.brand,
          model: data.model,
          seats: data.seats,
          transmission: data.transmission,
          fuelType: data.fuelType,
          dailyFee: data.dailyFee,
          inventory: data.inventory,
          imageUrls: data.imageGallery || [],
        })
      } catch (e: any) {
        if (active) setError(e.message || "Failed to load car")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [id])

  function update<K extends keyof CarRequestDto>(key: K, value: CarRequestDto[K]) {
    if (!form) return
    setForm(prev => prev ? ({ ...prev, [key]: value }) : prev)
  }

  async function handleSave() {
    if (!form || !car) return
    try {
      setSaving(true)
      const updatedForm = { ...form, imageUrls }
      const updated = await api.cars.update(car.id, updatedForm)
      setCar(updated)
      setImageUrls(updated.imageGallery || [])
      toast({ title: "Changes saved", description: `${updated.brand} ${updated.model} has been updated.` })
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!car) return
    try {
      await api.cars.delete(car.id)
      toast({ title: "Car deleted", description: `${car.brand} ${car.model} has been removed.` })
      router.push("/manager/cars")
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" })
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    try {
      setUploading(true)
      const results = await api.media.upload(files)
      const newUrls = results.map(r => r.url)
      setImageUrls(prev => [...prev, ...newUrls])
      toast({ title: "Upload complete", description: `${results.length} image(s) added.` })
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  function removeImage(index: number) {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= imageUrls.length) return
    setImageUrls(prev => {
      const newArr = [...prev]
      const [removed] = newArr.splice(from, 1)
      newArr.splice(to, 0, removed)
      return newArr
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-white/50">Loading vehicle...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 mb-4">{error}</p>
          <Button variant="outline" onClick={() => router.push("/manager/cars")}>
            Back to Fleet
          </Button>
        </div>
      </div>
    )
  }

  if (!car || !form) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Car className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/50">Vehicle not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/manager/cars")}
            className="text-white/50 hover:text-white gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <h1 className="text-2xl font-bold text-white">{car.brand} {car.model}</h1>
            <p className="text-sm text-white/50">ID: {car.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-2">
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-neutral-900 border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Delete {car.brand} {car.model}?</AlertDialogTitle>
                <AlertDialogDescription className="text-white/60">
                  This action cannot be undone. This will permanently remove the vehicle from your fleet.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-white/20 text-white">Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600" onClick={handleDelete}>
                  Delete Vehicle
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-black hover:bg-primary/90 gap-2 font-semibold">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">MAD</span>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{car.dailyFee}</p>
              <p className="text-xs text-white/50">Per Day</p>
            </div>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{car.inventory}</p>
              <p className="text-xs text-white/50">In Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{car.seats}</p>
              <p className="text-xs text-white/50">Seats</p>
            </div>
          </div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Gauge className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{car.transmission === "AUTOMATIC" ? "Auto" : "Manual"}</p>
              <p className="text-xs text-white/50">Transmission</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-white">Image Gallery</h2>
            <span className="text-xs text-white/40 ml-auto">{imageUrls.length} images</span>
          </div>
          
          {imageUrls.length === 0 ? (
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center">
              <ImageIcon className="w-10 h-10 mx-auto text-white/20 mb-3" />
              <p className="text-white/40 text-sm mb-3">No images uploaded</p>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10 gap-2" asChild>
                  <span>
                    <Plus className="w-4 h-4" /> Add Images
                  </span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {imageUrls.map((url, index) => (
                  <div 
                    key={`${url}-${index}`} 
                    className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black/20"
                  >
                    <Image
                      src={resolveMediaUrl(url)}
                      alt={`${car.brand} ${car.model} - ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        onClick={() => moveImage(index, index - 1)}
                        disabled={index === 0}
                      >
                        ←
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        onClick={() => moveImage(index, index + 1)}
                        disabled={index === imageUrls.length - 1}
                      >
                        →
                      </Button>
                    </div>
                    
                    {/* Badge */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                        MAIN
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <label className="cursor-pointer block">
                <div className="flex items-center justify-center gap-2 py-3 border border-dashed border-white/20 rounded-xl hover:border-primary/50 transition-colors">
                  {uploading ? (
                    <span className="text-sm text-white/50">Uploading...</span>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-primary/60" />
                      <span className="text-sm text-white/50">Add more images</span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Details Form */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Car className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-white">Vehicle Details</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Brand</Label>
                <Input 
                  value={form.brand} 
                  onChange={e => update("brand", e.target.value)} 
                  className="bg-white/5 border-white/10 text-white h-10" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Model</Label>
                <Input 
                  value={form.model} 
                  onChange={e => update("model", e.target.value)} 
                  className="bg-white/5 border-white/10 text-white h-10" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Daily Fee (MAD)</Label>
                <Input 
                  type="number" 
                  value={form.dailyFee} 
                  onChange={e => update("dailyFee", Number(e.target.value))} 
                  className="bg-white/5 border-white/10 text-white h-10" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Seats</Label>
                <Input 
                  type="number" 
                  value={form.seats} 
                  onChange={e => update("seats", Number(e.target.value))} 
                  className="bg-white/5 border-white/10 text-white h-10" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Inventory</Label>
                <Input 
                  type="number" 
                  value={form.inventory} 
                  onChange={e => update("inventory", Number(e.target.value))} 
                  className="bg-white/5 border-white/10 text-white h-10" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Transmission</Label>
                <Select value={form.transmission} onValueChange={v => update("transmission", v as Transmission)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-white/10">
                    {Object.values(Transmission).map(v => (
                      <SelectItem key={v} value={v} className="text-white">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Fuel Type</Label>
                <Select value={form.fuelType} onValueChange={v => update("fuelType", v as FuelType)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-white/10">
                    {Object.values(FuelType).map(v => (
                      <SelectItem key={v} value={v} className="text-white">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
