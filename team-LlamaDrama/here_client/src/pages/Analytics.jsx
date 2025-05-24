import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const pieData = [
  { name: 'On Time', value: 85 },
  { name: 'Delayed', value: 10 },
  { name: 'Cancelled', value: 5 },
];

const COLORS = ['#38bdf8', '#fb923c', '#f87171'];

const Analytics = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-blue-900 to-slate-900 p-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-blue-400/10 blur-3xl rounded-full"></div>
          <h1 className="relative text-5xl font-bold text-blue-900 mb-2">
            Route Analytics
            <span className="block text-lg font-normal text-blue-600/80 mt-2">
              Performance insights and metrics
            </span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-blue-900 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 shadow-lg shadow-blue-500/5"
          >
            <h2 className="text-2xl font-semibold text-slate-100 mb-8 flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Performance Metrics
            </h2>
            <div className="space-y-8">
              <div className="relative">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-white">Route Efficiency</span>
                  <span className="text-sm font-semibold text-white">85%</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-400 w-[85%] transition-all duration-500"></div>
                </div>
                <div className="absolute -right-2 top-0 w-4 h-4 bg-emerald-400 rounded-full transform -translate-y-1/2 glow-effect"></div>
              </div>

              <div className="relative">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-white">On-Time Delivery</span>
                  <span className="text-sm font-semibold text-white">92%</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-400 w-[92%] transition-all duration-500"></div>
                </div>
                <div className="absolute -right-2 top-0 w-4 h-4 bg-blue-400 rounded-full transform -translate-y-1/2 glow-effect"></div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-blue-900 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 shadow-lg shadow-blue-500/5"
          >
            <h2 className="text-2xl font-semibold text-white mb-6">Delivery Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                <div className="text-sm text-white mb-1">Total Deliveries</div>
                <div className="text-2xl font-bold text-blue-400">2,547</div>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                <div className="text-sm text-white mb-1">Success Rate</div>
                <div className="text-2xl font-bold text-emerald-400">98.3%</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Pie Chart Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-900 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 shadow-lg shadow-blue-500/5"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Delivery Status Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
      <style jsx>{`
        .glow-effect {
          box-shadow: 0 0 15px currentColor;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </motion.div>
  );
};

export default Analytics;
