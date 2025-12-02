"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Carousel, Card } from "./../components/ui/apple-cards-carrousel";

export function AIAssistants() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-white"></div>
      
      {/* Animated background elements */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-40 right-10 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl"
        animate={{
          y: [0, -30, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 left-1/2 w-96 h-96 bg-orange-300/30 rounded-full blur-3xl"
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
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
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">22 Specialized AI Assistants</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="text-gray-900">Your Personal Shopping Expert</span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              For Every Niche
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Choose from our diverse collection of AI specialists, each trained to understand your unique needs and deliver personalized recommendations in their domain
          </p>
        </motion.div>

        {/* Carousel */}
        <Carousel items={cards} />
      </div>
    </section>
  );
}

const AssistantContent = ({ description }: { description: string }) => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 md:p-14 rounded-3xl mb-4">
      <p className="text-gray-700 text-base md:text-2xl font-sans max-w-3xl mx-auto">
        {description}
      </p>
    </div>
  );
};

const data = [
  {
    category: "General",
    title: "Standard Assistant",
    src: "https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Your versatile shopping companion ready to help with any inquiry. Provides expert guidance across all product categories with personalized recommendations." />
    ),
  },
  {
    category: "Beauty & Skincare",
    title: "Skin Expert",
    src: "https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Specialized in skincare analysis and personalized routines. Recommends products based on skin type, concerns, and goals for optimal results." />
    ),
  },
  {
    category: "Customer Service",
    title: "Enthusiastic Assistant",
    src: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Brings energy and excitement to every interaction. Creates memorable shopping experiences with passion and dedication to customer satisfaction." />
    ),
  },
  {
    category: "Beauty & Cosmetics",
    title: "Beauty & Cosmetics Specialist",
    src: "https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Expert in makeup, skincare, and beauty trends. Helps you discover products that enhance your natural beauty and match your style perfectly." />
    ),
  },
  {
    category: "Fashion & Apparel",
    title: "Fashion Stylist",
    src: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Your personal fashion consultant with trend expertise. Curates outfits that reflect your style and keeps you ahead of fashion curves." />
    ),
  },
  {
    category: "Fitness & Sportswear",
    title: "Fitness & Sportswear Guide",
    src: "https://images.pexels.com/photos/3757376/pexels-photo-3757376.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Specialized in athletic wear and fitness gear. Recommends performance apparel and equipment to support your active lifestyle goals." />
    ),
  },
  {
    category: "Jewelry & Accessories",
    title: "Jewelry Consultant",
    src: "https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Expert in fine jewelry and accessories. Helps you find the perfect pieces to complement any outfit or celebrate special moments." />
    ),
  },
  {
    category: "Home Decor",
    title: "Home Decor Specialist",
    src: "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Transforms houses into homes with expert design advice. Curates decor items that match your aesthetic and create beautiful spaces." />
    ),
  },
  {
    category: "Kitchen & Cookware",
    title: "Kitchen Expert",
    src: "https://images.pexels.com/photos/4099235/pexels-photo-4099235.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Guides you through kitchen essentials and cooking tools. Recommends quality cookware and gadgets to elevate your culinary experience." />
    ),
  },
  {
    category: "Baby & Maternity",
    title: "Baby & Maternity Advisor",
    src: "https://images.pexels.com/photos/1556691/pexels-photo-1556691.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Specialized in baby care and maternity needs. Provides expert guidance on safe, quality products for expecting parents and little ones." />
    ),
  },
  {
    category: "Pet Products",
    title: "Pet Care Specialist",
    src: "https://images.pexels.com/photos/4587998/pexels-photo-4587998.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Dedicated to your pet's happiness and health. Recommends quality pet products, food, and accessories for all types of furry friends." />
    ),
  },
  {
    category: "Tech & Electronics",
    title: "Tech Guru",
    src: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Your technology advisor for gadgets and electronics. Breaks down complex tech specs into simple recommendations tailored to your needs." />
    ),
  },
  {
    category: "Health Supplements",
    title: "Wellness Advisor",
    src: "https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Expert in health supplements and wellness products. Guides you toward products that support your health goals and lifestyle." />
    ),
  },
  {
    category: "Eco & Sustainable",
    title: "Sustainability Expert",
    src: "https://images.pexels.com/photos/3738387/pexels-photo-3738387.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Champions eco-friendly and sustainable shopping. Helps you make environmentally conscious choices without compromising quality or style." />
    ),
  },
  {
    category: "Automotive",
    title: "Automotive Specialist",
    src: "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Expert in car accessories and automotive products. Recommends quality parts, tools, and accessories for vehicle maintenance and enhancement." />
    ),
  },
  {
    category: "Outdoor & Camping",
    title: "Outdoor Adventure Guide",
    src: "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Specialized in outdoor gear and camping equipment. Helps adventurers find reliable products for unforgettable outdoor experiences." />
    ),
  },
  {
    category: "Gaming & Hobbies",
    title: "Gaming Enthusiast",
    src: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Expert in gaming gear and hobby supplies. Recommends products that enhance your gaming experience and creative pursuits." />
    ),
  },
  {
    category: "Books & Education",
    title: "Literary Advisor",
    src: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Guides readers through books and educational materials. Curates recommendations based on interests, learning goals, and reading preferences." />
    ),
  },
  {
    category: "Food & Beverages",
    title: "Culinary Specialist",
    src: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Expert in gourmet foods and specialty beverages. Helps food enthusiasts discover quality ingredients and unique culinary products." />
    ),
  },
  {
    category: "Gardening & Plants",
    title: "Garden Expert",
    src: "https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Specialized in plants and gardening supplies. Provides guidance on plant care and recommends tools to create thriving gardens." />
    ),
  },
  {
    category: "Arts & Crafts",
    title: "Creative Advisor",
    src: "https://images.pexels.com/photos/1053687/pexels-photo-1053687.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Expert in art supplies and crafting materials. Helps artists and crafters find quality tools and materials for creative projects." />
    ),
  },
  {
    category: "Wedding & Events",
    title: "Event Planning Specialist",
    src: "https://images.pexels.com/photos/265705/pexels-photo-265705.jpeg?auto=compress&cs=tinysrgb&w=800",
    content: (
      <AssistantContent description="Specialized in wedding and event supplies. Curates products to make your special occasions memorable and perfectly coordinated." />
    ),
  },
];