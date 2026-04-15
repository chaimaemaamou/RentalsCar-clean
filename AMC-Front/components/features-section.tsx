"use client"

import { Car, ShieldCheck, Clock, Award, ArrowRight, Phone } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"

const features = [
  {
    name: "features.exclusive",
    description: "features.exclusive.desc",
    icon: Car,
    accent: "from-amber-500/20 to-orange-500/20",
    iconBg: "bg-amber-500/10",
  },
  {
    name: "features.insurance",
    description: "features.insurance.desc",
    icon: ShieldCheck,
    accent: "from-emerald-500/20 to-teal-500/20",
    iconBg: "bg-emerald-500/10",
  },
  {
    name: "features.concierge",
    description: "features.concierge.desc",
    icon: Clock,
    accent: "from-blue-500/20 to-indigo-500/20",
    iconBg: "bg-blue-500/10",
  },
  {
    name: "features.price",
    description: "features.price.desc",
    icon: Award,
    accent: "from-purple-500/20 to-pink-500/20",
    iconBg: "bg-purple-500/10",
  },
]

export function FeaturesSection() {
  const { t } = useI18n()

  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Dark section with gold accents */}
      <div className="absolute inset-0 z-0 bg-neutral-950">
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(212,175,55,0.5) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        {/* Floating orbs */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-4 animate-fade-in">
            Why Choose Us
          </p>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
            {t("features.title")}
          </h2>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
            {t("features.subtitle")}
          </p>
        </div>

        {/* Feature cards with bento-style layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-primary/40 transition-all duration-500 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Hover gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Glow effect on hover */}
              <div className="absolute -inset-px bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl" />

              <div className="relative z-10">
                {/* Icon with animated background */}
                <div className="mb-8 relative">
                  <div
                    className={`inline-flex p-5 rounded-2xl ${feature.iconBg} group-hover:bg-primary/20 transition-colors duration-500`}
                  >
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  {/* Decorative ring */}
                  <div className="absolute -inset-2 rounded-3xl border border-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-white mb-4 font-display group-hover:text-primary transition-colors duration-300">
                  {t(feature.name)}
                </h3>
                <p className="text-white/60 leading-relaxed text-lg">
                  {t(feature.description)}
                </p>
              </div>

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-white/60 mb-4">{t("features.contactCta")}</p>
          <a
            href="tel:+212668952313"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-black transition-all duration-300 group"
          >
            <Phone className="w-5 h-5" />
            <span className="text-lg font-semibold" dir="ltr">+212 668 952 313</span>
          </a>
        </div>
      </div>
    </section>
  )
}
