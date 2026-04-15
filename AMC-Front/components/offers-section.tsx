"use client"

import Link from "next/link"
import { ShieldCheck, Crown, Users2, Phone, ArrowRight, Sparkles } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"

const programs = [
  {
    icon: ShieldCheck,
    titleKey: "offers.protection",
    descKey: "offers.protection.desc",
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
  },
  {
    icon: Users2,
    titleKey: "offers.concierge",
    descKey: "offers.concierge.desc",
    gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
  },
  {
    icon: Crown,
    titleKey: "offers.vip",
    descKey: "offers.vip.desc",
    gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10 group-hover:bg-purple-500/20",
  },
]

export function OffersSection() {
  const { t } = useI18n()

  return (
    <section id="programs" className="relative py-32 overflow-hidden">
      {/* Grey/charcoal background */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        <div className="grid gap-16 lg:grid-cols-2 items-start">
          {/* Left column - Programs */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-primary" />
                <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">
                  {t("offers.badge")}
                </p>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
                {t("offers.title")}
              </h2>
              <p className="text-lg text-white/60 leading-relaxed max-w-lg">
                {t("offers.subtitle")}
              </p>
            </div>

            {/* Program cards */}
            <div className="space-y-4">
              {programs.map((program, index) => (
                <div
                  key={index}
                  className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-primary/30 transition-all duration-500 overflow-hidden cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Hover gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${program.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <div className="relative z-10 flex items-start gap-5">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 p-4 rounded-xl ${program.iconBg} transition-colors duration-300`}
                    >
                      <program.icon className={`w-6 h-6 ${program.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-2 font-display group-hover:text-primary transition-colors">
                        {t(program.titleKey)}
                      </h3>
                      <p className="text-white/60 leading-relaxed">
                        {t(program.descKey)}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-primary transform group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Contact card */}
          <div className="lg:sticky lg:top-32">
            <div className="relative rounded-3xl overflow-hidden">
              {/* Card background with gradient border effect */}
              <div className="absolute -inset-px bg-gradient-to-br from-primary/50 via-primary/20 to-transparent rounded-3xl" />

              <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-neutral-900 rounded-3xl p-8 md:p-10">
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

                {/* Content */}
                <div className="relative z-10 space-y-8">
                  {/* Header */}
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-primary/80 font-semibold mb-2">
                      {t("offers.desk")}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Phone className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-3xl md:text-4xl font-display text-white font-bold tracking-tight" dir="ltr">
                        +212 668 952 313
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/60 text-lg leading-relaxed">
                    {t("offers.desk.desc")}
                  </p>

                  {/* Features list */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      t("offers.features.corporate"),
                      t("offers.features.hotel"),
                      t("offers.features.event"),
                      t("offers.features.airport"),
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-primary text-black hover:bg-primary/90 font-bold h-16 text-lg shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.02]"
                  >
                    <Link href="#contact" className="flex items-center justify-center gap-2">
                      {t("offers.cta")}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>

                  {/* Trust badge */}
                  <p className="text-center text-sm text-white/40">
                    {t("offers.trust")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
