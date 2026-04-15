"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin, ArrowRight, Sparkles, Linkedin } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function SiteFooter() {
  const { t } = useI18n()

  return (
    <footer id="contact" className="relative bg-neutral-950 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-black" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-1/2 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Main footer content */}
      <div className="relative z-10 container px-4 md:px-6 mx-auto pt-24 pb-12">
        {/* Top CTA Section */}
        <div className="relative rounded-3xl overflow-hidden mb-20">
          <div className="absolute -inset-px bg-gradient-to-r from-primary/50 via-primary/20 to-primary/50 rounded-3xl" />
          <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-neutral-900 rounded-3xl p-10 md:p-14">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm uppercase tracking-widest text-primary font-semibold">
                    {t("footer.ready")}
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
                  {t("footer.cta.title")}
                </h3>
                <p className="text-muted-foreground text-lg max-w-xl">
                  {t("footer.cta.subtitle")}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-black hover:bg-primary/90 font-bold px-8 h-14 text-lg shadow-lg shadow-primary/25"
                >
                  <Link href="/#fleet" className="flex items-center gap-2">
                    {t("footer.browse")}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-14 text-lg"
                >
                  <a href="tel:+212668952313">{t("footer.call")}</a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand column */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <div className="relative w-24 h-24 transition-transform duration-300 hover:scale-105">
                <Image
                  src="/images/logo.png"
                  alt="AMC Logo"
                  fill
                  className="object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                />
              </div>
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" },
              ].map((social, i) => (
                <Link
                  key={i}
                  href={social.href}
                  className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-primary hover:border-primary hover:text-black transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 font-display flex items-center gap-2">
              <span className="w-8 h-px bg-primary" />
              {t("footer.links")}
            </h3>
            <ul className="space-y-4">
              {[
                { name: t("nav.home"), href: "/" },
                { name: t("nav.fleet"), href: "/#fleet" },
                { name: t("nav.services"), href: "/#services" },
                { name: t("nav.contact"), href: "/#contact" },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 font-display flex items-center gap-2">
              <span className="w-8 h-px bg-primary" />
              {t("footer.contact")}
            </h3>
            <ul className="space-y-5">
              <li>
                <a
                  href="https://www.google.com/maps/place/Dcheira+market/@30.3684354,-9.5382364,130m/data=!3m1!1e3!4m10!1m2!2m1!1zINit2Yog2KrZg9ix2YPZiNix2Kog2KfZhNiv2LTZitix2Kkg2KfZhNis2YfYp9iv2YrYqQ!3m6!1s0xdb3c8069feaed51:0xd7073f424a74dd6b!8m2!3d30.3684941!4d-9.5379715!15sCjPYrdmKINiq2YPYsdmD2YjYsdiqINin2YTYr9i02YrYsdipINin2YTYrNmH2KfYr9mK2KlaNSIz2K3ZiiDYqtmD2LHZg9mI2LHYqiDYp9mE2K_YtNmK2LHYqSDYp9mE2KzZh9in2K_ZitipkgEGbWFya2V0mgEjQ2haRFNVaE5NRzluUzBWSlEwRm5TVVJYYldGcFNrNUJFQUXgAQD6AQQIABA3!16s%2Fg%2F1hm1pwqmx?entry=ttu&g_ep=EgoyMDI2MDEwNy4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 text-muted-foreground hover:text-white transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <span className="pt-1">Dcheira Market, Agadir</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+212668952313"
                  className="flex items-center gap-4 text-muted-foreground hover:text-white transition-colors group"
                  dir="ltr"
                >
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <span>+212 668 952 313</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+212600365574"
                  className="flex items-center gap-4 text-muted-foreground hover:text-white transition-colors group"
                  dir="ltr"
                >
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <span>+212 600 365 574</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:achirmaamoucar@gmail.com"
                  className="flex items-center gap-4 text-muted-foreground hover:text-white transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <span>achirmaamoucar@gmail.com</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 font-display flex items-center gap-2">
              <span className="w-8 h-px bg-primary" />
              {t("footer.newsletter")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("footer.newsletter.desc")}
            </p>
            <form className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder={t("footer.newsletter.placeholder")}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-black hover:bg-primary/90 font-bold h-12 shadow-lg shadow-primary/20"
              >
                {t("footer.subscribe")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
              <span>{t("footer.rights")}</span>
              <span className="hidden md:inline text-white/30">•</span>
              <span className="flex items-center gap-1.5">
                {t("footer.developer")}
                <a
                  href="https://www.linkedin.com/in/amine-ouchajaa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Amine Ouchajaa
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="hover:text-white transition-colors">
                    {t("footer.privacy")}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-neutral-900 border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-display text-white">{t("footer.privacy")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                    <p className="text-white font-medium">{t("privacy.intro")}</p>
                    <h3 className="text-primary font-semibold mt-4">{t("privacy.collection.title")}</h3>
                    <p>{t("privacy.collection.desc")}</p>
                    <h3 className="text-primary font-semibold mt-4">{t("privacy.usage.title")}</h3>
                    <p>{t("privacy.usage.desc")}</p>
                    <h3 className="text-primary font-semibold mt-4">{t("privacy.security.title")}</h3>
                    <p>{t("privacy.security.desc")}</p>
                    <h3 className="text-primary font-semibold mt-4">{t("privacy.contact.title")}</h3>
                    <p>{t("privacy.contact.desc")}</p>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="hover:text-white transition-colors">
                    {t("footer.terms")}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-neutral-900 border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-display text-white">{t("footer.terms")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
                    <p className="text-white font-medium">{t("terms.intro")}</p>
                    <h3 className="text-primary font-semibold mt-4">{t("terms.rental.title")}</h3>
                    <p>{t("terms.rental.desc")}</p>
                    <h3 className="text-primary font-semibold mt-4">{t("terms.payment.title")}</h3>
                    <p>{t("terms.payment.desc")}</p>
                    <h3 className="text-primary font-semibold mt-4">{t("terms.liability.title")}</h3>
                    <p>{t("terms.liability.desc")}</p>
                    <h3 className="text-primary font-semibold mt-4">{t("terms.cancellation.title")}</h3>
                    <p>{t("terms.cancellation.desc")}</p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
