import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { I18nProvider } from '@/i18n/I18nProvider';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/shell/AppShell';
import ComingSoon from '@/components/shell/ComingSoon';
import RoleRoute from '@/components/shell/RoleRoute';
import { COMING_SOON_ROUTES, MODULE_PATHS } from '@/lib/moduleRoutes';
import Welcome from '@/pages/Welcome';
import RoleDashboard from '@/pages/RoleDashboard';
import StudentDashboard from '@/pages/student/StudentDashboard';
import CoursesPage from '@/pages/student/CoursesPage';
import CourseDetailPage from '@/pages/student/CourseDetailPage';
import TimetablePage from '@/pages/student/TimetablePage';
import AssignmentsPage from '@/pages/student/AssignmentsPage';
import QuizzesPage from '@/pages/student/QuizzesPage';
import GradesPage from '@/pages/student/GradesPage';
import AttendancePage from '@/pages/student/AttendancePage';
import AcademicIntelligence from '@/pages/student/AcademicIntelligence';
import ApplicationsPage from '@/pages/student/ApplicationsPage';
import LibraryPage from '@/pages/student/LibraryPage';
import StudyGroupsPage from '@/pages/student/StudyGroupsPage';
import AiStudyCompanion from '@/pages/student/AiStudyCompanion';
import StudyRecommendations from '@/pages/student/StudyRecommendations';
import StudentProfilePage from '@/pages/student/StudentProfilePage';
import ProfessorDashboard from '@/pages/professor/ProfessorDashboard';
import DeanDashboard from '@/pages/dean/DeanDashboard';
import DeanFacultiesPage from '@/pages/dean/FacultiesPage';
import DeanDepartmentsPage from '@/pages/dean/DepartmentsPage';
import DeanProgrammesPage from '@/pages/dean/ProgrammesPage';
import DeanStudentsPage from '@/pages/dean/StudentsPage';
import DeanProfessorsPage from '@/pages/dean/ProfessorsPage';
import DeanCoursesPage from '@/pages/dean/CoursesPage';
import DeanPerformancePage from '@/pages/dean/PerformancePage';
import DeanAttendancePage from '@/pages/dean/AttendanceAnalyticsPage';
import DeanRiskPage from '@/pages/dean/RiskRadarPage';
import DeanReportsPage from '@/pages/dean/ReportsPage';
import DeanTimetablePage from '@/pages/dean/TimetablePage';
import Profile from '@/pages/account/Profile';
import UserSettings from '@/pages/account/UserSettings';
import NotificationsPage from '@/pages/account/NotificationsPage';
import Help from '@/pages/account/Help';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Mfa from '@/pages/Mfa';
import ProfessorAssignmentsPage from '@/pages/professor/AssignmentsPage';
import ProfessorAttendancePage from '@/pages/professor/AttendancePage';
import ProfessorCoursesPage from '@/pages/professor/CoursesPage';
import ProfessorGradingPage from '@/pages/professor/GradingPage';
import ProfessorGradeEntryPage from '@/pages/professor/GradeEntryPage';
import ProfessorBulkGradingPage from '@/pages/professor/BulkGradingPage';
import ProfessorMaterialsPage from '@/pages/professor/MaterialsPage';
import ProfessorAnnouncementsPage from '@/pages/professor/AnnouncementsPage';
import ProfessorQuizzesPage from '@/pages/professor/QuizzesPage';
import ProfessorStudentPerformancePage from '@/pages/professor/StudentPerformancePage';
import ProfessorComparePage from '@/pages/professor/ComparePerformancePage';
import ProfessorGradeAlertsPage from '@/pages/professor/GradeAlertsPage';
import ProfessorDiscussionsPage from '@/pages/professor/DiscussionsPage';
import ProfessorAiAssistant from '@/pages/professor/AiTeachingAssistant';
import MyTeachingPage from '@/pages/professor/MyTeachingPage';
import UserManagement from '@/pages/admin/UserManagement';
import AcademicIntegrityPage from '@/pages/integrity/AcademicIntegrityPage';
import CompleteProfile from '@/pages/account/CompleteProfile';
import AdminOnlyRoute from '@/components/shell/AdminOnlyRoute';
import DeanAssistant from '@/pages/Assistant';
import CommunicationCenter from '@/pages/communication/CommunicationCenter';
import WorkspaceGuard from '@/components/shell/WorkspaceGuard';
import InvitationJoin from '@/pages/communication/InvitationJoin';
import { AdminDataProvider } from '@/lib/AdminDataContext';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/mfa" element={<Mfa />} />
      <Route
        element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}
      >
        {/* Authorisation resolves before the workspace shell mounts, so a denied
            request renders on its own neutral page instead of inside a workspace. */}
        <Route element={<WorkspaceGuard />}>
          <Route element={<AppShell />}>
          <Route path="/dashboard" element={<RoleDashboard />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/academic-integrity" element={<AcademicIntegrityPage />} />
          <Route
            path="/admin/users"
            element={
              <AdminOnlyRoute>
                <UserManagement />
              </AdminOnlyRoute>
            }
          />

          {/* Legacy workspace paths resolve to the role's dashboard. */}
          <Route path="/student" element={<Navigate to={MODULE_PATHS.student.dashboard} replace />} />
          <Route path="/professor" element={<Navigate to={MODULE_PATHS.professor.dashboard} replace />} />
          <Route path="/dean" element={<Navigate to={MODULE_PATHS.dean.dashboard} replace />} />

          {/* Workspace entry routes: /workspace/:workspace is the destination of the
              welcome cards. WorkspaceGuard above resolves each request against the
              account's real role, so an allowed one opens that workspace's home and
              a denied one renders the standalone refusal page. Neither is a 404. */}
          <Route path="/workspace/:workspace" element={<Navigate to="/dashboard" replace />} />
          <Route path="/administration" element={<Navigate to="/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />

          {/* A requested workspace is checked by WorkspaceGuard above the shell. */}

          {/* Student workspace: dedicated pages, all owned by the student role. */}
          <Route
            path={MODULE_PATHS.student.dashboard}
            element={
              <RoleRoute role="student">
                <StudentDashboard />
              </RoleRoute>
            }
          />
          <Route
            path={MODULE_PATHS.student.courses}
            element={
              <RoleRoute role="student">
                <CoursesPage />
              </RoleRoute>
            }
          />
          <Route
            path={`${MODULE_PATHS.student.courses}/:courseId`}
            element={
              <RoleRoute role="student">
                <CourseDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path={MODULE_PATHS.student.timetable}
            element={
              <RoleRoute role="student">
                <TimetablePage />
              </RoleRoute>
            }
          />
          <Route
            path={MODULE_PATHS.student.assignments}
            element={
              <RoleRoute role="student">
                <AssignmentsPage />
              </RoleRoute>
            }
          />
          <Route
            path={MODULE_PATHS.student.quizzes}
            element={
              <RoleRoute role="student">
                <QuizzesPage />
              </RoleRoute>
            }
          />
          <Route
            path={MODULE_PATHS.student.grades}
            element={
              <RoleRoute role="student">
                <GradesPage />
              </RoleRoute>
            }
          />
          <Route
            path={MODULE_PATHS.student.attendance}
            element={
              <RoleRoute role="student">
                <AttendancePage />
              </RoleRoute>
            }
          />
          <Route
            path={MODULE_PATHS.student.intelligence}
            element={
              <RoleRoute role="student">
                <AcademicIntelligence />
              </RoleRoute>
            }
          />
          <Route
            path={MODULE_PATHS.student.applications}
            element={
              <RoleRoute role="student">
                <ApplicationsPage />
              </RoleRoute>
            }
          />
          <Route
            path={MODULE_PATHS.student.library}
            element={
              <RoleRoute role="student">
                <LibraryPage />
              </RoleRoute>
            }
          />
          <Route
            path={MODULE_PATHS.student.ai}
            element={
              <RoleRoute role="student">
                <AiStudyCompanion />
              </RoleRoute>
            }
          />
          <Route
            path={MODULE_PATHS.student.recommendations}
            element={
              <RoleRoute role="student">
                <StudyRecommendations />
              </RoleRoute>
            }
          />
          <Route
            path={MODULE_PATHS.student.profile}
            element={
              <RoleRoute role="student">
                <StudentProfilePage />
              </RoleRoute>
            }
          />
          <Route
            path={MODULE_PATHS.student.studyGroups}
            element={
              <RoleRoute role="student">
                <StudyGroupsPage />
              </RoleRoute>
            }
          />
          <Route
            path={MODULE_PATHS.professor.dashboard}
            element={
              <RoleRoute role="professor">
                <ProfessorDashboard />
              </RoleRoute>
            }
          />
          {/* Professor workspace: teaching pages owned by the professor role. */}
          {[
            [MODULE_PATHS.professor.teaching, MyTeachingPage],
            [MODULE_PATHS.professor.courses, ProfessorCoursesPage],
            [MODULE_PATHS.professor.materials, ProfessorMaterialsPage],
            [MODULE_PATHS.professor.announcements, ProfessorAnnouncementsPage],
            [MODULE_PATHS.professor.assignments, ProfessorAssignmentsPage],
            [MODULE_PATHS.professor.quizzes, ProfessorQuizzesPage],
            [MODULE_PATHS.professor.grading, ProfessorGradingPage],
            [MODULE_PATHS.professor.bulkGrading, ProfessorBulkGradingPage],
            [MODULE_PATHS.professor.gradeEntry, ProfessorGradeEntryPage],
            [MODULE_PATHS.professor.attendance, ProfessorAttendancePage],
            [MODULE_PATHS.professor.students, ProfessorStudentPerformancePage],
            [MODULE_PATHS.professor.compare, ProfessorComparePage],
            [MODULE_PATHS.professor.alerts, ProfessorGradeAlertsPage],
            [MODULE_PATHS.professor.discussions, ProfessorDiscussionsPage],
            [MODULE_PATHS.professor.ai, ProfessorAiAssistant],
          ].map(([path, Component]) => (
            <Route
              key={path}
              path={path}
              element={
                <RoleRoute role="professor">
                  <Component />
                </RoleRoute>
              }
            />
          ))}
          <Route
            path={MODULE_PATHS.dean.dashboard}
            element={
              <RoleRoute role="dean">
                <DeanDashboard />
              </RoleRoute>
            }
          />
          {/* Dean modules: each one is a real page reading the authorised
              institutional dataset. */}
          {[
            [MODULE_PATHS.dean.faculties, DeanFacultiesPage],
            [MODULE_PATHS.dean.departments, DeanDepartmentsPage],
            [MODULE_PATHS.dean.programmes, DeanProgrammesPage],
            [MODULE_PATHS.dean.students, DeanStudentsPage],
            [MODULE_PATHS.dean.professors, DeanProfessorsPage],
            [MODULE_PATHS.dean.courses, DeanCoursesPage],
            [MODULE_PATHS.dean.performance, DeanPerformancePage],
            [MODULE_PATHS.dean.attendance, DeanAttendancePage],
            [MODULE_PATHS.dean.timetable, DeanTimetablePage],
            [MODULE_PATHS.dean.risk, DeanRiskPage],
            [MODULE_PATHS.dean.reports, DeanReportsPage],
          ].map(([path, Component]) => (
            <Route
              key={path}
              path={path}
              element={
                <RoleRoute role="dean">
                  <Component />
                </RoleRoute>
              }
            />
          ))}
          <Route
            path={MODULE_PATHS.dean.ai}
            element={
              <RoleRoute role="dean">
                <AdminDataProvider>
                  <DeanAssistant />
                </AdminDataProvider>
              </RoleRoute>
            }
          />
          <Route
            path={MODULE_PATHS.student.notifications}
            element={
              <RoleRoute role="student">
                <NotificationsPage />
              </RoleRoute>
            }
          />

          {/* Role-scoped module routes; each one verifies ownership by path prefix. */}
          {COMING_SOON_ROUTES.map((path) => (
            <Route key={path} path={path} element={<ComingSoon />} />
          ))}

          {/* Communication Center: one authorised surface, role-appropriate
              tabs, every read and write decided by the communication function. */}
          <Route path="/communication" element={<CommunicationCenter tab="inbox" />} />
          <Route path="/communication/groups" element={<CommunicationCenter tab="groups" />} />
          <Route path="/communication/directory" element={<CommunicationCenter tab="directory" />} />
          <Route path="/communication/notifications" element={<CommunicationCenter tab="notifications" />} />
          <Route path="/communication/moderation" element={<CommunicationCenter tab="moderation" />} />
          <Route path="/communication/coordinators" element={<CommunicationCenter tab="coordinators" />} />
          <Route path="/invite/:token" element={<InvitationJoin />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/help" element={<Help />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <I18nProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </I18nProvider>
    </AuthProvider>
  )
}

export default App