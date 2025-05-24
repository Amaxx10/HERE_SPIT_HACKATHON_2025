import React from 'react';
import { motion } from 'framer-motion';

const Support = () => {
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
            Support Center
            <span className="block text-lg font-normal text-blue-800 mt-2">
              Get help and resources
            </span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-blue-900 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 shadow-lg shadow-blue-500/5"
          >
            <h2 className="text-2xl font-semibold text-slate-100 mb-6 flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Contact Support
            </h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 placeholder-slate-500 transition-all duration-200"
                  placeholder="How can we help you?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-200 placeholder-slate-500 transition-all duration-200"
                  rows="4"
                  placeholder="Describe your issue..."
                ></textarea>
              </div>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200"
              >
                Submit Request
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-blue-900 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 shadow-lg shadow-blue-500/5"
          >
            <h2 className="text-2xl font-semibold text-slate-200 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              FAQ
            </h2>
            <div className="space-y-6">
              <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-700/50 hover:border-teal-500/50 transition-all duration-300">
                <h3 className="text-md font-medium text-slate-200">How do I integrate the API?</h3>
                <p className="text-slate-400 mt-2">Check our comprehensive documentation for detailed integration guides and code samples.</p>
              </div>
              <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-700/50 hover:border-teal-500/50 transition-all duration-300">
                <h3 className="text-md font-medium text-slate-200">What are the pricing plans?</h3>
                <p className="text-slate-400 mt-2">We offer flexible pricing based on usage. Contact our sales team for custom quotes tailored to your needs.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Support;
