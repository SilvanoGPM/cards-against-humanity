import { FocusStyleManager } from '@blueprintjs/core';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '@/components/PrivateRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { Cards } from '@/pages/Cards';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Match } from '@/pages/Match';
import { Matches } from '@/pages/Matches';
import { NewCard } from '@/pages/NewCard';

import { Maintance } from './components/Maintenance';
import { IS_MAINTANCE } from './constants/globals';

import './styles/styles.scss';

FocusStyleManager.onlyShowFocusOnTabs();

const queryClient = new QueryClient();

export function App(): JSX.Element {
  if (IS_MAINTANCE) {
    return <Maintance />;
  }

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
            path="/matches"
            element={
              <PrivateRoute>
                <Matches />
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
