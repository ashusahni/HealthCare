"use client"

import React, { useEffect, useState } from 'react';
import { useReminders } from '@/contexts/reminder-context';
import { Reminder, ReminderSettings } from '@/lib/services/reminder-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { MainLayout } from "@/components/layout/main-layout"
import { Bell, Plus, Check, X, Settings, Clock, Volume2, Mail, Pill, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/contexts/auth-context'
import { medicationService } from '@/lib/services/database'
import { NotificationService } from '@/lib/services/notification-service'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function Reminders() {
  const {
    reminders,
    settings,
    loading,
    error,
    addReminder,
    updateReminder,
    deleteReminder,
    updateSettings,
    requestNotificationPermission,
  } = useReminders();

  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("all")
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    medication_id: '',
    time: '',
    days: [] as string[],
    status: 'active',
    notification_types: ['browser'] as ('app' | 'email' | 'voice' | 'browser')[],
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [medications, setMedications] = useState<any[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    if (user) {
      loadMedications()
    }
    requestNotificationPermission();
  }, [user]);

  const loadMedications = async () => {
    try {
      console.log('Loading medications...');
      const data = await medicationService.getMedications()
      console.log('Loaded medications:', data);
      if (!data || data.length === 0) {
        toast.error('No medications found. Please add medications first.');
        return;
      }
      setMedications(data)
    } catch (err) {
      console.error('Error loading medications:', err)
      toast.error('Failed to load medications')
    }
  }

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newReminder.medication_id || !newReminder.time || !newReminder.days?.length) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Get medication details
      const selectedMedication = medications.find(m => m.id === newReminder.medication_id);
      if (!selectedMedication) {
        toast.error('Selected medication not found');
        return;
      }

      await addReminder({
        medication_id: newReminder.medication_id,
        medication_name: selectedMedication.name,
        dosage: selectedMedication.dosage,
        time: newReminder.time,
        days: newReminder.days || [],
        status: 'active',
        notification_types: newReminder.notification_types || ['browser'],
      });

      setNewReminder({
        medication_id: '',
        time: '',
        days: [] as string[],
        status: 'active',
        notification_types: ['browser'] as ('app' | 'email' | 'voice' | 'browser')[],
      });
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('Error adding reminder:', err);
      toast.error('Failed to add reminder');
    }
  };

  const handleUpdateReminder = async (id: string, updates: Partial<Reminder>) => {
    try {
      await updateReminder(id, updates);
    } catch (err) {
      console.error('Error updating reminder:', err);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await deleteReminder(id);
    } catch (err) {
      console.error('Error deleting reminder:', err);
    }
  };

  const handleUpdateSettings = async (updates: Partial<ReminderSettings>) => {
    try {
      await updateSettings(updates);
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  };

  const handleNotificationPermission = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      toast.success('Notification permission granted')
    } else {
      toast.error('Please enable notifications in your browser settings')
    }
  }

  // Filter reminders by tab
  const filteredReminders = reminders.filter(reminder => {
    if (activeTab === "all") return true
    if (activeTab === "active") return reminder.status === "active"
    if (activeTab === "inactive") return reminder.status === "inactive"
    return true
  })

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
            <p className="text-muted-foreground">
              Manage your medication reminder settings and schedule.
            </p>
          </div>
          <div className="mt-4 md:mt-0 space-x-4">
            <Button onClick={handleNotificationPermission}>
              <Bell className="mr-2 h-4 w-4" />
              Enable Notifications
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="w-full md:w-auto grid grid-cols-3 h-auto">
            <TabsTrigger value="all" className="py-2">All Reminders</TabsTrigger>
            <TabsTrigger value="active" className="py-2">Active</TabsTrigger>
            <TabsTrigger value="inactive" className="py-2">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Reminders</CardTitle>
                <CardDescription>Current medication reminders</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredReminders.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Reminders Found</h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have any {activeTab !== "all" ? activeTab : ""} reminders set up.
                    </p>
                    <Link href="/reminders/add">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Your First Reminder
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className={`p-4 border rounded-lg ${
                          reminder.status === "inactive" ? "opacity-70" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${
                              reminder.status === "active" ? "bg-blue-100" : "bg-gray-100"
                            }`}>
                              <Pill className={`h-5 w-5 ${
                                reminder.status === "active" ? "text-blue-600" : "text-gray-400"
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-medium">{reminder.medication_name}</h3>
                              <p className="text-sm text-muted-foreground">{reminder.dosage}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">{reminder.time}</span>
                                <span className="text-xs">Daily</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-2">
                                {reminder.notification_types.includes("app") && (
                                  <Bell className="h-3 w-3 text-blue-600" />
                                )}
                                {reminder.notification_types.includes("email") && (
                                  <Mail className="h-3 w-3 text-blue-600" />
                                )}
                                {reminder.notification_types.includes("voice") && (
                                  <Volume2 className="h-3 w-3 text-blue-600" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className={reminder.status === "active" ? "text-red-500" : "text-green-500"}
                              onClick={() => handleUpdateReminder(reminder.id, { status: reminder.status === "active" ? "inactive" : "active" })}
                            >
                              {reminder.status === "active" ? (
                                <X className="h-4 w-4 mr-1" />
                              ) : (
                                <Check className="h-4 w-4 mr-1" />
                              )}
                              {reminder.status === "active" ? "Disable" : "Enable"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500"
                              onClick={() => handleDeleteReminder(reminder.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Reminders</CardTitle>
                <CardDescription>Your next medication reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reminders
                    .filter(r => r.status === "active")
                    .slice(0, 3)
                    .map((reminder) => (
                      <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Bell className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{reminder.medication_name}</p>
                            <p className="text-sm text-muted-foreground">Today, {reminder.time}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Check className="h-4 w-4 mr-1" /> Snooze
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" /> Reminder Settings
                </CardTitle>
                <CardDescription>Configure how you receive reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notification Types</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4" />
                      <Label htmlFor="app-notifications">App Notifications</Label>
                    </div>
                    <Switch
                      id="app-notifications"
                      checked={settings?.app_notifications}
                      onCheckedChange={(checked) =>
                        handleUpdateSettings({ app_notifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings?.email_notifications}
                      onCheckedChange={(checked) =>
                        handleUpdateSettings({ email_notifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="h-4 w-4" />
                      <Label htmlFor="voice-notifications">Voice Notifications</Label>
                    </div>
                    <Switch
                      id="voice-notifications"
                      checked={settings?.voice_notifications}
                      onCheckedChange={(checked) =>
                        handleUpdateSettings({ voice_notifications: checked })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Reminder Preferences</h3>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
                    <Select
                      value={settings?.reminder_frequency || 'once'}
                      onValueChange={(value) =>
                        handleUpdateSettings({ reminder_frequency: value })
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Once</SelectItem>
                        <SelectItem value="twice">Twice</SelectItem>
                        <SelectItem value="thrice">Thrice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="snooze-time">Snooze Time</Label>
                    <Select
                      value={settings?.snooze_time || '10min'}
                      onValueChange={(value) =>
                        handleUpdateSettings({ snooze_time: value })
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5min">5 minutes</SelectItem>
                        <SelectItem value="10min">10 minutes</SelectItem>
                        <SelectItem value="15min">15 minutes</SelectItem>
                        <SelectItem value="30min">30 minutes</SelectItem>
                        <SelectItem value="1hour">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Test Your Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Send a test notification to make sure everything is working correctly.
                  </p>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const notificationService = NotificationService.getInstance();
                        notificationService.showNotification(
                          "Test Reminder",
                          {
                            body: "This is a test reminder notification!",
                            tag: "test-notification",
                          }
                        );
                      }}
                    >
                      <Bell className="h-4 w-4 mr-2" /> Send Test Notification
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Reminder</DialogTitle>
              <DialogDescription>
                Set up a reminder for your medication
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Medication</Label>
                <Select
                  value={newReminder.medication_id}
                  onValueChange={(value) =>
                    setNewReminder({ ...newReminder, medication_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select medication" />
                  </SelectTrigger>
                  <SelectContent>
                    {medications.map((medication) => (
                      <SelectItem key={medication.id} value={medication.id}>
                        {medication.name} - {medication.dosage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) =>
                    setNewReminder({ ...newReminder, time: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Days</Label>
                <div className="grid grid-cols-2 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={(newReminder.days || []).includes(day)}
                        onCheckedChange={(checked) => {
                          const currentDays = newReminder.days || [];
                          if (checked) {
                            setNewReminder({
                              ...newReminder,
                              days: [...currentDays, day]
                            })
                          } else {
                            setNewReminder({
                              ...newReminder,
                              days: currentDays.filter((d) => d !== day)
                            })
                          }
                        }}
                      />
                      <Label htmlFor={day}>{day}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notification Type</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={(newReminder.notification_types || []).includes('browser')}
                    onCheckedChange={(checked) => {
                      const currentTypes = newReminder.notification_types || [];
                      if (checked) {
                        setNewReminder({
                          ...newReminder,
                          notification_types: [...currentTypes, 'browser']
                        })
                      } else {
                        setNewReminder({
                          ...newReminder,
                          notification_types: currentTypes.filter(
                            (type) => type !== 'browser'
                          )
                        })
                      }
                    }}
                  />
                  <Label>Browser Notifications</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddReminder}>Add Reminder</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
