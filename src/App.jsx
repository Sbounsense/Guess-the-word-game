import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './components/layout/Layout.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'

import LoginPage from './pages/LoginPage.jsx'

// Student pages
import StudentDashboard from './pages/student/StudentDashboard.jsx'
import ModuleView from './pages/student/ModuleView.jsx'
import LessonView from './pages/student/LessonView.jsx'
import HomeworkView from './pages/student/HomeworkView.jsx'
import StudySession from './pages/student/StudySession.jsx'
import Leaderboard from './pages/student/Leaderboard.jsx'
import Profile from './pages/student/Profile.jsx'
import SessionHistory from './pages/student/SessionHistory.jsx'

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx'
import DeckEditor from './pages/teacher/DeckEditor.jsx'
import ModuleEditor from './pages/teacher/ModuleEditor.jsx'
import LessonEditor from './pages/teacher/LessonEditor.jsx'
import HomeworkEditor from './pages/teacher/HomeworkEditor.jsx'
import ClassProgress from './pages/teacher/ClassProgress.jsx'
import GradingView from './pages/teacher/GradingView.jsx'
import StudentDetail from './pages/teacher/StudentDetail.jsx'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import UserManager from './pages/admin/UserManager.jsx'
import SubjectManager from './pages/admin/SubjectManager.jsx'
import AdminReports from './pages/admin/AdminReports.jsx'

function AppRoutes() {
  const { currentUser } = useAuth()

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={
          currentUser
            ? <Navigate to={`/${currentUser.role}`} replace />
            : <Navigate to="/login" replace />
        } />

        {/* Student */}
        <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/modules/:moduleId" element={<ProtectedRoute roles={['student','teacher']}><ModuleView /></ProtectedRoute>} />
        <Route path="/modules/:moduleId/lessons/:lessonId" element={<ProtectedRoute><LessonView /></ProtectedRoute>} />
        <Route path="/homework/:homeworkId" element={<ProtectedRoute roles={['student']}><HomeworkView /></ProtectedRoute>} />
        <Route path="/study/:deckId" element={<ProtectedRoute roles={['student']}><StudySession /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute roles={['student']}><Leaderboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute roles={['student']}><Profile /></ProtectedRoute>} />
        <Route path="/student/history" element={<ProtectedRoute roles={['student']}><SessionHistory /></ProtectedRoute>} />

        {/* Teacher */}
        <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/decks/new" element={<ProtectedRoute roles={['teacher']}><DeckEditor /></ProtectedRoute>} />
        <Route path="/teacher/decks/:deckId/edit" element={<ProtectedRoute roles={['teacher']}><DeckEditor /></ProtectedRoute>} />
        <Route path="/teacher/modules/new" element={<ProtectedRoute roles={['teacher']}><ModuleEditor /></ProtectedRoute>} />
        <Route path="/teacher/modules/:moduleId" element={<ProtectedRoute roles={['teacher']}><ModuleEditor /></ProtectedRoute>} />
        <Route path="/teacher/lessons/:lessonId/edit" element={<ProtectedRoute roles={['teacher']}><LessonEditor /></ProtectedRoute>} />
        <Route path="/teacher/homework/new" element={<ProtectedRoute roles={['teacher']}><HomeworkEditor /></ProtectedRoute>} />
        <Route path="/teacher/homework/:hwId/edit" element={<ProtectedRoute roles={['teacher']}><HomeworkEditor /></ProtectedRoute>} />
        <Route path="/teacher/homework/:hwId/grade" element={<ProtectedRoute roles={['teacher']}><GradingView /></ProtectedRoute>} />
        <Route path="/teacher/students/:studentId" element={<ProtectedRoute roles={['teacher']}><StudentDetail /></ProtectedRoute>} />
        <Route path="/teacher/progress" element={<ProtectedRoute roles={['teacher']}><ClassProgress /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UserManager /></ProtectedRoute>} />
        <Route path="/admin/subjects" element={<ProtectedRoute roles={['admin']}><SubjectManager /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
