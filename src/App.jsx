import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import { AdminDataProvider } from '@/lib/AdminDataContext';
import Dashboard from '@/pages/Dashboard';
import Faculties from '@/pages/Faculties';
import Students from '@/pages/Students';
import StudentDetail from '@/pages/StudentDetail';
import Staff from '@/pages/Staff';
import Attendance from '@/pages/Attendance';
import Performance from '@/pages/Performance';
import Requests from '@/pages/Requests';
import CalendarPage from '@/pages/Calendar';
import Announcements from '@/pages/Announcements';
import Intelligence from '@/pages/Intelligence';
import Assistant from '@/pages/Assistant';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Mfa from '@/pages/Mfa';
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
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/mfa" element={<Mfa />} />
      <Route
        element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}
      >
        <Route
          element={
            <AdminDataProvider>
              <AppLayout />
            </AdminDataProvider>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/faculties" element={<Faculties />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App