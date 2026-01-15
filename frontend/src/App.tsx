import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LandingPage } from '@/pages/landing';
import { LoginPage } from '@/pages/login';
import { WorkflowsPage } from '@/pages/workflows';
import { WorkflowEditorPage } from '@/pages/workflow-editor';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/hooks/use-auth';
import { useThemeStore } from '@/stores/theme-store';
import { useEffect } from 'react';

import { Toaster } from 'sonner';

const queryClient = new QueryClient();

function App() {
  useAuth();
  const { theme, applyTheme } = useThemeStore();

  useEffect(() => {
    applyTheme();

    // Listen for system theme changes if theme is set to 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (useThemeStore.getState().theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-right" theme={theme === 'system' ? undefined : theme} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/workflows"
            element={
              <ProtectedRoute>
                <WorkflowsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows/new"
            element={
              <ProtectedRoute>
                <WorkflowEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workflows/:id"
            element={
              <ProtectedRoute>
                <WorkflowEditorPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
