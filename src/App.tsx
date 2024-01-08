import { Route, Routes } from 'react-router-dom';

import { PrivateRoute } from '@/components/PrivateRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { Cards } from '@/pages/Cards';
import { Home } from '@/pages/Home';
import { Match } from '@/pages/Match';
import { Matches } from '@/pages/Matches';
import { NewCard } from '@/pages/NewCard';

import { Maintance } from './components/Maintenance';
import { IS_MAINTANCE } from './constants/globals';

import '@fontsource/roboto/400.css';
import '@fontsource/roboto/700.css';

export function App(): JSX.Element {
  if (IS_MAINTANCE) {
    return <Maintance />;
  }

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />

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
      </Routes>
    </AuthProvider>
  );
}
