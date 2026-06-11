import { Navigate, useParams } from 'react-router-dom'
import { useAsyncData } from '../hooks/useAsyncData'
import { api } from '../services/api'
import { PatientDetailSkeleton } from '../components/ui/Skeleton'
import { ErrorMessage } from '../components/ui/ErrorMessage'

/** Redirige vers la fiche examen backend. */
export function ExamDetailPage() {
  const { patientId, examId } = useParams<{ patientId: string; examId: string }>()

  const { data: patient, loading, error, retry } = useAsyncData(
    () => (patientId ? api.getPatient(patientId) : Promise.resolve(null)),
    [patientId],
  )

  if (loading) return <PatientDetailSkeleton />
  if (error) return <ErrorMessage message={error} onRetry={retry} />

  const exam = patient?.exams.find((e) => e.id === examId)

  if (exam?.backendRef) {
    return <Navigate to={`/exams/${exam.backendRef.type}/${exam.backendRef.id}`} replace />
  }

  return <Navigate to={patientId ? `/patients/${patientId}` : '/patients'} replace />
}
