
import { Bolt, BarChart3, ScanSearch, MessageSquare, Zap, TrendingUp, Shield, Clock, Sparkles } from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: MessageSquare,
    title: 'Intelligent Conversations',
    description: 'Natural language AI understands context and provides accurate, helpful responses to customer queries.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Real-time insights into customer interactions, conversion rates, and sales performance.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Bolt,
    title: '3-Minute Setup',
    description: 'Install and configure in minutes. No coding required. Start serving customers immediately.',
    color:'from-pink-500 to-purple-500',
  },
  {
    icon: Zap,
    title: 'Instant Integration',
    description: 'One-click installation with your Shopify store. No coding required. Live in under 5 minutes.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: TrendingUp,
    title: 'Boost Conversions',
    description: 'Smart product recommendations and proactive engagement increase average order value by 2.5x.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'GDPR & CCPA compliant with end-to-end encryption. Your customer data stays protected.',
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Never miss a customer. ShopiBot handles inquiries around the clock, even while you sleep.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: ScanSearch,
    title: 'Order Tracking Integration',
    description: 'Automatically handle order status queries, shipping updates, and return requests.',
    color:'from-amber-500 to-yellow-500',
  },
  {
    icon: Sparkles,
    title: 'Personalized Experience',
    description: 'Learns from every interaction to deliver tailored recommendations and support.',
    color: 'from-yellow-500 to-amber-500',
  },
];

export function Features() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-purple-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900 mb-4">
            Everything You Need to
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent"> Win Customers</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Powerful features designed to transform your Shopify store into a conversion machine
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300"
                     style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}></div>

                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6 transform transition-transform duration-300 ${hoveredIndex === index ? 'scale-110 rotate-3' : ''}`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </h3>

                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
