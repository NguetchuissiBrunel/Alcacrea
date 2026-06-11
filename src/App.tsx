import { Route, Routes } from 'react-router-dom'
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
import { ImportPage } from './pages/ImportPage'
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
      </Route>

      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="import" element={<ImportPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="exams/:type/:id" element={<BackendExamPage />} />
        <Route path="patients/:patientId/exams/:examId" element={<ExamDetailPage />} />
        <Route path="patients/:id" element={<PatientDetailPage />} />
        <Route path="analyse" element={<AnalysePage />} />
        <Route path="export" element={<ExportPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
