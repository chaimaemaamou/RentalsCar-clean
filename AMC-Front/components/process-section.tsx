"use client"

import { Calendar, CreditCard, Car, Key, Check, ArrowRight } from "lucide-react"
import { useI18n } from "@/lib/i18n-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

const steps = [
  {
    number: "01",
    titleKey: "process.step1",
    descKey: "process.step1.desc",
    icon: Car,
    detailKeys: ["process.details.specs", "process.details.availability"],
  },
  {
    number: "02",
    titleKey: "process.step2",
    descKey: "process.step2.desc",
    icon: Calendar,
    detailKeys: ["process.details.booking", "process.details.pricing", "process.details.noFees"],
  },
  {
    number: "03",
    titleKey: "process.step3",
    descKey: "process.step3.desc",
    icon: CreditCard,
    detailKeys: ["process.details.agency", "process.details.delivery", "process.details.flexible"],
  },
  {
    number: "04",
    titleKey: "process.step4",
    descKey: "process.step4.desc",
    icon: Key,
    detailKeys: ["process.details.support", "process.details.insurance", "process.details.unlimited"],
  },
]

export function ProcessSection() {
  const { t } = useI18n()
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section id="process" className="relative py-32 overflow-hidden">
      {/* Dark black background with gold accents */}
      <div className="absolute inset-0 bg-neutral-950" />

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Large background number */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40rem] font-display font-bold text-primary/[0.03] pointer-events-none select-none">
        {steps[activeStep].number}
      </div>

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/8 rounded-full blur-[150px] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold mb-4">
            How It Works
          </p>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
            {t("process.title")}
          </h2>
          <p className="text-lg text-white/60 leading-relaxed">
            {t("process.subtitle")}
          </p>
        </div>

        {/* Process visualization */}
        <div className="max-w-6xl mx-auto">
          {/* Desktop timeline */}
          <div className="hidden lg:block">
            {/* Progress bar */}
            <div className="relative mb-16">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2" />
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary to-primary/50 -translate-y-1/2 transition-all duration-700"
                style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
              />

              {/* Step indicators */}
              <div className="relative flex justify-between">
                {steps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className="group flex flex-col items-center"
                  >
                    {/* Circle */}
                    <div
                      className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                        index <= activeStep
                          ? "bg-primary text-black scale-110"
                          : "bg-white/5 text-white/50 border border-white/10 hover:border-primary/30"
                      }`}
                    >
                      {index < activeStep ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}

                      {/* Pulse ring for active */}
                      {index === activeStep && (
                        <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                      )}
                    </div>

                    {/* Step number */}
                    <span
                      className={`mt-4 text-sm font-bold transition-colors ${
                        index <= activeStep ? "text-primary" : "text-white/30"
                      }`}
                    >
                      {step.number}
                    </span>

                    {/* Title */}
                    <span
                      className={`mt-1 text-sm font-medium transition-colors ${
                        index === activeStep ? "text-white" : "text-white/50"
                      }`}
                    >
                      {t(step.titleKey)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active step detail card */}
            <div className="relative rounded-3xl overflow-hidden">
              {/* Gradient border */}
              <div className="absolute -inset-px bg-gradient-to-br from-primary/50 via-primary/20 to-transparent rounded-3xl" />

              <div className="relative bg-gradient-to-br from-neutral-900/90 via-neutral-900/80 to-neutral-900/90 backdrop-blur-xl rounded-3xl p-10">
                <div className="grid md:grid-cols-2 gap-10 items-center">
                  {/* Left - Content */}
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 rounded-2xl bg-primary/10">
                        {(() => {
                          const Icon = steps[activeStep].icon
                          return <Icon className="w-8 h-8 text-primary" />
                        })()}
                      </div>
                      <div>
                        <p className="text-sm text-primary font-semibold">
                          Step {steps[activeStep].number}
                        </p>
                        <h3 className="text-3xl font-display font-bold text-white">
                          {t(steps[activeStep].titleKey)}
                        </h3>
                      </div>
                    </div>

                    <p className="text-lg text-white/60 leading-relaxed mb-8">
                      {t(steps[activeStep].descKey)}
                    </p>

                    {/* Details list */}
                    <ul className="space-y-3">
                      {steps[activeStep].detailKeys.map((detailKey, i) => (
                        <li key={i} className="flex items-center gap-3 text-white/80">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          {t(detailKey)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right - Navigation */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-[8rem] font-display font-bold text-primary/10 leading-none">
                      {steps[activeStep].number}
                    </div>

                    {/* Nav buttons */}
                    <div className="flex gap-4 mt-8">
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                        disabled={activeStep === 0}
                      >
                        {t("process.previous")}
                      </Button>
                      <Button
                        size="lg"
                        className="bg-primary text-black hover:bg-primary/90"
                        onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                        disabled={activeStep === steps.length - 1}
                      >
                        {t("process.next")}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative rounded-2xl overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Border gradient */}
                <div className="absolute -inset-px bg-gradient-to-br from-primary/30 to-transparent rounded-2xl" />

                <div className="relative bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    {/* Step indicator */}
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-center mt-2 text-xs font-bold text-primary">
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-2 font-display">
                        {t(step.titleKey)}
                      </h3>
                      <p className="text-white/60 leading-relaxed text-sm">
                        {t(step.descKey)}
                      </p>

                      {/* Details */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {step.detailKeys.map((detailKey, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-xs text-white/70"
                          >
                            <Check className="w-3 h-3 text-primary" />
                            {t(detailKey)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-10 top-full w-0.5 h-6 bg-gradient-to-b from-primary/30 to-transparent" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Button
            asChild
            size="lg"
            className="bg-primary text-black hover:bg-primary/90 font-bold px-10 h-14 text-lg shadow-lg shadow-primary/25"
          >
            <Link href="/#fleet">
              {t("process.cta")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
