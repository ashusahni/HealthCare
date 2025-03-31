"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Calendar,
  Clock,
  FileText,
  Pill,
  Plus,
  AlertCircle,
  Check,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/contexts/auth-context'
import { useDashboard } from '@/hooks/use-dashboard'
import { format } from 'date-fns'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const { user, signOut } = useAuth()
  const { medications, records, metrics, loading, error, markMedicationAsTaken } = useDashboard()

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container py-10 flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container py-10">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Monitor your health information and upcoming medication.
              </p>
            </div>
            <div className="mt-4 md:mt-0 space-x-2">
              <Link href="/medications/add">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" /> Add Medication
                </Button>
              </Link>
              <Link href="/records/add">
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" /> Add Record
                </Button>
              </Link>
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-3 h-auto">
              <TabsTrigger value="overview" className="py-2">Overview</TabsTrigger>
              <TabsTrigger value="medications" className="py-2">Medications</TabsTrigger>
              <TabsTrigger value="records" className="py-2">Records</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Upcoming Medications</CardTitle>
                    <CardDescription>Your medications for today</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {medications.slice(0, 3).map((med) => (
                        <div key={med.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Pill className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium leading-none">{med.name}</p>
                              <p className="text-sm text-muted-foreground">{med.dosage}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{med.time_of_day}</span>
                          </div>
                        </div>
                      ))}
                      <Link href="/medications" className="text-sm text-blue-600 hover:underline">
                        View all medications
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Recent Records</CardTitle>
                    <CardDescription>Your latest medical records</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {records.slice(0, 3).map((record) => (
                        <div key={record.id} className="flex items-start space-x-3">
                          <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium leading-none">{record.title}</p>
                            <p className="text-xs text-muted-foreground">{record.type}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(record.date), 'MMM d, yyyy')}</p>
                          </div>
                        </div>
                      ))}
                      <Link href="/records" className="text-sm text-blue-600 hover:underline">
                        View all records
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Health Metrics</CardTitle>
                    <CardDescription>Recent health measurements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {metrics.slice(0, 3).map((metric) => (
                        <div key={metric.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium leading-none">{metric.name}</p>
                            <p className="text-xs text-muted-foreground">Last checked: {format(new Date(metric.date), 'MMM d, yyyy')}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium">{metric.value}{metric.unit ? ` ${metric.unit}` : ''}</span>
                            <Check className="ml-2 h-4 w-4 text-green-500" />
                          </div>
                        </div>
                      ))}
                      <Link href="/analytics" className="text-sm text-blue-600 hover:underline">
                        View all metrics
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Overview</CardTitle>
                  <CardDescription>Your medication adherence this week</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Activity className="h-16 w-16 text-blue-600 mx-auto" />
                    <div className="text-2xl font-bold">92%</div>
                    <p className="text-muted-foreground">Medication adherence</p>
                    <Link href="/analytics">
                      <Button variant="outline" className="mt-2">
                        View Detailed Analytics
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Medications</CardTitle>
                  <CardDescription>Your medication schedule for today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {medications.map((med) => (
                      <div key={med.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Pill className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-muted-foreground">{med.dosage}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{med.time_of_day}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-4"
                            onClick={() => markMedicationAsTaken(med.id)}
                          >
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Mark as taken</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Link href="/medications">
                  <Button>View All Medications</Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="records" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Medical Records</CardTitle>
                  <CardDescription>Your latest health records and documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {records.map((record) => (
                      <div key={record.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{record.title}</p>
                            <p className="text-sm text-muted-foreground">{format(new Date(record.date), 'MMM d, yyyy')}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{record.type}</p>
                          {record.doctor && (
                            <p className="text-sm">Doctor: {record.doctor}</p>
                          )}
                          {record.facility && (
                            <p className="text-sm">Facility: {record.facility}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <Link href="/records">
                  <Button>View All Records</Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  )
}
