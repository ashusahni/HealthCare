'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useReminders } from '@/contexts/reminder-context'
import { toast } from 'sonner'
import { WhatsAppService } from '@/lib/services/whatsapp-service'

export function GuardianSettings() {
  const { settings, updateSettings } = useReminders()
  const [phoneNumber, setPhoneNumber] = React.useState(settings?.guardian_phone || '')
  const [isLoading, setIsLoading] = React.useState(false)
  const [isTesting, setIsTesting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('Please enter a valid phone number with country code (e.g., +1234567890)')
      return
    }

    try {
      setIsLoading(true)
      await updateSettings({
        guardian_phone: phoneNumber,
        require_verification: true // Enable verification when guardian number is set
      })
      toast.success('Guardian contact updated successfully')
    } catch (error) {
      console.error('Error updating guardian contact:', error)
      toast.error('Failed to update guardian contact')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestMessage = async () => {
    if (!phoneNumber) {
      toast.error('Please save a phone number first')
      return
    }

    try {
      setIsTesting(true)
      const whatsappService = WhatsAppService.getInstance()
      const success = await whatsappService.sendTestMessage(phoneNumber)
      
      if (success) {
        toast.success('Test message sent successfully! Check your WhatsApp.')
      } else {
        toast.error('Failed to send test message')
      }
    } catch (error) {
      console.error('Error sending test message:', error)
      toast.error('Failed to send test message')
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guardian Contact</CardTitle>
        <CardDescription>
          Add a guardian's WhatsApp number to receive notifications when medication is missed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Include country code (e.g., +1 for USA)
            </p>
          </div>
          <div className="flex space-x-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Contact'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              disabled={isTesting || !settings?.guardian_phone}
              onClick={handleTestMessage}
            >
              {isTesting ? 'Sending...' : 'Send Test Message'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 