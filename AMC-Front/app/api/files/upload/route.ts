import { NextRequest, NextResponse } from "next/server"

// Use server-side URL for internal Docker network
const API_BASE_URL = process.env.NEXT_SERVER_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081"

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")
    const contentType = request.headers.get("content-type") ?? undefined

    console.log(`[Upload] Proxying to: ${API_BASE_URL}/files/upload`)

    const upstream = await fetch(`${API_BASE_URL}/files/upload`, {
      method: "POST",
      headers: {
        ...(contentType ? { "Content-Type": contentType } : {}),
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: request.body,
      duplex: "half",
    })

    const clone = upstream.clone()
    if (!upstream.ok) {
      const errorText = await clone.text()
      console.error("[Upload] Backend error:", upstream.status, errorText)
      return NextResponse.json(
        { message: errorText || "Upload failed" },
        { status: upstream.status || 500 },
      )
    }

    const content = await upstream.arrayBuffer()
    const responseHeaders = new Headers()
    const upstreamContentType = upstream.headers.get("content-type")
    if (upstreamContentType) {
      responseHeaders.set("Content-Type", upstreamContentType)
    }

    console.log("[Upload] Success:", upstream.status)
    return new NextResponse(content, {
      status: upstream.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error("[Upload] Proxy error:", error)
    return NextResponse.json({ message: "Unable to upload files: " + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}

