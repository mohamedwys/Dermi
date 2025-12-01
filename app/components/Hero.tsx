import { Form } from "@remix-run/react";
import { useState } from 'react';
import { Sparkles, Zap, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { SplineScene } from "./../components/ui/splite";
import { Card } from "./../components/ui/card";
import { Spotlight } from "./../components/ui/spotlight";

export function Hero() {
  const [] = useState<string | null>(null);

  return (
    <Card className="w-full min-h-screen lg:h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden border-0">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      
      {/* Spotlight effects */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="orange"
        size={300}
      />
      <Spotlight
        className="top-20 right-0 md:right-40"
        fill="purple"
        size={250}
      />
      
      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
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
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl"
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
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex flex-col lg:flex-row items-center justify-between h-full gap-12 lg:gap-8 py-12 lg:py-0">
          
          {/* Left content */}
          <motion.div 
            className="flex-1 flex flex-col justify-center max-w-2xl text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-purple-300 mb-6 mx-auto lg:mx-0 w-fit"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>Powered by Advanced AI</span>
            </motion.div>

            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
                Transform
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
                Shopify Conversations
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              AI-powered chat that converts visitors into customers. Instant answers, personalized recommendations, and 24/7 support for your Shopify store.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mb-10 justify-center lg:justify-start">
              {[
                { icon: Zap, text: "Instant Setup" },
                { icon: ShoppingBag, text: "Boost Sales" },
                { icon: Sparkles, text: "Smart AI" }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-gray-300"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                >
                  <feature.icon className="w-4 h-4 text-purple-400" />
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hero-cta-container">
            <Form method="post" action="/auth/login" className="hero-form">
              <div className="hero-input-group">
                <input
                  type="text"
                  name="shop"
                  placeholder="your-store.myshopify.com"
                  className="hero-input"
                  required
                />
                <button type="submit" className="hero-button-primary">
                  <span>Start Free Trial</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 10h12m0 0l-4-4m4 4l-4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </Form>
          </div>

            {/* Social proof */}
            <motion.div
              className="mt-10 flex items-center gap-4 justify-center lg:justify-start text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-slate-900"
                  />
                ))}
              </div>
              <div>
                <p className="font-semibold text-white">5,000+ stores</p>
                <p>already converting better</p>
              </div>
            </motion.div>
          </motion.div>

         <motion.div 
            className="flex-1 w-full max-w-2xl h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[700px] flex items-end lg:items-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative w-full h-full">
              {/* Glow effect behind 3D scene */}
              <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-3xl blur-3xl">                  </div> 
              <div className="absolute bottom-0 left-0 right-0 h-full">
                <SplineScene 
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="w-full h-full relative z-10"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
    </Card>
  );
}