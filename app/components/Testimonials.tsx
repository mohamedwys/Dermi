'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

type Testimonial = {
  image: string;
  audio?: string;
  text: string;
  name: string;
  jobtitle: string;
  rating?: number;
  metric?: string;
};

type ComponentProps = {
  testimonials: Testimonial[];
};

export const Testimonials: React.FC<ComponentProps> = ({ testimonials }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [hasBeenHovered, setHasBeenHovered] = useState<boolean[]>(new Array(testimonials.length).fill(false));
  const [typedText, setTypedText] = useState('');
  const typewriterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopAudio = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current.src = '';
      audioPlayerRef.current.load();
      audioPlayerRef.current = null;
    }
  }, []);

  const startTypewriter = useCallback((text: string) => {
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
    }
    setTypedText('');
    
    let i = 0;
    const type = () => {
      if (i <= text.length) {
        setTypedText(text.slice(0, i));
        i++;
        typewriterTimeoutRef.current = setTimeout(type, 30);
      }
    };
    type();
  }, []);

  const stopTypewriter = useCallback(() => {
    if (typewriterTimeoutRef.current) {
      clearTimeout(typewriterTimeoutRef.current);
      typewriterTimeoutRef.current = null;
    }
    setTypedText('');
  }, []);

  const handleMouseEnter = useCallback((index: number) => {
    stopAudio();
    setHoveredIndex(index);
    
    if (testimonials[index].audio) {
      const newAudio = new Audio(`/audio/${testimonials[index].audio}`);
      audioPlayerRef.current = newAudio;
      newAudio.play().catch(e => {
        console.warn("Audio playback prevented or failed:", e);
      });
    }
    
    setHasBeenHovered(prev => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
    
    startTypewriter(testimonials[index].text);
  }, [testimonials, stopAudio, startTypewriter]);

  const handleMouseLeave = useCallback(() => {
    stopAudio();
    setHoveredIndex(null);
    stopTypewriter();
  }, [stopAudio, stopTypewriter]);

  useEffect(() => {
    return () => {
      stopAudio();
      stopTypewriter();
    };
  }, [stopAudio, stopTypewriter]);

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Subtle background elements */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-purple-900">Rated 4.9/5 by Merchants</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gray-900">Loved by Merchants</span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what successful store owners have to say
          </p>
        </motion.div>

        {/* Interactive Avatars */}
        <div className="flex justify-center items-center gap-6 flex-wrap mb-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="relative flex flex-col items-center cursor-pointer"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-20 h-20 rounded-full object-cover border-4 transition-all duration-300"
                  animate={{
                    borderColor: (hoveredIndex === index || hasBeenHovered[index]) 
                      ? 'rgb(168, 85, 247)' 
                      : 'rgb(229, 231, 235)'
                  }}
                />
                {(hoveredIndex === index || hasBeenHovered[index]) && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Star className="w-3 h-3 text-white fill-white" />
                  </motion.div>
                )}
              </motion.div>

              {/* Hover Bubble */}
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: -10 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="absolute bottom-24 bg-white text-gray-800 px-6 py-4 rounded-2xl shadow-2xl max-w-sm w-80 border border-gray-100"
                    style={{ zIndex: 50 }}
                  >
                    <Quote className="w-6 h-6 text-purple-400 mb-2" />
                    <div className="min-h-[6rem] mb-3">
                      <p className="text-sm leading-relaxed">
                        {typedText}
                        <span className="inline-block w-0.5 h-4 bg-purple-600 ml-1 animate-pulse"></span>
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <p className="font-bold text-gray-900">{testimonial.name}</p>
                        <p className="text-xs text-gray-500">{testimonial.jobtitle}</p>
                      </div>
                      {testimonial.rating && (
                        <div className="flex gap-0.5">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      )}
                    </div>

                    {testimonial.metric && (
                      <div className="mt-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-xs font-semibold text-purple-700 inline-block">
                        {testimonial.metric}
                      </div>
                    )}

                    {/* Speech bubble tail */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-2">
                      <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="flex -space-x-2">
              {testimonials.slice(0, 5).map((t, i) => (
                <img
                  key={i}
                  src={t.image}
                  alt=""
                  className="w-10 h-10 rounded-full ring-2 ring-white object-cover"
                />
              ))}
            </div>
            <div className="text-left">
              <p className="text-gray-900 font-bold">Join 500+ happy merchants</p>
              <p className="text-sm text-gray-600">and start growing today</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
