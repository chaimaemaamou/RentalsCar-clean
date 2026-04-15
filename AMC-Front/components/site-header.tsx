"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, Phone } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useI18n } from "@/lib/i18n-context"

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: t("nav.fleet"), href: "/#fleet" },
    { name: t("nav.services"), href: "/#services" },
    { name: t("nav.programs"), href: "/#programs" },
    { name: t("nav.contact"), href: "/#contact" },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-black/90 backdrop-blur-xl border-b border-white/10 py-3"
          : "bg-gradient-to-b from-black/50 to-transparent py-5",
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo - bigger and standalone */}
          <Link href="/" className="flex items-center group">
            <div className="relative w-16 h-16 md:w-20 md:h-20 transition-all duration-300 group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="AMC Logo"
                fill
                className="object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              />
            </div>
          </Link>

          {/* Desktop Navigation - enhanced */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative px-5 py-2 text-sm font-medium text-white/80 hover:text-white transition-all duration-300 tracking-wide group"
              >
                <span className="relative z-10">{link.name}</span>
                {/* Hover background */}
                <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
                {/* Underline */}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0 transition-all duration-300 group-hover:w-3/4" />
              </Link>
            ))}
          </nav>

          {/* Right side actions - enhanced */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Phone number - always LTR */}
            <a
              href="tel:+212668952313"
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              dir="ltr"
            >
              <Phone className="w-4 h-4 text-primary" />
              <span className="font-medium">+212 668 952 313</span>
            </a>

            <div className="w-px h-6 bg-white/20" />

            <LanguageSwitcher />

            <Button
              asChild
              className="bg-primary text-black hover:bg-primary/90 font-bold px-6 h-11 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.02]"
            >
              <Link href="/#fleet">{t("hero.cta")}</Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-semibold px-6 h-11 transition-all"
            >
              <Link href="/login">{t("nav.login")}</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 lg:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:text-primary hover:border-primary/50 transition-all"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - enhanced */}
      <div
        className={cn(
          "lg:hidden absolute top-full left-0 right-0 bg-black/98 backdrop-blur-xl border-b border-white/10 overflow-hidden transition-all duration-500",
          isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col p-6 gap-2">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg font-medium text-white/90 hover:text-primary transition-all p-4 rounded-xl hover:bg-white/5 border-b border-white/5"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-4 space-y-3">
            {/* Phone in mobile - always LTR */}
            <a
              href="tel:+212668952313"
              className="flex items-center justify-center gap-2 text-white/70 hover:text-white transition-colors py-3"
              dir="ltr"
            >
              <Phone className="w-5 h-5 text-primary" />
              <span className="font-medium">+212 668 952 313</span>
            </a>

            <Button
              asChild
              className="w-full bg-primary text-black hover:bg-primary/90 font-bold h-14 text-lg shadow-lg shadow-primary/25"
            >
              <Link href="/#fleet" onClick={() => setIsMobileMenuOpen(false)}>
                {t("hero.cta")}
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10 font-semibold h-14 text-lg"
            >
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                {t("nav.login")}
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
}
