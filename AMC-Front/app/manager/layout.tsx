"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Car, CalendarDays, LayoutDashboard, LogOut, Menu, X, ChevronRight, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n-context"
import { Toaster } from "@/components/ui/toaster"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    // Basic auth check
    const token = localStorage.getItem("jwt_token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem("jwt_token")
    router.push("/login")
  }

  const navItems = [
    { name: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
    { name: t("dashboard.cars"), href: "/manager/cars", icon: Car },
    { name: t("dashboard.rentals"), href: "/manager/rentals", icon: CalendarDays },
  ]

  const isActive = (href: string) => {
    if (href === "/manager/dashboard") return pathname === href
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-[#030303] flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex fixed inset-y-0 left-0 z-50 flex-col bg-gradient-to-b from-[#0a0a0a] via-[#080808] to-[#050505] border-r border-white/[0.06] transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-20",
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className={cn(
            "flex items-center h-20 border-b border-white/[0.06] px-4",
            isSidebarOpen ? "justify-between" : "justify-center"
          )}>
            <Link href="/manager/dashboard" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Image 
                  src="/images/logo.png" 
                  alt="AMC" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
              </div>
              {isSidebarOpen && (
                <div>
                  <span className="text-lg font-display font-bold text-white">AMC</span>
                  <span className="block text-[10px] text-primary/70 uppercase tracking-[0.2em]">Manager</span>
                </div>
              )}
            </Link>
            {isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="text-white/40 hover:text-white/70 transition-colors p-1"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
            )}
          </div>

          {/* Expand button when collapsed */}
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-3 text-white/40 hover:text-white/70 transition-colors border-b border-white/[0.06]"
            >
              <ChevronRight className="h-4 w-4 mx-auto" />
            </button>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-white/50 hover:text-white hover:bg-white/[0.04]",
                    !isSidebarOpen && "justify-center px-3"
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    active ? "text-primary" : "text-white/40 group-hover:text-white/70"
                  )} />
                  {isSidebarOpen && (
                    <span className="font-medium text-sm">{item.name}</span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-3 border-t border-white/[0.06] space-y-1.5">
            <Button
              variant="ghost"
              className={cn(
                "w-full gap-3 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl",
                isSidebarOpen ? "justify-start px-3" : "justify-center px-3"
              )}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              {isSidebarOpen && <span className="font-medium text-sm">Logout</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.06] px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Image 
              src="/images/logo.png" 
              alt="AMC" 
              width={24} 
              height={24} 
              className="object-contain"
            />
          </div>
          <span className="text-lg font-display font-bold text-white">AMC</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="text-white/70 hover:text-white p-2"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="absolute top-16 left-0 right-0 bg-[#0a0a0a] border-b border-white/[0.06] py-4 animate-in slide-in-from-top-2"
            onClick={e => e.stopPropagation()}
          >
            <nav className="px-4 space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        isSidebarOpen ? "md:ml-64" : "md:ml-20"
      )}>
        {/* Top Bar */}
        <header className="hidden md:flex h-16 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl px-6 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-white/50">System Online</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/40">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">M</span>
              </div>
              <span className="text-sm text-white/70">Manager</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 pt-20 md:pt-6 overflow-auto bg-gradient-to-b from-[#030303] to-[#050505]">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  )
}
