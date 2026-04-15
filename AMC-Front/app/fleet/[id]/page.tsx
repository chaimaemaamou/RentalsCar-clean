"use client"

import { useParams } from "next/navigation"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { FleetDetail } from "@/components/fleet-detail"

export default function FleetDetailPage() {
  const params = useParams<{ id: string }>()
  const carId = params?.id ?? ""

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1 pt-24 pb-16">
        <FleetDetail carId={carId} />
      </main>
      <SiteFooter />
    </div>
  )
}

