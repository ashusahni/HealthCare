"use client"

import Link from "next/link"
import { Pill, Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const routes = [
  {
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    name: "Medical Records",
    path: "/records",
  },
  {
    name: "Medications",
    path: "/medications",
  },
  {
    name: "Reminders",
    path: "/reminders",
  },
  {
    name: "Analytics",
    path: "/analytics",
  },
]

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center mr-4">
          <Link href="/" className="flex items-center">
            <Pill className="h-6 w-6 text-blue-600" />
            <span className="ml-2 text-xl font-bold">MediTrack</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium flex-1">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === route.path
                  ? "text-foreground font-semibold"
                  : "text-foreground/60"
              )}
            >
              {route.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2 ml-auto">
          <ThemeToggle />

          {/* Mobile nav */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-6">
                {routes.map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={cn(
                      "text-base transition-colors hover:text-foreground/80",
                      pathname === route.path
                        ? "text-foreground font-semibold"
                        : "text-foreground/60"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {route.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
