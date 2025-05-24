
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Brain, Truck, Sparkles, BarChart3, Globe } from 'lucide-react';

const features = [
  {
    title: "Predictive Consumer Flow Intelligence",
    icon: <Brain className="h-8 w-8 text-cyan-400" />,
    features: [
      "Real-time foot traffic prediction",
      "Consumer behavior pattern analysis",
      "Demand forecasting with 95% accuracy",
      "Dynamic pricing optimization"
    ]
  },
  {
    title: "Hyper-Intelligent Logistics Network",
    icon: <Truck className="h-8 w-8 text-blue-400" />,
    features: [
      "AI-powered route optimization",
      "Predictive inventory management",
      "Real-time delivery tracking",
      "Autonomous fleet coordination"
    ]
  },
  {
    title: "Augmented Commerce Experience",
    icon: <Sparkles className="h-8 w-8 text-purple-400" />,
    features: [
      "AR-enhanced shopping experiences",
      "Personalized location-based offers",
      "Smart store navigation",
      "Virtual product placement"
    ]
  },
  {
    title: "Business Intelligence & Optimization",
    icon: <BarChart3 className="h-8 w-8 text-green-400" />,
    features: [
      "Advanced analytics dashboard",
      "Performance metric tracking",
      "Competitor analysis insights",
      "Revenue optimization strategies"
    ]
  },
  {
    title: "Hyperlocal Marketplace Evolution",
    icon: <Globe className="h-8 w-8 text-orange-400" />,
    features: [
      "Dynamic marketplace creation",
      "Local vendor integration",
      "Community-driven commerce",
      "Micro-location targeting"
    ]
  }
];

const FeaturesGrid = () => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  return (
    <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6">
          Revolutionary AI Modules
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Five interconnected systems that transform how businesses understand and interact with their local ecosystems
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -10, boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.5)" }}
            className="transition-all duration-300"
          >
            <Card 
              className="bg-white/5 backdrop-blur-sm border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 cursor-pointer h-full"
              onClick={() => setExpandedCard(expandedCard === index ? null : index)}
            >
              <CardHeader>
                <motion.div 
                  className="mb-4 flex justify-center"
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {feature.icon}
                </motion.div>
                <CardTitle className="text-cyan-300 text-xl">
                  {feature.title}
                </CardTitle>
                <motion.div 
                  className="flex justify-center mt-2"
                  whileHover={{ y: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  {expandedCard === index ? 
                    <ChevronUp className="h-5 w-5 text-cyan-400" /> : 
                    <ChevronDown className="h-5 w-5 text-cyan-400" />
                  }
                </motion.div>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={false}
                  animate={{ 
                    height: expandedCard === index ? "auto" : 0,
                    opacity: expandedCard === index ? 1 : 0 
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <ul className="space-y-2">
                    {feature.features.map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="text-gray-300 flex items-center"
                      >
                        <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></span>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesGrid;
