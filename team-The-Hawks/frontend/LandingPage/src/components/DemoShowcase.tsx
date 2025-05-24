
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const demos = [
  {
    title: "Smart Retail Analytics",
    description: "Real-time customer flow analysis and predictive shopping patterns",
    stats: { accuracy: "95%", revenue: "+34%" }
  },
  {
    title: "Dynamic Logistics Optimization", 
    description: "AI-powered route planning and fleet management system",
    stats: { efficiency: "+45%", costs: "-28%" }
  },
  {
    title: "Hyperlocal Marketplace",
    description: "Community-driven commerce with micro-location targeting",
    stats: { engagement: "+67%", conversion: "+52%" }
  },
  {
    title: "Predictive Demand Forecasting",
    description: "Machine learning models predicting consumer demand patterns",
    stats: { accuracy: "92%", waste: "-41%" }
  }
];

const DemoShowcase = () => {
  const [activeDemo, setActiveDemo] = useState(0);

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-6">
          Live Demo Showcase
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Experience the power of MetaCommerce AI through interactive demonstrations
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          {demos.map((demo, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={activeDemo === index ? "default" : "outline"}
                className={`w-full text-left p-6 h-auto ${
                  activeDemo === index 
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" 
                    : "bg-white/5 text-gray-300 border-cyan-500/20 hover:bg-white/10"
                }`}
                onClick={() => setActiveDemo(index)}
              >
                <div>
                  <h3 className="text-lg font-semibold mb-2">{demo.title}</h3>
                  <p className="text-sm opacity-90">{demo.description}</p>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          key={activeDemo}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border-cyan-500/20 h-full">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-cyan-300 mb-6">
                {demos[activeDemo].title}
              </h3>
              
              <div className="space-y-6">
                <div className="bg-white/5 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-300 mb-4">Performance Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(demos[activeDemo].stats).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-2xl font-bold text-cyan-400">{value}</div>
                        <div className="text-sm text-gray-400 capitalize">{key}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-6 h-48 flex items-center justify-center">
                  <motion.div
                    className="w-32 h-32 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoShowcase;
