"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  dosage: z.string().min(1, { message: "Dosage is required" }),
  schedule: z.string().min(1, { message: "Schedule is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.union([
    z.date(),
    z.literal("ongoing")
  ]).optional(),
  instructions: z.string().optional(),
  purpose: z.string().min(1, { message: "Purpose is required" }),
})

export default function AddMedication() {
  const router = useRouter()
  const [isOngoing, setIsOngoing] = useState(false)

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      dosage: "",
      schedule: "",
      time: "",
      instructions: "",
      purpose: "",
    },
  })

  // Form submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, this would send data to an API
    console.log(values)

    // Show success message
    toast.success("Medication added successfully")

    // Navigate back to medications page
    router.push("/medications")
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Add New Medication</h1>
          <p className="text-muted-foreground">
            Enter the details of your medication.
          </p>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Medication Information</CardTitle>
            <CardDescription>Fill in all the required fields to add a new medication.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medication Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Lisinopril" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dosage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 10mg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="schedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schedule*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select schedule" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="twice daily">Twice Daily</SelectItem>
                            <SelectItem value="every other day">Every Other Day</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="as needed">As Needed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 8:00 AM" {...field} />
                        </FormControl>
                        <FormDescription>
                          For multiple times, separate with commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!isOngoing ? (
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value && typeof field.value !== 'string' ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value instanceof Date ? field.value : undefined}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription className="flex items-center gap-2">
                            <Label className="flex items-center gap-2">
                              <Input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={isOngoing}
                                onChange={(e) => {
                                  setIsOngoing(e.target.checked)
                                  if (e.target.checked) {
                                    form.setValue("endDate", "ongoing" as any)
                                  } else {
                                    form.setValue("endDate", undefined)
                                  }
                                }}
                              />
                              Ongoing medication
                            </Label>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Input value="Ongoing" disabled className="bg-muted" />
                      <FormDescription className="flex items-center gap-2">
                        <Label className="flex items-center gap-2">
                          <Input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={isOngoing}
                            onChange={(e) => {
                              setIsOngoing(e.target.checked)
                              if (e.target.checked) {
                                form.setValue("endDate", "ongoing" as any)
                              } else {
                                form.setValue("endDate", undefined)
                              }
                            }}
                          />
                          Ongoing medication
                        </Label>
                      </FormDescription>
                    </FormItem>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Blood pressure control" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Take with food" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/medications")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Medication</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
