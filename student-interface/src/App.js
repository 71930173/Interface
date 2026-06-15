import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import StudentLogin from './components/student/StudentLogin';
import StudentSignup from './components/student/StudentSignup';
import StudentDashboard from './components/student/StudentDashboard';
import IssueTypeSelection from './components/student/IssueTypeSelection';
import StaffSelection from './components/student/StaffSelection';
import QueueStatus from './components/student/QueueStatus';
import StudentAppointments from './components/student/StudentAppointments';
import StudentNotifications from './components/student/StudentNotifications';
import StudentProfile from './components/student/StudentProfile';
import StudentSettings from './components/student/StudentSettings';

// Staff
import StaffLogin from './components/staff/StaffLogin';
import StaffDashboard from './components/staff/StaffDashboard';
import StaffQueue from './components/staff/StaffQueue';
import StaffNotifications from './components/staff/StaffNotifications';

// Parent
import ParentLogin from './components/parent/ParentLogin';
import ParentSignup from './components/parent/ParentSignup';
import ParentDashboard from './components/parent/ParentDashboard';
import ParentQueue from './components/parent/ParentQueue';
import ParentAppointments from './components/parent/ParentAppointments';
import ParentNotifications from './components/parent/ParentNotifications';

// Admin
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminStaff from './components/admin/AdminStaff';
import AdminStudents from './components/admin/AdminStudents';
import AdminParents from './components/admin/AdminParents';
import AdminAppointments from './components/admin/AdminAppointments';
import AdminSettings from './components/admin/AdminSettings';

const App = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-dark-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-50">
      <Navbar />
      <main className="flex-1 pt-16">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/signup" element={<StudentSignup />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedTypes={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/queue" element={
            <ProtectedRoute allowedTypes={['student']}>
              <IssueTypeSelection />
            </ProtectedRoute>
          } />
          <Route path="/student/staff-selection/:issueTypeId" element={
            <ProtectedRoute allowedTypes={['student']}>
              <StaffSelection />
            </ProtectedRoute>
          } />
          <Route path="/student/queue-status/:appointmentId" element={
            <ProtectedRoute allowedTypes={['student']}>
              <QueueStatus />
            </ProtectedRoute>
          } />
          <Route path="/student/appointments" element={
            <ProtectedRoute allowedTypes={['student']}>
              <StudentAppointments />
            </ProtectedRoute>
          } />
          <Route path="/student/notifications" element={
            <ProtectedRoute allowedTypes={['student']}>
              <StudentNotifications />
            </ProtectedRoute>
          } />
          <Route path="/student/profile" element={
            <ProtectedRoute allowedTypes={['student']}>
              <StudentProfile />
            </ProtectedRoute>
          } />
          <Route path="/student/settings" element={
            <ProtectedRoute allowedTypes={['student']}>
              <StudentSettings />
            </ProtectedRoute>
          } />

          {/* Parent Routes */}
          <Route path="/parent/login" element={<ParentLogin />} />
          <Route path="/parent/signup" element={<ParentSignup />} />
          <Route path="/parent/dashboard" element={
            <ProtectedRoute allowedTypes={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/parent/queue" element={
            <ProtectedRoute allowedTypes={['parent']}>
              <ParentQueue />
            </ProtectedRoute>
          } />
          <Route path="/parent/appointments" element={
            <ProtectedRoute allowedTypes={['parent']}>
              <ParentAppointments />
            </ProtectedRoute>
          } />
          <Route path="/parent/notifications" element={
            <ProtectedRoute allowedTypes={['parent']}>
              <ParentNotifications />
            </ProtectedRoute>
          } />

          {/* Staff Routes */}
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/staff/dashboard" element={
            <ProtectedRoute allowedTypes={['staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/staff/queue" element={
            <ProtectedRoute allowedTypes={['staff']}>
              <StaffQueue />
            </ProtectedRoute>
          } />
          <Route path="/staff/notifications" element={
            <ProtectedRoute allowedTypes={['staff']}>
              <StaffNotifications />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedTypes={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/staff" element={
            <ProtectedRoute allowedTypes={['admin']}>
              <AdminStaff />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedTypes={['admin']}>
              <AdminStudents />
            </ProtectedRoute>
          } />
          <Route path="/admin/parents" element={
            <ProtectedRoute allowedTypes={['admin']}>
              <AdminParents />
            </ProtectedRoute>
          } />
          <Route path="/admin/appointments" element={
            <ProtectedRoute allowedTypes={['admin']}>
              <AdminAppointments />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedTypes={['admin']}>
              <AdminSettings />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;