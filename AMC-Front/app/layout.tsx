import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Lato } from "next/font/google"
import "./globals.css"
import { I18nProvider } from "@/lib/i18n-context"
import { Toaster } from "@/components/ui/toaster"
import WhatsAppButton from "@/components/whatsapp-button"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const lato = Lato({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
})

export const metadata: Metadata = {
  title: "AMC Luxury Car Rental | Agadir",
  description: "Turn every road in Morocco into a premium journey with AMC.",
  generator: 'v0.app',
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${lato.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}>
        <I18nProvider>
          {children}
          <Toaster />
          <WhatsAppButton />
        </I18nProvider>
      </body>
    </html>
  )
}
