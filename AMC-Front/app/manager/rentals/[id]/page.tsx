"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { api, type RentalResponseDto } from "@/lib/api"
import {
  Calendar,
  Car,
  User,
  Mail,
  Phone,
  FileText,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
  Clock3,
  CreditCard,
  Info,
  Printer,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const SECURITY_DEPOSIT_MAD = 5000

type StatusAction = {
  key: string
  label: string
  description: string
  cta: string
  variant: "default" | "secondary" | "outline"
  type: "simple" | "activation"
  handler?: () => void
}

export default function RentalDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = Number(params?.id)
  const [rental, setRental] = useState<RentalResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isActivationDialogOpen, setIsActivationDialogOpen] = useState(false)
  const [activationContext, setActivationContext] = useState<{ title: string; description: string } | null>(null)
  const [editedTotalPrice, setEditedTotalPrice] = useState<string>("")

  useEffect(() => {
    if (!id || Number.isNaN(id)) return
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await api.rentals.getById(id)
        if (!active) return
        setRental(data)
      } catch (e: any) {
        if (active) setError(e.message || "Failed to load rental")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id])

  const runStatusMutation = useCallback(
    async (
      operation: () => Promise<void>,
      successTitle: string,
      successDescription: string,
      errorTitle: string,
    ): Promise<RentalResponseDto | undefined> => {
      if (!rental) return undefined
      try {
        await operation()
        const updated = await api.rentals.getById(rental.id)
        setRental(updated)
        toast({ title: successTitle, description: successDescription })
        return updated
      } catch (e: any) {
        toast({ title: errorTitle, description: e.message, variant: "destructive" })
        return undefined
      }
    },
    [rental, toast],
  )

  async function handleDelete() {
    if (!rental) return
    try {
      await api.rentals.delete(rental.id)
      toast({ title: "Rental deleted", description: `Rental ID ${rental.id} removed.` })
      router.push("/manager/rentals")
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" })
    } finally {
      setDeleteOpen(false)
    }
  }

  const statusBadgeConfig = useMemo(() => {
    if (!rental) return null
    const palette: Record<string, string> = {
      DEMANDED: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      APPROVED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      ACTIVE: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      RETURNED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    }
    const label = rental.status.charAt(0) + rental.status.slice(1).toLowerCase()
    return { label, className: palette[rental.status] ?? palette.RETURNED }
  }, [rental])

  const statusActions = useMemo<StatusAction[]>(() => {
    if (!rental) return []
    const method = rental.paymentMethod || rental.reservationMethod
    const actions: StatusAction[] = []

    if (rental.status === "DEMANDED" && method === "DELIVERY") {
      actions.push({
        key: "approve",
        label: "Approve delivery",
        description: "Confirm driver assignment before activation.",
        cta: "Approve",
        handler: () =>
          runStatusMutation(
            () => api.rentals.approve(rental.id),
            "Rental approved",
            `Rental ID ${rental.id} approved.`,
            "Approve failed",
          ),
        variant: "default",
        type: "simple",
      })
    }

    if (rental.status === "DEMANDED" && method === "AGENCY") {
      actions.push({
        key: "activate-agency",
        label: "Activate pickup",
        description: "Customer picked up the car at the agency.",
        cta: "Activate",
        variant: "secondary",
        type: "activation",
      })
    }

    if (rental.status === "APPROVED") {
      actions.push({
        key: "activate-delivery",
        label: "Mark delivery complete",
        description: "Driver delivered the car to the customer.",
        cta: "Activate",
        variant: "secondary",
        type: "activation",
      })
    }

    if (rental.status === "ACTIVE") {
      actions.push({
        key: "return",
        label: "Mark as returned",
        description: "Vehicle inspected and back in stock.",
        cta: "Return",
        handler: () =>
          runStatusMutation(
            () => api.rentals.returnCar(rental.id),
            "Rental returned",
            `Rental ID ${rental.id} marked as returned.`,
            "Return failed",
          ),
        variant: "outline",
        type: "simple",
      })
    }

    return actions
  }, [rental, runStatusMutation])

  const paymentMethod = rental?.paymentMethod || rental?.reservationMethod || "—"

  const openActivationDialog = useCallback(
    (actionLabel: string, actionDescription: string) => {
      if (!rental) return
      setActivationContext({ title: actionLabel, description: actionDescription })
      setEditedTotalPrice(rental.totalPrice?.toString() ?? "")
      setIsActivationDialogOpen(true)
    },
    [rental],
  )

  const handleActionClick = (action: StatusAction) => {
    if (action.type === "activation") {
      openActivationDialog(action.label, action.description)
    } else {
      action.handler?.()
    }
  }

  const handlePrintInvoice = useCallback(() => {
    if (!rental) return
    const invoiceWindow = window.open("", "_blank", "width=900,height=700")
    if (!invoiceWindow) return
    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${rental.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; background: #0b0b0f; color: #f5f5f5; }
            h1 { margin-bottom: 0; }
            .muted { color: #a5a5b8; font-size: 12px; }
            .section { margin-top: 24px; padding: 16px; border: 1px solid #2e2e3b; border-radius: 12px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
            .label { font-size: 12px; text-transform: uppercase; color: #a5a5b8; letter-spacing: 0.08em; }
            .value { font-weight: 600; margin-top: 4px; font-size: 15px; }
            table { width: 100%; margin-top: 16px; border-collapse: collapse; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #252530; }
            th { background: #111118; }
            .total { font-size: 20px; font-weight: 700; color: #f2c17d; }
          </style>
        </head>
        <body>
          <h1>Invoice #${rental.id}</h1>
          <p class="muted">Generated ${new Date().toLocaleDateString()}</p>

          <div class="section grid">
            <div>
              <div class="label">Customer</div>
              <div class="value">${rental.customerName}</div>
              <div class="muted">${rental.customerEmail} · ${rental.customerPhone}</div>
            </div>
            <div>
              <div class="label">Vehicle</div>
              <div class="value">${rental.carBrand} ${rental.carModel}</div>
              <div class="muted">Daily rate: MAD ${rental.dailyRate}</div>
            </div>
            <div>
              <div class="label">Schedule</div>
              <div class="value">${rental.rentalDate} → ${rental.returnDate}</div>
              <div class="muted">${rental.totalDays} days total</div>
            </div>
          </div>

          <div class="section">
            <table>
              <tr><th>Description</th><th>Amount (MAD)</th></tr>
              <tr><td>Rental (${rental.totalDays} days × MAD ${rental.dailyRate})</td><td>${rental.dailyRate * rental.totalDays}</td></tr>
              <tr><td>Delivery fee</td><td>${rental.deliveryFee}</td></tr>
              <tr><td class="total">Total due</td><td class="total">${rental.totalPrice}</td></tr>
            </table>
          </div>
          <div class="section">
            <h2>Security deposit clause</h2>
            <p class="muted">
              The client acknowledges a refundable security deposit of MAD ${SECURITY_DEPOSIT_MAD.toLocaleString("en-US")} which is
              only debited if post-return inspection identifies damages, traffic fines, fuel shortages, or any breach of the signed contract.
              No amount is blocked at pickup; the clause is activated only if an incident is confirmed.
            </p>
          </div>
        </body>
      </html>
    `)
    invoiceWindow.document.close()
    invoiceWindow.focus()
    invoiceWindow.print()
  }, [rental])

  const openContractDocument = useCallback((contractRental: RentalResponseDto) => {
    const contractWindow = window.open("", "_blank", "width=900,height=900")
    if (!contractWindow) return
    const depositAmount = SECURITY_DEPOSIT_MAD.toLocaleString("en-US")
    contractWindow.document.write(`
      <html>
        <head>
          <title>Rental Contract #${contractRental.id}</title>
          <style>
            body { font-family: "Inter", Arial, sans-serif; padding: 40px; background: #0b0b0f; color: #f5f5f5; line-height: 1.6; }
            h1, h2 { margin-bottom: 8px; }
            .muted { color: #9b9bb3; font-size: 13px; }
            .section { margin-top: 24px; padding: 20px; border: 1px solid #2e2e3b; border-radius: 16px; background: #111118; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
            .label { text-transform: uppercase; font-size: 11px; letter-spacing: 0.2em; color: #8d8da7; }
            .value { font-weight: 600; font-size: 15px; margin-top: 4px; }
            .signature { margin-top: 40px; display: flex; justify-content: space-between; gap: 40px; }
            .signature div { flex: 1; text-align: center; }
            .signature-line { margin-top: 48px; border-top: 1px solid #2e2e3b; padding-top: 8px; font-size: 12px; color: #8d8da7; }
            .toolbar { position: sticky; top: 0; margin: -40px -40px 24px; padding: 16px 40px; background: rgba(11,11,15,0.9); display: flex; justify-content: flex-end; border-bottom: 1px solid #2e2e3b; }
            .toolbar button { background: #f2c17d; border: none; color: #0b0b0f; font-weight: 600; padding: 10px 16px; border-radius: 999px; cursor: pointer; box-shadow: 0 10px 30px rgba(242,193,125,0.25); }
            .toolbar button:hover { background: #f6d3a6; }
          </style>
        </head>
        <body>
          <div class="toolbar">
            <button onclick="window.print()">Download / Print PDF</button>
          </div>
          <h1>Vehicle Rental Contract</h1>
          <p class="muted">Generated on ${new Date().toLocaleDateString()} once the rental enters ACTIVE status.</p>

          <div class="section grid">
            <div>
              <div class="label">Customer</div>
              <div class="value">${contractRental.customerName}</div>
              <div class="muted">${contractRental.customerEmail} · ${contractRental.customerPhone}</div>
            </div>
            <div>
              <div class="label">Vehicle</div>
              <div class="value">${contractRental.carBrand} ${contractRental.carModel}</div>
              <div class="muted">Daily rate: MAD ${contractRental.dailyRate}</div>
            </div>
            <div>
              <div class="label">Schedule</div>
              <div class="value">${contractRental.rentalDate} → ${contractRental.returnDate}</div>
              <div class="muted">${contractRental.totalDays} days · Delivery fee MAD ${contractRental.deliveryFee}</div>
            </div>
          </div>

          <div class="section">
            <h2>Security deposit clause</h2>
            <p>
              Deposit: <strong>MAD ${depositAmount}</strong>. Only charged if post-return inspection confirms damage, missing fuel, fines,
              or misuse. Nothing is blocked at pickup.
            </p>
          </div>

          <div class="section">
            <h2>Acceptance</h2>
            <p>
              By signing after receiving the vehicle, the customer accepts these terms and authorizes AMC to bill proven incidents up to the
              deposit amount.
            </p>
          </div>

          <div class="signature">
            <div>
              <div class="signature-line">Customer signature</div>
              <p>${contractRental.customerName}</p>
            </div>
            <div>
              <div class="signature-line">Manager signature</div>
              <p>AMC Representative</p>
            </div>
          </div>
        </body>
      </html>
    `)
    contractWindow.document.close()
    contractWindow.focus()
  }, [])

  const handleConfirmActivation = useCallback(async () => {
    if (!rental) return
    const parsedPrice = Number(editedTotalPrice)
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a positive total price (MAD).",
        variant: "destructive",
      })
      return
    }
    const updatedRental = await runStatusMutation(
      async () => {
        if (parsedPrice !== rental.totalPrice) {
          await api.rentals.updatePricing(rental.id, parsedPrice)
        }
        await api.rentals.activate(rental.id)
      },
      "Rental activated",
      `Rental ID ${rental.id} activated.`,
      "Activate failed",
    )
    if (updatedRental) {
      openContractDocument(updatedRental)
    }
    setIsActivationDialogOpen(false)
  }, [editedTotalPrice, openContractDocument, rental, runStatusMutation, toast])

  const handlePrintFromDialog = useCallback(() => {
    if (!rental) return
    const parsedPrice = Number(editedTotalPrice)
    const previewRental: RentalResponseDto = {
      ...rental,
      totalPrice: Number.isNaN(parsedPrice) || parsedPrice <= 0 ? rental.totalPrice : parsedPrice,
    }
    openContractDocument(previewRental)
  }, [editedTotalPrice, openContractDocument, rental])

  const statusTimeline = useMemo(() => {
    const steps: Array<{ key: string; label: string; description: string }> = [
      { key: "DEMANDED", label: "Requested", description: "Customer submitted booking." },
      { key: "APPROVED", label: "Approved", description: "Manager validated delivery." },
      { key: "ACTIVE", label: "Active", description: "Vehicle handed to customer." },
      { key: "RETURNED", label: "Returned", description: "Car inspected and stocked." },
    ]
    const currentIndex = rental ? steps.findIndex((step) => step.key === rental.status) : -1
    return steps.map((step, index) => ({
      ...step,
      completed: currentIndex >= index,
      active: currentIndex === index,
    }))
  }, [rental])

  if (loading) return <p className="p-6 text-muted-foreground">Loading rental details...</p>
  if (error) return <p className="p-6 text-red-400">{error}</p>
  if (!rental) return <p className="p-6 text-muted-foreground">Rental not found.</p>

  return (
    <div className="space-y-8 rounded-3xl border border-white/5 bg-gradient-to-b from-black/80 via-[#0b0b0b] to-[#020202] p-6 text-white shadow-2xl">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-primary/10 via-black/60 to-black/80 p-6 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Link href="/manager/rentals" className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-white/70">
                <ArrowLeft className="h-3 w-3" /> Back to rentals
              </Link>
              <span>Rental #{rental.id}</span>
            </div>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">
                {rental.carBrand} {rental.carModel}
              </h1>
              <p className="text-white/70">
                {rental.customerName} · {rental.customerPhone}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusBadgeConfig && <Badge className={statusBadgeConfig.className}>{statusBadgeConfig.label}</Badge>}
              <Badge variant="outline" className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> {paymentMethod}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock3 className="h-3 w-3" /> {rental.totalDays} days
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-white/20 text-white/80" onClick={() => router.push("/manager/rentals")}>
              Back to list
            </Button>
            <Button
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10"
              onClick={handlePrintInvoice}
            >
              <Printer className="mr-2 h-4 w-4" /> Print invoice
            </Button>
            {statusActions.map((action) => (
              <Button
                key={action.key}
                variant={action.variant}
                className={action.variant === "default" ? "bg-blue-600 text-white" : undefined}
                onClick={() => handleActionClick(action)}
              >
                {action.cta}
              </Button>
            ))}

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={rental.status === "ACTIVE"}>
                  Delete rental
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete rental #{rental.id}</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action removes the rental permanently. Active rentals must be returned before deletion.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Live journey</p>
            <h2 className="text-2xl font-display font-semibold text-white">Journey status</h2>
          </div>
          <span className="text-xs text-white/50">Updated {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="bg-gradient-to-br from-[#171730] via-[#0c0c19] to-black border-white/10 text-white shadow-2xl lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" /> Status timeline
                </CardTitle>
                <p className="text-sm text-white/70">Full lifecycle for this rental.</p>
              </div>
              {statusBadgeConfig && <Badge className={statusBadgeConfig.className}>{statusBadgeConfig.label}</Badge>}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-6">
                {statusTimeline.map((step, index) => (
                  <div key={step.key} className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border text-sm font-medium shadow-lg ${
                        step.completed
                          ? "bg-gradient-to-br from-primary to-amber-300 text-black border-transparent"
                          : "border-white/20 text-white/60"
                      }`}
                    >
                      {step.completed ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{step.label}</p>
                      <p className="text-xs text-white/60">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <p className="text-xs uppercase text-white/50">Pickup</p>
                  <p className="font-semibold">{rental.rentalDate}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <p className="text-xs uppercase text-white/50">Return</p>
                  <p className="font-semibold">{rental.returnDate}</p>
                  <p className="text-xs text-white/40">Actual: {rental.actualReturnDate || "—"}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <p className="text-xs uppercase text-white/50">Total</p>
                  <p className="text-xl font-bold text-primary"> MAD{rental.totalPrice}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#201328] via-[#140a1b] to-black border-white/10 text-white shadow-2xl">
            <CardHeader>
              <CardTitle>Action center</CardTitle>
              <p className="text-sm text-white/70">Only available transitions are listed.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {statusActions.length === 0 ? (
                <p className="text-sm text-white/60">All status updates are complete.</p>
              ) : (
                statusActions.map((action) => (
                  <div key={action.key} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div>
                      <p className="font-semibold">{action.label}</p>
                      <p className="text-sm text-white/60">{action.description}</p>
                    </div>
                    <Button variant={action.variant} onClick={() => handleActionClick(action)}>
                      {action.cta}
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Key information</p>
            <h2 className="text-2xl font-display font-semibold text-white">Rental essentials</h2>
          </div>
          <span className="text-xs text-white/50">All data linked to booking #{rental.id}</span>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-gradient-to-br from-[#14202c] via-[#0c141b] to-black border-white/10 text-white shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{rental.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email:
              </span>
              <span className="font-medium text-sm">{rental.customerEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" /> Phone:
              </span>
              <span className="font-medium">{rental.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" /> License:
              </span>
              <span className="font-medium font-mono">{rental.driverLicenseNumber}</span>
            </div>
          </CardContent>
        </Card>

          <Card className="bg-gradient-to-br from-[#1f150d] via-[#120a05] to-black border-white/10 text-white shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Car ID:</span>
              <span className="font-medium font-mono">#{rental.carId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Brand:</span>
              <span className="font-medium">{rental.carBrand}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model:</span>
              <span className="font-medium">{rental.carModel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Daily Rate:</span>
              <span className="font-bold text-primary"> MAD{rental.dailyRate}</span>
            </div>
          </CardContent>
        </Card>

          <Card className="bg-gradient-to-br from-[#111522] via-[#090b14] to-black border-white/10 text-white shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Rental Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pickup Date</span>
              <span className="font-medium">{rental.rentalDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Return Date</span>
              <span className="font-medium">{rental.returnDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Actual Return</span>
              <span className="font-medium">{rental.actualReturnDate || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Days</span>
              <span className="font-bold">{rental.totalDays} days</span>
            </div>
          </CardContent>
        </Card>

          <Card className="bg-gradient-to-br from-[#20120a] via-[#140a04] to-black border-white/10 text-white shadow-xl xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Payment & Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method:</span>
              <Badge variant="outline">{paymentMethod}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Daily Rate:</span>
              <span className="font-medium"> MAD{rental.dailyRate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Days:</span>
              <span className="font-medium">{rental.totalDays}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee:</span>
              <span className="font-medium"> MAD{rental.deliveryFee}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-semibold">Total Price:</span>
              <span className="text-2xl font-bold text-primary"> MAD{rental.totalPrice}</span>
            </div>
          </CardContent>
        </Card>
        </div>
      </section>
      <Dialog open={isActivationDialogOpen} onOpenChange={setIsActivationDialogOpen}>
        <DialogContent className="bg-black/90 border-white/10 text-white sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{activationContext?.title ?? "Activate rental"}</DialogTitle>
            <DialogDescription className="text-white/60">
              {activationContext?.description ?? "Review the details below before activation."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 text-white/80">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-white/40">Customer</p>
                <p className="font-semibold">{rental.customerName}</p>
                <p className="text-xs text-white/40">{rental.customerPhone}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-white/40">Vehicle</p>
                <p className="font-semibold">
                  {rental.carBrand} {rental.carModel}
                </p>
                <p className="text-xs text-white/40">Daily rate: MAD {rental.dailyRate}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-white/80">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-white/40">Pickup</p>
                <p className="font-semibold">{rental.rentalDate}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-white/40">Return</p>
                <p className="font-semibold">{rental.returnDate}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-widest text-white/40">Final total (MAD)</p>
              <Input
                type="number"
                min={1}
                value={editedTotalPrice}
                onChange={(e) => setEditedTotalPrice(e.target.value)}
                className="bg-black/60 border-white/20 text-white"
              />
              <p className="text-xs text-white/40">Only the total amount can be adjusted before activation.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-white/70">
              <p className="font-semibold text-primary/80">
                Security deposit clause · MAD {SECURITY_DEPOSIT_MAD.toLocaleString("en-US")}
              </p>
              <p>
                This deposit is applied only if damages, unpaid fines, or contract breaches are confirmed after the vehicle is returned.
                A printable contract will be generated automatically at activation so the customer can acknowledge the clause.
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-row items-center justify-end gap-2">
            <Button
              variant="outline"
              className="border-white/30 text-white/80 hover:text-white hover:border-white/60"
              onClick={handlePrintFromDialog}
            >
              <Printer className="mr-2 h-4 w-4" /> Print contract
            </Button>
            <Button variant="outline" className="border-white/20 text-white" onClick={() => setIsActivationDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-primary text-black hover:bg-primary/90" onClick={handleConfirmActivation}>
              Confirm & Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
