
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, TrendingUp, Target, Network, BarChart3, Cpu, Layers, Database, LineChart } from 'lucide-react';

const AiCapabilities = () => {
  return (
    <section id="ai-capabilities" className="py-20 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
          Advanced AI Capabilities
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Cutting-edge artificial intelligence that transforms how businesses understand and interact with location data
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.03 }}
          className="transition-all duration-300"
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/20 h-full hover:border-purple-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3 mb-4">
                <motion.div 
                  className="p-3 bg-purple-500/10 rounded-xl"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Brain className="h-8 w-8 text-purple-400" />
                </motion.div>
                <CardTitle className="text-2xl text-purple-300">
                  Predictive Commerce Engine
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <motion.div 
                  className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/5 hover:border-purple-500/30"
                  whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.07)" }}
                  transition={{ duration: 0.2 }}
                >
                  <TrendingUp className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium mb-1">Demand Forecasting</h4>
                    <p className="text-gray-300 text-sm">AI-powered prediction of consumer behavior patterns and market demand fluctuations</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/5 hover:border-purple-500/30"
                  whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.07)" }}
                  transition={{ duration: 0.2 }}
                >
                  <Target className="h-5 w-5 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium mb-1">Personalization Engine</h4>
                    <p className="text-gray-300 text-sm">Real-time customer journey optimization based on location and behavioral data</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/5 hover:border-purple-500/30"
                  whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.07)" }}
                  transition={{ duration: 0.2 }}
                >
                  <Database className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium mb-1">Market Intelligence</h4>
                    <p className="text-gray-300 text-sm">Advanced analytics for competitive positioning and market opportunity identification</p>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.03 }}
          className="transition-all duration-300"
        >
          <Card className="bg-gradient-to-br from-cyan-500/10 to-green-500/10 backdrop-blur-sm border border-cyan-500/20 h-full hover:border-cyan-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3 mb-4">
                <motion.div 
                  className="p-3 bg-cyan-500/10 rounded-xl"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Cpu className="h-8 w-8 text-cyan-400" />
                </motion.div>
                <CardTitle className="text-2xl text-cyan-300">
                  Dynamic Optimization Systems
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <motion.div 
                  className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/5 hover:border-cyan-500/30"
                  whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.07)" }}
                  transition={{ duration: 0.2 }}
                >
                  <Network className="h-5 w-5 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium mb-1">Intelligent Routing</h4>
                    <p className="text-gray-300 text-sm">Self-optimizing logistics networks that adapt to real-time traffic and demand patterns</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/5 hover:border-cyan-500/30"
                  whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.07)" }}
                  transition={{ duration: 0.2 }}
                >
                  <Layers className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium mb-1">Resource Allocation</h4>
                    <p className="text-gray-300 text-sm">AI-driven distribution of resources across multiple locations for maximum efficiency</p>
                  </div>
                </motion.div>
                <motion.div 
                  className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/5 hover:border-cyan-500/30"
                  whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.07)" }}
                  transition={{ duration: 0.2 }}
                >
                  <LineChart className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-medium mb-1">Performance Monitoring</h4>
                    <p className="text-gray-300 text-sm">Continuous system optimization with predictive maintenance and anomaly detection</p>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default AiCapabilities;
