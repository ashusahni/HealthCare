import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { WhatsAppService } from './whatsapp-service'

export type Reminder = {
  id: string
  user_id: string
  medication_id: string
  medication_name: string
  dosage: string
  time: string
  days: string[]
  status: 'active' | 'inactive' | 'snoozed'
  notification_types: ('app' | 'email' | 'voice' | 'browser')[]
  created_at: string
  updated_at: string
  last_taken?: string
  verification_status?: 'pending' | 'verified' | 'missed'
  verification_image?: string
  guardian_phone?: string
}

export type ReminderSettings = {
  user_id: string
  app_notifications: boolean
  email_notifications: boolean
  voice_notifications: boolean
  reminder_frequency: string
  snooze_time: string
  guardian_phone: string
  require_verification: boolean
  verification_timeout: number // in minutes
  created_at: string
  updated_at: string
}

export const reminderService = {
  async getReminders() {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Error getting user:', userError)
        throw new Error('Authentication error')
      }

      if (!user) {
        console.error('No user found')
        throw new Error('User not authenticated')
      }

      const { data: reminders, error: remindersError } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (remindersError) {
        console.error('Error fetching reminders:', remindersError)
        throw new Error(remindersError.message)
      }

      if (!reminders || reminders.length === 0) {
        return []
      }

      // Get medication details for each reminder
      const remindersWithMedications = await Promise.all(
        reminders.map(async (reminder) => {
          try {
            const { data: medication, error: medicationError } = await supabase
              .from('medications')
              .select('name, dosage')
              .eq('id', reminder.medication_id)
              .single()

            if (medicationError) {
              console.error('Error fetching medication:', medicationError)
              return {
                ...reminder,
                medication_name: 'Unknown Medication',
                dosage: 'Unknown Dosage'
              }
            }

            return {
              ...reminder,
              medication_name: medication.name,
              dosage: medication.dosage
            }
          } catch (error) {
            console.error('Error processing reminder:', error)
            return {
              ...reminder,
              medication_name: 'Unknown Medication',
              dosage: 'Unknown Dosage'
            }
          }
        })
      )

      return remindersWithMedications as Reminder[]
    } catch (error) {
      console.error('Error in getReminders:', error)
      throw error
    }
  },

  async getReminder(id: string) {
    try {
      const { data: reminder, error: reminderError } = await supabase
        .from('reminders')
        .select('*')
        .eq('id', id)
        .single()
      
      if (reminderError) {
        console.error('Error fetching reminder:', reminderError)
        throw new Error(reminderError.message)
      }

      if (!reminder) {
        throw new Error('Reminder not found')
      }

      const { data: medication, error: medicationError } = await supabase
        .from('medications')
        .select('name, dosage')
        .eq('id', reminder.medication_id)
        .single()

      if (medicationError) {
        console.error('Error fetching medication:', medicationError)
        return {
          ...reminder,
          medication_name: 'Unknown Medication',
          dosage: 'Unknown Dosage'
        } as Reminder
      }

      return {
        ...reminder,
        medication_name: medication.name,
        dosage: medication.dosage
      } as Reminder
    } catch (error) {
      console.error('Error in getReminder:', error)
      throw error
    }
  },

  async addReminder(reminder: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert([reminder])
        .select()
        .single()
      
      if (error) {
        console.error('Error adding reminder:', error)
        throw new Error(error.message)
      }

      if (!data) {
        throw new Error('Failed to create reminder')
      }

      const { data: medication, error: medicationError } = await supabase
        .from('medications')
        .select('name, dosage')
        .eq('id', data.medication_id)
        .single()

      if (medicationError) {
        console.error('Error fetching medication:', medicationError)
        return {
          ...data,
          medication_name: 'Unknown Medication',
          dosage: 'Unknown Dosage'
        } as Reminder
      }

      return {
        ...data,
        medication_name: medication.name,
        dosage: medication.dosage
      } as Reminder
    } catch (error) {
      console.error('Error in addReminder:', error)
      throw error
    }
  },

  async updateReminder(id: string, updates: Partial<Reminder>) {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating reminder:', error)
        throw new Error(error.message)
      }

      if (!data) {
        throw new Error('Failed to update reminder')
      }

      const { data: medication, error: medicationError } = await supabase
        .from('medications')
        .select('name, dosage')
        .eq('id', data.medication_id)
        .single()

      if (medicationError) {
        console.error('Error fetching medication:', medicationError)
        return {
          ...data,
          medication_name: 'Unknown Medication',
          dosage: 'Unknown Dosage'
        } as Reminder
      }

      return {
        ...data,
        medication_name: medication.name,
        dosage: medication.dosage
      } as Reminder
    } catch (error) {
      console.error('Error in updateReminder:', error)
      throw error
    }
  },

  async deleteReminder(id: string) {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting reminder:', error)
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Error in deleteReminder:', error)
      throw error
    }
  },

  async getReminderSettings() {
    try {
      const { data, error } = await supabase
        .from('reminder_settings')
        .select('*')
        .single()
      
      if (error) {
        console.error('Error fetching reminder settings:', error)
        throw new Error(error.message)
      }

      if (!data) {
        // Create default settings if none exist
        const defaultSettings: Omit<ReminderSettings, 'created_at' | 'updated_at'> = {
          user_id: (await supabase.auth.getUser()).data.user?.id || '',
          app_notifications: true,
          email_notifications: true,
          voice_notifications: false,
          reminder_frequency: 'once',
          snooze_time: '10min',
          guardian_phone: '',
          require_verification: false,
          verification_timeout: 15
        }

        const { data: newSettings, error: insertError } = await supabase
          .from('reminder_settings')
          .insert([defaultSettings])
          .select()
          .single()

        if (insertError) {
          console.error('Error creating default settings:', insertError)
          throw new Error(insertError.message)
        }

        return newSettings as ReminderSettings
      }

      return data as ReminderSettings
    } catch (error) {
      console.error('Error in getReminderSettings:', error)
      throw error
    }
  },

  async verifyMedicationTaken(reminderId: string, imageFile: File) {
    try {
      const { data: reminder } = await supabase
        .from('reminders')
        .select('*')
        .eq('id', reminderId)
        .single();

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      // Upload image to Supabase storage
      const fileName = `${reminderId}-${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('medication-verifications')
        .upload(fileName, imageFile);

      if (uploadError) {
        throw uploadError;
      }

      // Update reminder with verification status and image URL
      const { data, error } = await supabase
        .from('reminders')
        .update({
          verification_status: 'verified',
          verification_image: uploadData.path,
          last_taken: new Date().toISOString()
        })
        .eq('id', reminderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error verifying medication:', error);
      throw error;
    }
  },

  async markMedicationMissed(reminderId: string) {
    try {
      // Get reminder and settings
      const [reminderResult, settingsResult] = await Promise.all([
        supabase.from('reminders').select('*').eq('id', reminderId).single(),
        supabase.from('reminder_settings').select('*').single()
      ]);

      if (reminderResult.error) throw reminderResult.error;
      if (settingsResult.error) throw settingsResult.error;

      const reminder = reminderResult.data;
      const settings = settingsResult.data;

      // Update reminder status
      const { error: updateError } = await supabase
        .from('reminders')
        .update({
          verification_status: 'missed',
          last_taken: new Date().toISOString()
        })
        .eq('id', reminderId);

      if (updateError) throw updateError;

      // Send WhatsApp notification if guardian phone is set
      if (settings.guardian_phone) {
        const whatsappService = WhatsAppService.getInstance();
        const formattedTime = new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        });

        await whatsappService.sendMedicationMissedMessage(
          settings.guardian_phone,
          reminder.medication_name,
          formattedTime
        );
      }

      return true;
    } catch (error) {
      console.error('Error marking medication as missed:', error);
      throw error;
    }
  },

  async updateReminderSettings(settings: Partial<ReminderSettings>) {
    try {
      const { data: existingSettings } = await supabase
        .from('reminder_settings')
        .select('*')
        .single();

      const { data, error } = await supabase
        .from('reminder_settings')
        .upsert({
          ...existingSettings,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating reminder settings:', error);
      throw error;
    }
  }
} 