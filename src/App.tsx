import { Route, Routes } from 'react-router-dom';

import { Home } from '@/pages/Home';
import { Match } from '@/pages/Match';
import { RequestName } from '@/pages/RequestName';
import { UserProvider } from '@/contexts/UserContext';

export function App(): JSX.Element {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<RequestName />} />
        <Route path="/match/:id" element={<Match />} />
      </Routes>
    </UserProvider>
  );
}
