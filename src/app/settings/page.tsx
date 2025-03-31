'use client'

import { GuardianSettings } from '@/components/reminders/guardian-settings'

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <GuardianSettings />
      {/* Add other settings components here */}
    </div>
  )
} 