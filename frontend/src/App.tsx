import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import PlayerStats from './pages/PlayerStats';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/stats" element={<PlayerStats />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
