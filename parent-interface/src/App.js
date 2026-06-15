import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import LandingPage from './pages/LandingPage';
import LanguageSelect from './pages/LanguageSelect';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import IssueSelect from './pages/IssueSelect';
import StaffDetails from './pages/StaffDetails';
import QueueConfirm from './pages/QueueConfirm';
import WaitingScreen from './pages/WaitingScreen';
import SuccessPage from './pages/SuccessPage';
import Dashboard from './pages/Dashboard';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/language" element={<LanguageSelect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/issue-select" element={<IssueSelect />} />
            <Route path="/staff-details" element={<StaffDetails />} />
            <Route path="/queue-confirm" element={<QueueConfirm />} />
            <Route path="/waiting" element={<WaitingScreen />} />
            <Route path="/success" element={<SuccessPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;