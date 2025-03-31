'use client'

import React from "react"
import Link from "next/link"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, FileText, PieChart, Pill, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const { user } = useAuth()

  return (
    <MainLayout>
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Manage Your Health Journey with MediTrack
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Your comprehensive platform for tracking medical records, scheduling medication, and receiving smart reminders.
              </p>
            </div>
            <div className="space-x-4">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Go to Dashboard</Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
                </Link>
              )}
              <Link href="#features">
                <Button size="lg" variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Features
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to manage your health journey effectively
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-blue-600" />}
              title="Medical Records"
              description="Securely store and manage your medical history, test results, and important documents."
            />
            <FeatureCard
              icon={<Pill className="h-10 w-10 text-blue-600" />}
              title="Medication Tracking"
              description="Set up medication schedules and receive timely reminders to take your medications."
            />
            <FeatureCard
              icon={<Clock className="h-10 w-10 text-blue-600" />}
              title="Smart Reminders"
              description="Never miss a dose with customizable reminders and notifications."
            />
            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-blue-600" />}
              title="Appointment Scheduling"
              description="Schedule and manage your medical appointments in one place."
            />
            <FeatureCard
              icon={<PieChart className="h-10 w-10 text-blue-600" />}
              title="Analytics & Insights"
              description="Visual analytics for medication adherence history and monthly reports showing overall progress."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-blue-600" />}
              title="Security & Privacy"
              description="Secure authentication and data encryption for personal information protection."
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Take Control of Your Health?
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Join MediTrack today and experience the easiest way to manage your health journey.
              </p>
            </div>
            <div className="space-x-4 pt-4">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Go to Dashboard</Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Get Started Now</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-background rounded-lg shadow-sm border">
      <div className="mb-4">
        {React.cloneElement(icon as React.ReactElement, { suppressHydrationWarning: true })}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
