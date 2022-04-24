import { Route, Routes } from 'react-router-dom';
import { FocusStyleManager } from '@blueprintjs/core';
import { QueryClient, QueryClientProvider } from 'react-query';

import { Home } from '@/pages/Home';
import { Match } from '@/pages/Match';
import { Cards } from '@/pages/Cards';
import { Login } from '@/pages/Login';
import { NewCard } from '@/pages/NewCard';
import { AuthProvider } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/PrivateRoute';

import './styles/styles.scss';

FocusStyleManager.onlyShowFocusOnTabs();

const queryClient = new QueryClient();

export function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/match/:id"
            element={
              <PrivateRoute>
                <Match />
              </PrivateRoute>
            }
          />
          <Route
            path="/cards"
            element={
              <PrivateRoute>
                <Cards />
              </PrivateRoute>
            }
          />
          <Route
            path="/new-card"
            element={
              <PrivateRoute onlyAdmins>
                <NewCard />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}
