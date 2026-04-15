"use client"

import { Shield, MapPin, Headphones, CreditCard, Plane, Key, ArrowUpRight } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { useState } from "react"

const services = [
  {
    titleKey: "services.airport",
    descKey: "services.airport.desc",
    icon: Plane,
    color: "from-sky-500 to-blue-600",
    lightColor: "bg-sky-500/10",
  },
  {
    titleKey: "services.chauffeur",
    descKey: "services.chauffeur.desc",
    icon: Key,
    color: "from-amber-500 to-orange-600",
    lightColor: "bg-amber-500/10",
  },
  {
    titleKey: "services.wedding",
    descKey: "services.wedding.desc",
    icon: Shield,
    color: "from-rose-500 to-pink-600",
    lightColor: "bg-rose-500/10",
  },
  {
    titleKey: "services.gps",
    descKey: "services.gps.desc",
    icon: MapPin,
    color: "from-emerald-500 to-teal-600",
    lightColor: "bg-emerald-500/10",
  },
  {
    titleKey: "services.support",
    descKey: "services.support.desc",
    icon: Headphones,
    color: "from-violet-500 to-purple-600",
    lightColor: "bg-violet-500/10",
  },
  {
    titleKey: "services.payment",
    descKey: "services.payment.desc",
    icon: CreditCard,
    color: "from-cyan-500 to-blue-600",
    lightColor: "bg-cyan-500/10",
  },
]

export function ServicesSection() {
  const { t } = useI18n()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section id="services" className="relative py-32 overflow-hidden">
      {/* Dark black section */}
      <div className="absolute inset-0 bg-black" />

      {/* Decorative grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Top/bottom lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/8 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">{t("services.premiumServices")}</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
            {t("services.title")}
          </h2>
          <p className="text-lg text-white/60 leading-relaxed">
            {t("services.subtitle")}
          </p>
        </div>

        {/* Services grid - Bento style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative rounded-3xl overflow-hidden cursor-pointer animate-fade-in-up"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Card background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02]" />

              {/* Hover gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              />

              {/* Border */}
              <div className="absolute inset-0 rounded-3xl border border-white/10 group-hover:border-primary/30 transition-colors duration-300" />

              {/* Content */}
              <div className="relative z-10 p-8 h-full flex flex-col">
                {/* Icon row */}
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`p-4 rounded-2xl ${service.lightColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <service.icon
                      className={`w-7 h-7 bg-gradient-to-br ${service.color} bg-clip-text`}
                      style={{
                        color:
                          hoveredIndex === index
                            ? undefined
                            : "currentColor",
                      }}
                    />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                </div>

                {/* Text content */}
                <h3 className="text-xl font-bold text-white mb-3 font-display group-hover:text-primary transition-colors duration-300">
                  {t(service.titleKey)}
                </h3>
                <p className="text-white/60 leading-relaxed flex-1">
                  {t(service.descKey)}
                </p>

                {/* Bottom accent line */}
                <div className="mt-6 h-1 w-12 rounded-full bg-white/10 group-hover:w-full group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-primary/50 transition-all duration-500" />
              </div>

              {/* Corner glow on hover */}
              <div
                className={`absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br ${service.color} rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-white/60">
            {t("services.cta").split("?")[0]}?{" "}
            <a href="#contact" className="text-primary hover:underline font-medium">
              {t("services.cta").split("?")[1] || "Contact our concierge team"}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
