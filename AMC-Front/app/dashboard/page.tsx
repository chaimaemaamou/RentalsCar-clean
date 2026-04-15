"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LegacyDashboardRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/manager/dashboard")
  }, [router])
  return <p className="p-6 text-muted-foreground">Redirecting to manager dashboard...</p>
}
