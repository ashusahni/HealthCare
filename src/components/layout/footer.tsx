"use client"

import { Heart } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} MediTrack. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Terms
          </Link>
          <Link
            href="/support"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Support
          </Link>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Made with</span>
          <Heart className="h-4 w-4 text-red-500" suppressHydrationWarning />
          <span>for your health</span>
        </div>
      </div>
    </footer>
  )
}
