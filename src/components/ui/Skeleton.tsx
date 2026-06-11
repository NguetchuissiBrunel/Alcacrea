import { useI18n } from '../../contexts/I18nContext'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-xl bg-vellum/8 ${className}`} aria-hidden="true" />
}

export function DashboardSkeleton() {
  const { t } = useI18n()
  return (
    <div aria-busy="true" aria-label={t('dashboard.skeleton')}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-[var(--radius-organic)]" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <Skeleton className="h-72 rounded-[var(--radius-organic)]" />
        <Skeleton className="h-72 rounded-[var(--radius-organic)]" />
      </div>
      <Skeleton className="h-40 rounded-[var(--radius-organic)]" />
    </div>
  )
}

export function PatientDetailSkeleton() {
  const { t } = useI18n()
  return (
    <div aria-busy="true" aria-label={t('patientDetail.skeleton')}>
      <Skeleton className="h-5 w-36 mb-8" />
      <Skeleton className="h-52 rounded-[2rem] mb-10" />
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    </div>
  )
}

export function PatientsGridSkeleton() {
  const { t } = useI18n()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" aria-busy="true" aria-label={t('patients.skeleton')}>
      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-[var(--radius-organic)]" />)}
    </div>
  )
}

export function ProfileSkeleton() {
  const { t } = useI18n()
  return (
    <div aria-busy="true" aria-label={t('profile.loading')}>
      <Skeleton className="h-10 w-64 mb-2" />
      <Skeleton className="h-4 w-96 max-w-full mb-10" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Skeleton className="h-72 rounded-[var(--radius-organic)]" />
          <Skeleton className="h-11 rounded-2xl" />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-80 rounded-[var(--radius-organic)]" />
          <Skeleton className="h-44 rounded-[var(--radius-organic)]" />
        </div>
      </div>
    </div>
  )
}
