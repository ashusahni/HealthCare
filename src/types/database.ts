export type Medication = {
  id: string
  user_id: string
  name: string
  dosage: string
  frequency: string
  time_of_day: string
  start_date: string
  end_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type MedicationLog = {
  id: string
  medication_id: string
  user_id: string
  taken_at: string
  status: 'taken' | 'missed' | 'delayed'
  notes?: string
  created_at: string
}

export type MedicalRecord = {
  id: string
  user_id: string
  type: string
  title: string
  date: string
  doctor?: string
  facility?: string
  notes?: string
  file_url?: string
  created_at: string
  updated_at: string
}

export type HealthMetric = {
  id: string
  user_id: string
  name: string
  value: string
  unit?: string
  date: string
  notes?: string
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      medications: {
        Row: Medication
        Insert: Omit<Medication, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Medication, 'id' | 'created_at' | 'updated_at'>>
      }
      medication_logs: {
        Row: MedicationLog
        Insert: Omit<MedicationLog, 'id' | 'created_at'>
        Update: Partial<Omit<MedicationLog, 'id' | 'created_at'>>
      }
      medical_records: {
        Row: MedicalRecord
        Insert: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>>
      }
      health_metrics: {
        Row: HealthMetric
        Insert: Omit<HealthMetric, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<HealthMetric, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
} 