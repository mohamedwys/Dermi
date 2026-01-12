'use client'
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap, MessageSquare, Shield, Clock, Code } from 'lucide-react';

interface StatItemProps {
  end: number;
  suffix?: string;
  prefix?: string;
  label: string;
  duration?: number;
  icon: React.ElementType;
}

function StatItem({ end, suffix = '', prefix = '', label, duration = 2000, icon: Icon }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuad = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOutQuad * end));

      if (now < endTime) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCount);
  }, [isVisible, end, duration]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center group"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/50 group-hover:shadow-purple-500/70 group-hover:scale-110 transition-all duration-300">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
        {prefix}{count}{suffix}
      </div>
      <div className="text-lg text-gray-600 font-medium">{label}</div>
    </motion.div>
  );
}

export function Stats() {
  return (
    <section className="pt-8 pb-16 bg-gradient-to-br from-slate-50 via-white to-purple-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Animated background elements */}
      <motion.div
        className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-purple-700 font-semibold">Proven Results</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                Results That Speak
              </span>
              <br />
              <span className="text-gray-900">for Themselves</span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join hundreds of successful Shopify merchants growing their business with AI-powered conversations
            </p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-16">
            <StatItem end={5} suffix="+" label="Active Merchants" icon={Users} duration={2000} />
            <StatItem end={98} suffix="%" label="Satisfaction Rate" icon={TrendingUp} duration={2000} />
            <StatItem end={250} suffix="%" label="Conversion Lift" icon={Zap} duration={2000} />
            <StatItem end={1} suffix="M+" label="Conversations" icon={MessageSquare} duration={2000} />
          </div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Shield,
                title: "30-Day",
                subtitle: "Money-Back Guarantee",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: Clock,
                title: "3 Min",
                subtitle: "Setup Time",
                gradient: "from-pink-500 to-orange-500",
              },
              {
                icon: Code,
                title: "Zero",
                subtitle: "Coding Required",
                gradient: "from-orange-500 to-purple-500",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                
                {/* Card */}
                <div className="relative flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  
                  {/* Icon */}
                  <div
                    className={`flex items-center justify-center w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl shadow-lg`}
                  >
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
          
                  {/* Texts */}
                  <div>
                    <div className="text-xl font-bold text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-600">{item.subtitle}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}