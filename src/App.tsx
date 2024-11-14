import React from 'react';
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ElectionSetup } from './pages/ElectionSetup';
import { VoterAuth } from './pages/VoterAuth';
import { Voting } from './pages/Voting';
import { Results } from './pages/Results';
import { ElectionDetails } from './pages/ElectionDetails';
import { ThankYou } from './pages/ThankYou';

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="election/setup"
        element={
          <ProtectedRoute>
            <ElectionSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="election/:electionId"
        element={
          <ProtectedRoute>
            <ElectionDetails />
          </ProtectedRoute>
        }
      />
      <Route path="vote/:electionId/auth" element={<VoterAuth />} />
      <Route path="vote/:electionId" element={<Voting />} />
      <Route path="results/:electionId" element={<Results />} />
      <Route path="vote/:electionId/thank-you" element={<ThankYou />} />
    </Route>
  )
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
