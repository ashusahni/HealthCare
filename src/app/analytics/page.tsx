"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

// Sample data for charts
const monthlyAdherenceData = [
  { month: "Jan", adherence: 85 },
  { month: "Feb", adherence: 90 },
  { month: "Mar", adherence: 92 },
  { month: "Apr", adherence: 88 },
  { month: "May", adherence: 95 },
  { month: "Jun", adherence: 89 },
]

const weeklyAdherenceData = [
  { day: "Mon", adherence: 100 },
  { day: "Tue", adherence: 100 },
  { day: "Wed", adherence: 75 },
  { day: "Thu", adherence: 100 },
  { day: "Fri", adherence: 100 },
  { day: "Sat", adherence: 83 },
  { day: "Sun", adherence: 100 },
]

const medicationBreakdownData = [
  { name: "Taken On Time", value: 87, color: "#3b82f6" },
  { name: "Taken Late", value: 9, color: "#f59e0b" },
  { name: "Missed", value: 4, color: "#ef4444" },
]

const healthMetricsData = [
  { date: "Jan", systolic: 120, diastolic: 80, glucose: 95 },
  { date: "Feb", systolic: 122, diastolic: 78, glucose: 98 },
  { date: "Mar", systolic: 118, diastolic: 76, glucose: 92 },
  { date: "Apr", systolic: 121, diastolic: 79, glucose: 94 },
  { date: "May", systolic: 117, diastolic: 75, glucose: 90 },
  { date: "Jun", systolic: 115, diastolic: 74, glucose: 89 },
]

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("6months")

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics & Insights</h1>
            <p className="text-muted-foreground">
              Track your medication adherence and health metrics over time.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="adherence">
          <TabsList className="mb-6">
            <TabsTrigger value="adherence">Medication Adherence</TabsTrigger>
            <TabsTrigger value="metrics">Health Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="adherence" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Current Adherence Rate</CardTitle>
                  <CardDescription>How well you're following your medication schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[150px]">
                    <div className="text-5xl font-bold text-blue-600">92%</div>
                    <p className="text-muted-foreground mt-2">Current Month</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Streak</CardTitle>
                  <CardDescription>Days with complete medication adherence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[150px]">
                    <div className="text-5xl font-bold text-green-600">5</div>
                    <p className="text-muted-foreground mt-2">Days in a row</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Monthly Average</CardTitle>
                  <CardDescription>Average adherence over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[150px]">
                    <div className="text-5xl font-bold text-violet-600">89%</div>
                    <p className="text-muted-foreground mt-2">Average adherence</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Adherence Trend</CardTitle>
                  <CardDescription>
                    Your medication adherence rate over the past 6 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyAdherenceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, "Adherence"]} />
                        <Bar
                          dataKey="adherence"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Breakdown</CardTitle>
                  <CardDescription>
                    Your medication adherence for the current week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyAdherenceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, "Adherence"]} />
                        <Bar
                          dataKey="adherence"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Medication Breakdown</CardTitle>
                <CardDescription>
                  Analysis of your medication adherence patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={medicationBreakdownData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {medicationBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Blood Pressure</CardTitle>
                  <CardDescription>Latest reading</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[150px]">
                    <div className="text-3xl font-bold text-blue-600">115/74</div>
                    <p className="text-green-600 font-medium text-sm mt-2">Normal</p>
                    <p className="text-muted-foreground text-xs mt-1">Last measured: Today</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Blood Glucose</CardTitle>
                  <CardDescription>Latest reading</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[150px]">
                    <div className="text-3xl font-bold text-blue-600">89 mg/dL</div>
                    <p className="text-green-600 font-medium text-sm mt-2">Normal</p>
                    <p className="text-muted-foreground text-xs mt-1">Last measured: Today</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Heart Rate</CardTitle>
                  <CardDescription>Latest reading</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[150px]">
                    <div className="text-3xl font-bold text-blue-600">72 BPM</div>
                    <p className="text-green-600 font-medium text-sm mt-2">Normal</p>
                    <p className="text-muted-foreground text-xs mt-1">Last measured: Today</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Health Metrics Trends</CardTitle>
                <CardDescription>
                  Track how your key health metrics change over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={healthMetricsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="systolic"
                        stroke="#3b82f6"
                        name="Systolic BP"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="diastolic"
                        stroke="#8b5cf6"
                        name="Diastolic BP"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="glucose"
                        stroke="#10b981"
                        name="Blood Glucose"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Connect a Health Device</h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Automatically sync data from your smart health devices to get more accurate and frequent metrics.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <div className="bg-background border rounded-lg px-4 py-2 flex items-center">
                  <span className="font-medium">Apple Health</span>
                </div>
                <div className="bg-background border rounded-lg px-4 py-2 flex items-center">
                  <span className="font-medium">Fitbit</span>
                </div>
                <div className="bg-background border rounded-lg px-4 py-2 flex items-center">
                  <span className="font-medium">Google Fit</span>
                </div>
                <div className="bg-background border rounded-lg px-4 py-2 flex items-center">
                  <span className="font-medium">Samsung Health</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
