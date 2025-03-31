'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Reminder, ReminderSettings } from '@/lib/services/reminder-service';
import { reminderService } from '@/lib/services/reminder-service';
import { NotificationService } from '@/lib/services/notification-service';
import { useAuth } from './auth-context';
import { VerificationDialog } from '@/components/reminders/verification-dialog';

interface ExtendedNotificationOptions {
  time: Date;
  reminderId?: string;
  days?: string[];
  tag?: string;
  requireVerification?: boolean;
  verificationTimeout?: number;
}

interface ReminderContextType {
  reminders: Reminder[];
  settings: ReminderSettings | null;
  loading: boolean;
  error: string | null;
  addReminder: (reminder: Omit<Reminder, 'id'>) => Promise<void>;
  updateReminder: (id: string, reminder: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<ReminderSettings>) => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;
  showVerification: string | null;
  setShowVerification: React.Dispatch<React.SetStateAction<string | null>>;
  handleVerifyMedication: (reminderId: string, file: File) => Promise<void>;
}

const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

export function ReminderProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [settings, setSettings] = useState<ReminderSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationService] = useState(() => NotificationService.getInstance());
  const [showVerification, setShowVerification] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadReminders();
      loadSettings();
    }
  }, [user]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const data = await reminderService.getReminders();
      setReminders(data);
      scheduleNotifications(data);
    } catch (err) {
      setError('Failed to load reminders');
      console.error('Error loading reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const data = await reminderService.getReminderSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error loading reminder settings:', err);
    }
  };

  const scheduleNotifications = (reminders: Reminder[]) => {
    // Cancel all existing scheduled notifications first
    notificationService.cancelAllScheduledNotifications();

    // Only schedule notifications for active reminders
    reminders.filter(reminder => reminder.status === 'active').forEach(reminder => {
      if (reminder.notification_types.includes('browser')) {
        const [hours, minutes] = reminder.time.split(':');
        const scheduledTime = new Date();
        scheduledTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

        notificationService.scheduleNotification(
          `Time to take ${reminder.medication_name}`,
          {
            body: `Take ${reminder.dosage} of ${reminder.medication_name}`,
            time: scheduledTime,
            reminderId: reminder.id,
            days: reminder.days,
            tag: reminder.id,
            data: reminder,
            requireVerification: settings?.require_verification || false,
            verificationTimeout: settings?.verification_timeout || 20
          } as ExtendedNotificationOptions
        );
      }
    });
  };

  // Re-schedule notifications when reminders change
  useEffect(() => {
    if (reminders.length > 0) {
      scheduleNotifications(reminders);
    }
  }, [reminders]);

  // Clean up notifications when component unmounts
  useEffect(() => {
    return () => {
      notificationService.cancelAllScheduledNotifications();
    };
  }, []);

  const addReminder = async (reminder: Omit<Reminder, 'id'>) => {
    try {
      if (!user) throw new Error('User not authenticated');
      const newReminder = await reminderService.addReminder({
        ...reminder,
        user_id: user.id
      });
      setReminders(prev => [...prev, newReminder]);
      if (newReminder.notification_types.includes('browser')) {
        scheduleNotifications([newReminder]);
      }
    } catch (err) {
      setError('Failed to add reminder');
      throw err;
    }
  };

  const updateReminder = async (id: string, reminder: Partial<Reminder>) => {
    try {
      const updatedReminder = await reminderService.updateReminder(id, reminder);
      setReminders(prev =>
        prev.map(r => (r.id === id ? updatedReminder : r))
      );
      if (reminder.status === 'active' && reminder.notification_types?.includes('browser')) {
        scheduleNotifications([updatedReminder]);
      }
    } catch (err) {
      setError('Failed to update reminder');
      throw err;
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await reminderService.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError('Failed to delete reminder');
      throw err;
    }
  };

  const updateSettings = async (newSettings: Partial<ReminderSettings>) => {
    try {
      const updatedSettings = await reminderService.updateReminderSettings(newSettings);
      setSettings(updatedSettings);
    } catch (err) {
      setError('Failed to update settings');
      throw err;
    }
  };

  const requestNotificationPermission = async () => {
    return await notificationService.requestPermission();
  };

  const handleVerifyMedication = async (reminderId: string, file: File) => {
    try {
      await reminderService.verifyMedicationTaken(reminderId, file);
      await loadReminders(); // Reload reminders to get updated status
      setShowVerification(null);
    } catch (error) {
      console.error('Error verifying medication:', error);
      throw error;
    }
  };

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        settings,
        loading,
        error,
        addReminder,
        updateReminder,
        deleteReminder,
        updateSettings,
        requestNotificationPermission,
        showVerification,
        setShowVerification,
        handleVerifyMedication
      }}
    >
      {children}
      {showVerification && (
        <VerificationDialog
          isOpen={!!showVerification}
          onClose={() => setShowVerification(null)}
          onVerify={(file) => handleVerifyMedication(showVerification, file)}
          medicationName={reminders.find(r => r.id === showVerification)?.medication_name || ''}
        />
      )}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
} 