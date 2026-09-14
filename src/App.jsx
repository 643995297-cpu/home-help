import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useHouse } from './store/HouseContext';
import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Cleaning from './pages/Cleaning';
import Items from './pages/Items';
import Rules from './pages/Rules';

function App() {
  const { hasSession, loading } = useHouse();
  const location = useLocation();

  if (!hasSession) return <Welcome />;

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/cleaning" element={<Cleaning />} />
          <Route path="/items" element={<Items />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cream/60 backdrop-blur-sm">
          <div className="text-clay-500 font-serif text-lg">加载中…</div>
        </div>
      )}
    </Layout>
  );
}

export default App;
