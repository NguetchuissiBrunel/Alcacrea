import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { AuthLayout } from './components/layout/AuthLayout'
import { AnalysePage } from './pages/AnalysePage'
import { DashboardPage } from './pages/DashboardPage'
import { ExportPage } from './pages/ExportPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { BackendExamPage } from './pages/BackendExamPage'
import { ExamDetailPage } from './pages/ExamDetailPage'
import { ExamsPage } from './pages/ExamsPage'
import { ImportPage } from './pages/ImportPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { PatientDetailPage } from './pages/PatientDetailPage'
import { PatientsPage } from './pages/PatientsPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="exams" element={<ExamsPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="exams/:type/:id" element={<BackendExamPage />} />
        <Route path="patients/:patientId/exams/:examId" element={<ExamDetailPage />} />
        <Route path="patients/:id" element={<PatientDetailPage />} />
        <Route path="analyse" element={<AnalysePage />} />
        <Route path="export" element={<ExportPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      </Route>
    </Routes>
  )
}
