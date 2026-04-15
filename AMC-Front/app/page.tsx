import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { FleetSection } from "@/components/fleet-section"
import { ServicesSection } from "@/components/services-section"
import { ProcessSection } from "@/components/process-section"
import { OffersSection } from "@/components/offers-section"
import { SiteFooter } from "@/components/site-footer"
import { fetchCars } from "@/lib/server/cars"

export default async function Home() {
  const cars = await fetchCars()

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <FleetSection limit={3} initialCars={cars} />
        <OffersSection />
        <ServicesSection />
        <ProcessSection />
      </main>
      <SiteFooter />
    </div>
  )
}
