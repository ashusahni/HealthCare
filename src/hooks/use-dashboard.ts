import { useState, useEffect } from 'react'
import { medicationService, medicalRecordService, healthMetricService, medicationLogService } from '@/lib/services/database'
import type { Medication, MedicalRecord, HealthMetric } from '@/types/database'

export function useDashboard() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const [medicationsData, recordsData, metricsData] = await Promise.all([
          medicationService.getTodayMedications(),
          medicalRecordService.getMedicalRecords(),
          healthMetricService.getHealthMetrics()
        ])

        setMedications(medicationsData)
        setRecords(recordsData)
        setMetrics(metricsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const markMedicationAsTaken = async (medicationId: string) => {
    try {
      await medicationLogService.addMedicationLog({
        medication_id: medicationId,
        user_id: '', // This will be set by the RLS policy
        taken_at: new Date().toISOString(),
        status: 'taken'
      })

      // Refresh medications
      const updatedMedications = await medicationService.getTodayMedications()
      setMedications(updatedMedications)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark medication as taken')
    }
  }

  return {
    medications,
    records,
    metrics,
    loading,
    error,
    markMedicationAsTaken
  }
} 