import 'leaflet/dist/leaflet.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Map from './components/Map';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Support from './pages/Support';

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen w-full bg-slate-50">
        <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span className="text-2xl font-bold tracking-tight group-hover:text-blue-300 transition-colors">
                GeoFix
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-36">
              <Link to="/" className="nav-link group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="group-hover:text-blue-300 transition-colors">MapView</span>
              </Link>
              <Link to="/dashboard" className="nav-link group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="group-hover:text-blue-300 transition-colors">Dashboard</span>
              </Link>
              <Link to="/analytics" className="nav-link group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="group-hover:text-blue-300 transition-colors">Analytics</span>
              </Link>
              <Link to="/support" className="nav-link group">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="group-hover:text-blue-300 transition-colors">Support</span>
              </Link>
            </nav>
          </div>
        </header>
        <style jsx>{`
          .nav-link {
            @apply flex items-center space-x-2 text-gray-300 py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-700;
          }
        `}</style>
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
