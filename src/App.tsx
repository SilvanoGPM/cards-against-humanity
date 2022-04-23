import { Route, Routes } from 'react-router-dom';

import { Home } from '@/pages/Home';
import { Match } from '@/pages/Match';
import { Login } from '@/pages/Login';
import { AuthProvider } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/PrivateRoute';

export function App(): JSX.Element {
  return (
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
        <Route path="/login" element={<Login />} />
      </Routes>
    </AuthProvider>
  );
}
