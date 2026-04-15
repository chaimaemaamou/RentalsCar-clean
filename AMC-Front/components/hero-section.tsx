"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useI18n } from "@/lib/i18n-context"
import { ChevronDown, Sparkles } from "lucide-react"

export function HeroSection() { 
  const { t } = useI18n()

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          ref={(el) => { if (el) el.playbackRate = 1 }}
        >
          <source src="/images/agadirvid.mp4" type="video/mp4" />
        </video>
        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        {/* Animated grain texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
        {/* Subtle gold accent glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center pt-28 pb-20 relative z-10">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            {/* Floating badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-primary/30 backdrop-blur-sm mb-8 animate-fade-in-down"
            >
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm text-white/80 font-medium tracking-wide">
                {t("hero.badge")}
              </span>
            </div>

            {/* Main heading - no gradient/highlight, just white text */}
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-8 leading-[0.95] tracking-tight animate-fade-in-up"
            >
              {t("hero.title")}
            </h1>

            {/* Subtitle with elegant typography */}
            <p
              className="text-xl md:text-2xl text-white/70 mb-12 font-light max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-2"
            >
              {t("hero.subtitle")}
            </p>

            {/* CTA buttons with glass morphism */}
            <div
              className="flex flex-col sm:flex-row gap-4 animate-fade-in-up stagger-3"
            >
              <Button
                asChild
                size="lg"
                className="group relative bg-primary text-black hover:bg-primary/90 font-bold px-10 h-14 text-lg shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] animate-pulse-glow"
              >
                <Link href="/fleet">
                  <span className="relative z-10">{t("hero.cta")}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-md" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hover:border-primary/50 font-semibold px-10 h-14 text-lg backdrop-blur-sm bg-white/5 transition-all hover:scale-[1.02]"
              >
                <Link href="#contact">{t("hero.secondary")}</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div
              className="flex flex-wrap justify-center gap-8 mt-16 animate-fade-in-up stagger-4"
            >
              {[
                { value: "24/7", label: t("hero.stat.support") },
                { value: "100%", label: t("hero.stat.insured") },
                { value: "5★", label: t("hero.stat.rated") },
                { value: "0", label: t("hero.stat.fees") },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center group cursor-default">
                  <span className="text-2xl md:text-3xl font-display font-bold text-white group-hover:text-primary transition-colors">
                    {stat.value}
                  </span>
                  <span className="text-xs uppercase tracking-widest text-white/50 mt-1 group-hover:text-white/70 transition-colors">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <Link
          href="#features"
          className="flex flex-col items-center gap-2 text-white/40 hover:text-primary transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">{t("hero.scroll")}</span>
          <ChevronDown className="w-5 h-5" />
        </Link>
      </div>
    </section>
  )
}
