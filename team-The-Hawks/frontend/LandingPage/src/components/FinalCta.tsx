
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const FinalCta = () => {
  return (
    <section className="py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 mx-6 rounded-3xl p-16 text-center relative overflow-hidden"
      >
        {/* Background Animation */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-white/20 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Transform Your Bussiness with MetaCommerce AI <Sparkles className="inline-block h-8 w-8 ml-2 text-yellow-300" />
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl text-cyan-100 mb-8 max-w-3xl mx-auto"
          >
            Join the revolution in location-intelligent business ecosystems. 
            Experience the future of commerce today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="transition-all duration-300"
          >
            <Button 
            onClick={()=>{
                window.location.href = 'http://localhost:5173/'
              }}
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-6 text-2xl rounded-full shadow-2xl hover:shadow-white/25 transition-all duration-300 font-semibold"
            >
              Request a Demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-cyan-100"
          >
            <p className="text-lg">
              Ready to revolutionize your business ecosystem? Let's talk.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default FinalCta;
