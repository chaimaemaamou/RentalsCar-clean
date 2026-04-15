"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Lock, Mail, Loader2, Sparkles, ArrowRight, Shield, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  })

  async function onSubmit(values: LoginFormData) {
    setIsLoading(true)
    try {
      const email = values.email.trim()
      const password = values.password.trim()
      if (!email || !password) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields",
          variant: "destructive",
        })
        return
      }
      const res = await api.auth.login({ email, password })
      localStorage.setItem("jwt_token", res.token)
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to dashboard...",
      })
      router.push("/manager/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Access Denied",
        description: error?.message?.includes("401") ? "Invalid credentials." : "Login failed.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-black">
        {/* Video background with overlay */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          onError={(e) => {
            // Suppress video loading errors silently
            e.currentTarget.style.display = 'none'
          }}
        >
          <source src="/agadirvid.mp4" type="video/mp4" />
        </video>
        
        {/* Dark gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-black" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
        
        {/* Animated gold particles - using deterministic positions based on index */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => {
            // Use deterministic pseudo-random values based on index
            const left = ((i * 37 + 13) % 100)
            const top = ((i * 53 + 29) % 100)
            const delay = ((i * 17) % 50) / 10
            const duration = 5 + ((i * 23) % 100) / 10
            return (
              <div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                }}
              />
            )
          })}
        </div>
        
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[200px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
          {/* Logo */}
          <Link href="/" className="inline-block group">
            <div className="relative w-24 h-24 transition-transform duration-500 group-hover:scale-110">
              <Image
                src="/images/logo.png"
                alt="AMC Logo"
                fill
                className="object-contain drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]"
              />
            </div>
          </Link>

          {/* Center content */}
          <div className="space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">Manager Portal</span>
              </div>
              <h1 className="text-5xl xl:text-6xl font-display font-bold text-white leading-tight mb-6">
                Welcome to<br />
                <span className="bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">
                  AMC Dashboard
                </span>
              </h1>
              <p className="text-xl text-white/60 leading-relaxed max-w-md">
                Manage your fleet, track rentals, and oversee operations with our comprehensive management system.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, text: "Secure Access" },
                { icon: Clock, text: "Real-time Data" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-white/80 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-primary transition-colors group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span>Back to website</span>
          </Link>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <Link href="/">
                <div className="relative w-20 h-20">
                  <Image
                    src="/images/logo.png"
                    alt="AMC Logo"
                    fill
                    className="object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                  />
                </div>
              </Link>
            </div>

            {/* Form card */}
            <div className="relative">
              {/* Card glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-xl" />
              
              <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white mb-2">
                    Manager Login
                  </h2>
                  <p className="text-white/50">
                    Enter your credentials to access the dashboard
                  </p>
                </div>

                {/* Form */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80 text-sm font-medium">Email Address</FormLabel>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-primary transition-colors" />
                              <FormControl>
                                <Input
                                  placeholder="manager@amc.local"
                                  {...field}
                                  autoComplete="username"
                                  className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-primary/50 focus:bg-white/10 transition-all"
                                />
                              </FormControl>
                            </div>
                          </div>
                          <FormMessage className="text-red-400 text-sm" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80 text-sm font-medium">Password</FormLabel>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-primary transition-colors" />
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="••••••••"
                                  {...field}
                                  autoComplete="current-password"
                                  className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-primary/50 focus:bg-white/10 transition-all"
                                />
                              </FormControl>
                            </div>
                          </div>
                          <FormMessage className="text-red-400 text-sm" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-14 bg-primary text-black hover:bg-primary/90 font-bold text-lg rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <Link
                    href="/"
                    className="text-sm text-white/50 hover:text-primary transition-colors"
                  >
                    ← Return to main website
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile back link */}
            <div className="lg:hidden mt-8 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white/50 hover:text-primary transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span>Back to website</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(20px);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}
