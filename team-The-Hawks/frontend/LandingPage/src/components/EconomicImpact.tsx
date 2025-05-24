import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Lock, Globe, DollarSign, ChevronRight } from 'lucide-react';

const stats = [
  { 
    label: "API Usage Growth", 
    value: 340, 
    suffix: "%", 
    icon: TrendingUp,
    color: "from-green-400 to-emerald-500"
  },
  { 
    label: "Revenue Impact", 
    value: 2.8, 
    suffix: "B", 
    prefix: "$", 
    icon: DollarSign,
    color: "from-blue-400 to-cyan-500"
  },
  { 
    label: "Platform Lock-in", 
    value: 85, 
    suffix: "%", 
    icon: Lock,
    color: "from-purple-400 to-violet-500"
  },
  { 
    label: "Network Effects", 
    value: 156, 
    suffix: "%", 
    icon: Globe,
    color: "from-orange-400 to-red-500"
  }
];

const AnimatedCounter = ({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (count < value) {
        setCount(count + (value / 100));
      }
    }, 20);
    return () => clearTimeout(timer);
  }, [count, value]);

  return (
    <span>
      {prefix}{Math.floor(count * 100) / 100}{suffix}
    </span>
  );
};

const EconomicImpact = () => {
  return (
    <section id="impact" className="py-20 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-6">
          Economic Impact
        </h2>
        {/* <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Transforming HERE's market position through intelligent ecosystem integration and data monetization
        </p> */}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.5)" }}
              className="transition-all duration-300"
            >
              <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 text-center hover:border-white/40 transition-all duration-300 h-full shadow-lg">
                <CardHeader className="pb-2">
                  <motion.div 
                    className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${stat.color} p-3`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IconComponent className="h-6 w-6 text-white" />
                  </motion.div>
                  <CardTitle className="text-gray-300 text-lg font-medium leading-tight">
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    <AnimatedCounter 
                      value={stat.value} 
                      suffix={stat.suffix}
                      prefix={stat.prefix}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        whileHover={{ boxShadow: "0 20px 40px -20px rgba(0, 0, 0, 0.3)" }}
        className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/10 transition-all duration-300"
      >
        <h3 className="text-3xl font-bold text-white mb-8 text-center">
          Strategic Value Proposition
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            className="text-center group"
            whileHover={{ y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 p-4 group-hover:scale-110 transition-transform duration-300"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <TrendingUp className="h-8 w-8 text-white" />
            </motion.div>
            <h4 className="text-xl font-semibold text-white mb-3">Exponential Growth</h4>
            <p className="text-gray-300 leading-relaxed">API usage scales exponentially with business ecosystem expansion, creating compound revenue growth</p>
          </motion.div>
          <motion.div 
            className="text-center group"
            whileHover={{ y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-purple-400 to-violet-500 p-4 group-hover:scale-110 transition-transform duration-300"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Lock className="h-8 w-8 text-white" />
            </motion.div>
            <h4 className="text-xl font-semibold text-white mb-3">Platform Lock-in</h4>
            <p className="text-gray-300 leading-relaxed">Deep integration creates significant switching barriers, ensuring long-term customer retention</p>
          </motion.div>
          <motion.div 
            className="text-center group"
            whileHover={{ y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-500 p-4 group-hover:scale-110 transition-transform duration-300"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Globe className="h-8 w-8 text-white" />
            </motion.div>
            <h4 className="text-xl font-semibold text-white mb-3">Network Effects</h4>
            <p className="text-gray-300 leading-relaxed">Platform value increases exponentially with each new participant, creating a self-reinforcing ecosystem</p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default EconomicImpact;
