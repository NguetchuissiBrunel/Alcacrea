import { lazy, Suspense, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { AuthLayout } from './components/layout/AuthLayout'
import { PageLoader } from './components/ui/PageLoader'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const ImportPage = lazy(() => import('./pages/ImportPage').then((m) => ({ default: m.ImportPage })))
const ExamsPage = lazy(() => import('./pages/ExamsPage').then((m) => ({ default: m.ExamsPage })))
const PatientsPage = lazy(() => import('./pages/PatientsPage').then((m) => ({ default: m.PatientsPage })))
const BackendExamPage = lazy(() => import('./pages/BackendExamPage').then((m) => ({ default: m.BackendExamPage })))
const ExamDetailPage = lazy(() => import('./pages/ExamDetailPage').then((m) => ({ default: m.ExamDetailPage })))
const PatientDetailPage = lazy(() => import('./pages/PatientDetailPage').then((m) => ({ default: m.PatientDetailPage })))
const AnalysePage = lazy(() => import('./pages/AnalysePage').then((m) => ({ default: m.AnalysePage })))
const ExportPage = lazy(() => import('./pages/ExportPage').then((m) => ({ default: m.ExportPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<LazyPage><DashboardPage /></LazyPage>} />
          <Route path="import" element={<LazyPage><ImportPage /></LazyPage>} />
          <Route path="exams" element={<LazyPage><ExamsPage /></LazyPage>} />
          <Route path="patients" element={<LazyPage><PatientsPage /></LazyPage>} />
          <Route path="exams/:type/:id" element={<LazyPage><BackendExamPage /></LazyPage>} />
          <Route path="patients/:patientId/exams/:examId" element={<LazyPage><ExamDetailPage /></LazyPage>} />
          <Route path="patients/:id" element={<LazyPage><PatientDetailPage /></LazyPage>} />
          <Route path="analyse" element={<LazyPage><AnalysePage /></LazyPage>} />
          <Route path="export" element={<LazyPage><ExportPage /></LazyPage>} />
          <Route path="profile" element={<LazyPage><ProfilePage /></LazyPage>} />
          <Route path="*" element={<LazyPage><NotFoundPage /></LazyPage>} />
        </Route>
      </Route>
    </Routes>
  )
}
