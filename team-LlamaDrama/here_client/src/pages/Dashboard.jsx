import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';
import { useState, useEffect } from 'react';
import { use } from 'chai';
import { useNavigate } from 'react-router-dom';

const data = [
  { name: 'Mon', value: 87 },
  { name: 'Tue', value: 92 },
  { name: 'Wed', value: 88 },
  { name: 'Thu', value: 95 },
  { name: 'Fri', value: 89 },
  { name: 'Sat', value: 82 },
  { name: 'Sun', value: 91 }
];

const LogEntry = ({ log }) => {
  const navigate = useNavigate();

  const handleCoordinateClick = (lat, lng) => {
    navigate(`/?lat=${lat}&lng=${lng}`);
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 mb-3"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-blue-400 font-semibold truncate">{log.address}</h4>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
              {log.poi_type}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-slate-400 text-xs mb-1">Location Status</p>
              <span className={`text-sm ${
                log.algorithmic_analysis.location_accuracy === 'accurate' 
                  ? 'text-emerald-400' 
                  : 'text-yellow-400'
              }`}>
                {log.algorithmic_analysis.location_accuracy}
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Confidence Score</p>
              <span className="text-sm text-blue-400">
                {log.algorithmic_analysis.confidence_score * 100}%
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Recommended Action</p>
              <span className={`text-sm ${
                log.algorithmic_analysis.recommended_action === 'keep_current'
                  ? 'text-emerald-400'
                  : 'text-yellow-400'
              }`}>
                {log.algorithmic_analysis.recommended_action.replace('_', ' ')}
              </span>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Coordinates</p>
              <button 
                onClick={() => handleCoordinateClick(log.coordinates[0], log.coordinates[1])}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer underline"
              >
                {log.coordinates[0].toFixed(5)}, {log.coordinates[1].toFixed(5)}
              </button>
            </div>
          </div>
          {log.algorithmic_analysis.observations && (
            <div className="mt-3 text-sm text-slate-300">
              <p className="text-slate-400 text-xs mb-1">Observations</p>
              {log.algorithmic_analysis.observations}
            </div>
          )}
        </div>
        <span className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded ml-4 whitespace-nowrap">
          ID: {log._id.slice(-6)}
        </span>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {

  const [list, setList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/mapview/allFeatures`, {
          method: 'GET',
        });
        const result = await response.json();
        console.log('Fetched logs:', result);
        setList(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  
  return (
    
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-blue-900 to-slate-900 p-8"
    >
      {/* Logs Section */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-blue-900 backdrop-blur-lg rounded-2xl mx-20 max-w-8xl p-6 border border-slate-700/50 shadow-lg shadow-blue-500/5"
        >
          <h3 className="text-xl font-semibold text-slate-100 mb-6 flex items-center">
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
            Feature Correction Logs
          </h3>
          <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {list.map((log, index) => (
              <LogEntry key={index} log={log} className="" />
            ))}
            {list.length === 0 && (
              <p className="text-slate-400 text-center py-4">No logs available</p>
            )}
          </div>
        </motion.div>
      <div className="max-w-7xl mx-auto my-8 space-y-8">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-blue-400/10 blur-3xl rounded-full"></div>
          <h1 className="relative text-5xl font-bold text-black mb-2">
            Fleet Dashboard
            <span className="block text-lg font-normal text-blue-900 mt-2">
              Real-time monitoring and analytics
            </span>
          </h1>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Replace existing cards with enhanced versions */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-blue-900 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 shadow-lg shadow-blue-500/5"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200">Active Vehicles</h3>
                <div className="flex items-baseline space-x-2">
                  <p className="text-4xl font-bold text-blue-400">
                    <CountUp start={0} end={127} duration={2.75} separator="," />
                  </p>
                  <span className="text-sm text-emerald-400">+12%</span>
                </div>
              </div>
            </div>
            <div className="mt-4 h-1 bg-slate-700/50 rounded-full overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400 w-[85%]"></div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-blue-900 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 shadow-lg shadow-blue-500/5"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200">Total Distance</h3>
                <div className="flex items-baseline space-x-2">
                  <p className="text-4xl font-bold text-emerald-400">
                    <CountUp start={0} end={1432} duration={2.75} separator="," />
                  </p>
                  <span className="text-sm text-slate-400">km</span>
                </div>
              </div>
            </div>
            <div className="mt-4 h-1 bg-slate-700/50 rounded-full overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 w-[92%]"></div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-blue-900 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 shadow-lg shadow-blue-500/5"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-200">Fuel Efficiency</h3>
                <div className="flex items-baseline space-x-2">
                  <p className="text-4xl font-bold text-purple-400">87</p>
                  <span className="text-sm text-slate-400">%</span>
                </div>
              </div>
            </div>
            <div className="mt-4 h-1 bg-slate-700/50 rounded-full overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-400 w-[87%]"></div>
            </div>
          </motion.div>
        </div>

        {/* Weekly Performance Chart */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-blue-900 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 shadow-lg shadow-blue-500/5"
        >
          <h3 className="text-xl font-semibold text-slate-100 mb-6 flex items-center">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            Weekly Performance
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#e2e8f0'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ fill: '#38bdf8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
