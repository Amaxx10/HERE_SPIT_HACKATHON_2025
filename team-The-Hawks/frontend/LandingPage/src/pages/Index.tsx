
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FeaturesGrid from '@/components/FeaturesGrid';
import HereApiBanner from '@/components/HereApiBanner';
import AiCapabilities from '@/components/AiCapabilities';
import DemoShowcase from '@/components/DemoShowcase';
import EconomicImpact from '@/components/EconomicImpact';
import FinalCta from '@/components/FinalCta';
import Footer from '@/components/Footer';

const Index = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Calculate background gradient opacity based on scroll
  const gradientIntensity = Math.min(scrollY / 1000, 0.5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 text-white overflow-x-hidden transition-colors duration-300">
      <div 
        className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse at top, rgba(59, 130, 246, ${0.05 + gradientIntensity}), transparent 50%)`
        }}
      />
      <Header />
      <div className="pt-20 relative z-10">
        <Hero />
        <FeaturesGrid />
        <AiCapabilities />
        <DemoShowcase />
        <EconomicImpact />
        <FinalCta />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
