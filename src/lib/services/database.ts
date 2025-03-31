import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { Medication, MedicationLog, MedicalRecord, HealthMetric } from '@/types/database'

// Medication Services
export const medicationService = {
  async getMedications() {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Medication[]
  },

  async getMedication(id: string) {
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Medication
  },

  async addMedication(medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('medications')
      .insert([medication])
      .select()
      .single()
    
    if (error) throw error
    return data as Medication
  },

  async updateMedication(id: string, updates: Partial<Medication>) {
    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Medication
  },

  async deleteMedication(id: string) {
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async getTodayMedications() {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .lte('start_date', today)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .order('time_of_day', { ascending: true })
    
    if (error) throw error
    return data as Medication[]
  }
}

// Medication Log Services
export const medicationLogService = {
  async getMedicationLogs(medicationId: string) {
    const { data, error } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('medication_id', medicationId)
      .order('taken_at', { ascending: false })
    
    if (error) throw error
    return data as MedicationLog[]
  },

  async addMedicationLog(log: Omit<MedicationLog, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('medication_logs')
      .insert([log])
      .select()
      .single()
    
    if (error) throw error
    return data as MedicationLog
  }
}

// Medical Record Services
export const medicalRecordService = {
  async getMedicalRecords() {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data as MedicalRecord[]
  },

  async getMedicalRecord(id: string) {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as MedicalRecord
  },

  async addMedicalRecord(record: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('medical_records')
      .insert([record])
      .select()
      .single()
    
    if (error) throw error
    return data as MedicalRecord
  },

  async updateMedicalRecord(id: string, updates: Partial<MedicalRecord>) {
    const { data, error } = await supabase
      .from('medical_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as MedicalRecord
  },

  async deleteMedicalRecord(id: string) {
    const { error } = await supabase
      .from('medical_records')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Health Metric Services
export const healthMetricService = {
  async getHealthMetrics() {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data as HealthMetric[]
  },

  async getHealthMetric(id: string) {
    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as HealthMetric
  },

  async addHealthMetric(metric: Omit<HealthMetric, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('health_metrics')
      .insert([metric])
      .select()
      .single()
    
    if (error) throw error
    return data as HealthMetric
  },

  async updateHealthMetric(id: string, updates: Partial<HealthMetric>) {
    const { data, error } = await supabase
      .from('health_metrics')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as HealthMetric
  },

  async deleteHealthMetric(id: string) {
    const { error } = await supabase
      .from('health_metrics')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
} 