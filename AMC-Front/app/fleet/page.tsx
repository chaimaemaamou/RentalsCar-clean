"use client"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { FleetPageContent } from "@/components/fleet-page-content"

export default function FleetPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <FleetPageContent />
      <SiteFooter />
    </div>
  )
}
