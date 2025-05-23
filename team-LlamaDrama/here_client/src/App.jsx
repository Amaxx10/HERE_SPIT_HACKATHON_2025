import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Map from './components/Map';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Support from './pages/Support';

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen w-full bg-gray-50">
        <header className="bg-slate-800 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="text-2xl font-semibold tracking-tight hover:text-gray-200">
              HERE Maps Business Solutions
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">MapView</Link>
              <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              <Link to="/analytics" className="text-gray-300 hover:text-white transition-colors">Analytics</Link>
              <Link to="/support" className="text-gray-300 hover:text-white transition-colors">Support</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 relative">
          <Routes>
            <Route path="/" element={<Map />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/support" element={<Support />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
