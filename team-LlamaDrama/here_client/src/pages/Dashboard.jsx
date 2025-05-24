import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';

const data = [
  { name: 'Mon', value: 87 },
  { name: 'Tue', value: 92 },
  { name: 'Wed', value: 88 },
  { name: 'Thu', value: 95 },
  { name: 'Fri', value: 89 },
  { name: 'Sat', value: 82 },
  { name: 'Sun', value: 91 }
];

const Dashboard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-blue-900 to-slate-900 p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-blue-400/10 blur-3xl rounded-full"></div>
          <h1 className="relative text-5xl font-bold text-slate-100 mb-2">
            Fleet Dashboard
            <span className="block text-lg font-normal text-blue-300/80 mt-2">
              Real-time monitoring and analytics
            </span>
          </h1>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Replace existing cards with enhanced versions */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-slate-800/40 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 shadow-lg shadow-blue-500/5"
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
            className="bg-slate-800/40 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 shadow-lg shadow-blue-500/5"
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
            className="bg-slate-800/40 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 shadow-lg shadow-blue-500/5"
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
          className="bg-slate-800/40 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 shadow-lg shadow-blue-500/5"
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
