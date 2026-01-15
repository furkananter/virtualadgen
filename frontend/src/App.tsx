import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LandingPage } from '@/pages/landing';
import { LoginPage } from '@/pages/login';
import { WorkflowsPage } from '@/pages/workflows';
import { WorkflowEditorPage } from '@/pages/workflow-editor';
import { WorkflowHistoryPage } from '@/pages/workflow-history';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useThemeStore } from '@/stores/theme-store';

import { Toaster } from 'sonner';

const queryClient = new QueryClient();

function App() {
  useAuth();
  useTheme();
  const theme = useThemeStore((state) => state.theme);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-right" theme={theme === 'system' ? undefined : theme} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/workflows/new" element={<WorkflowEditorPage />} />
            <Route path="/workflows/:id" element={<WorkflowEditorPage />} />
            <Route path="/workflows/:id/history" element={<WorkflowHistoryPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
