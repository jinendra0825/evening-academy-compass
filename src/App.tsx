import { BrowserRouter, Route, Routes, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Pages
import IndexPage from "@/pages/Index";
import LoginPage from "@/pages/Login";
import SignupPage from "@/pages/Signup";
import DashboardPage from "@/pages/Dashboard";
import MyCoursesPage from "@/pages/MyCourses";
import CourseDetailPage from "@/pages/CourseDetail";
import AssignmentsPage from "@/pages/Assignments";
import AssignmentManagement from "@/pages/AssignmentManagement";
import GradesPage from "@/pages/Grades";
import AttendancePage from "@/pages/Attendance";
import SchedulePage from "@/pages/Schedule";
import MessagesPage from "@/pages/Messages";
import SettingsPage from "@/pages/Settings";
import NotFoundPage from "@/pages/NotFound";
import PaymentPage from "@/pages/Payment";
import PaymentSuccessPage from "@/pages/PaymentSuccess";

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<IndexPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/my-courses" element={<MyCoursesPage />} />
              <Route path="/courses/:courseId" element={<CourseDetailPage />} />

              {/* Teacher-only routes */}
              <Route element={<ProtectedRoute allowedRoles={["teacher", "admin"]} />}>
                <Route path="/assignments/:id" element={<AssignmentManagement />} />
              </Route>

              {/* Student/Teacher routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/assignments" element={<AssignmentsPage />} />
                <Route path="/grades" element={<GradesPage />} />
              </Route>

              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/payment-success" element={<PaymentSuccessPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
