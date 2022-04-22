import { Route, Routes } from 'react-router-dom';

import { Home } from '@/pages/Home';
import { Match } from '@/pages/Match';

export function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/match/:id" element={<Match />} />
    </Routes>
  );
}
