import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LiteModeProvider } from './context/LiteModeContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

// Layout & Common
import { AppLayout } from './components/layout/AppLayout';
import { PageFlipLoader3D } from './3d/PageFlipLoader3D';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TodayPage } from './pages/TodayPage';
import { DashboardPage } from './pages/DashboardPage';
import { CollaborationsPage } from './pages/CollaborationsPage';
import { CollabDetailSpread } from './pages/CollabDetailSpread';
import { ContentPage } from './pages/ContentPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { TasksPage } from './pages/TasksPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ScrapbookPage } from './pages/ScrapbookPage';
import { NotificationsRecapPage } from './pages/NotificationsRecapPage';
import { SettingsPage } from './pages/SettingsPage';

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <PageFlipLoader3D message="Flipping open journal..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not allowed, redirect to Today's page
    return <Navigate to="/today" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LiteModeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected App Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/today" element={<TodayPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/collaborations" element={<CollaborationsPage />} />
                <Route path="/collaborations/:id" element={<CollabDetailSpread />} />
                <Route path="/content" element={<ContentPage />} />
                <Route
                  path="/expenses"
                  element={
                    <ProtectedRoute allowedRoles={['CREATOR', 'TEAM_MEMBER']}>
                      <ExpensesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tasks"
                  element={
                    <ProtectedRoute allowedRoles={['CREATOR', 'TEAM_MEMBER']}>
                      <TasksPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['CREATOR']}>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/scrapbook" element={<ScrapbookPage />} />
                <Route path="/notifications" element={<NotificationsRecapPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LiteModeProvider>
    </QueryClientProvider>
  );
}

export default App;
