import { Shield, Lock, Globe, Award, CheckCircle, Zap } from 'lucide-react';

export function TrustSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Enterprise-Grade
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent"> Security & Compliance</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Your data security and customer privacy are our top priorities
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
            <Shield className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">GDPR Compliant</h3>
            <p className="text-slate-700 leading-relaxed">
              Full compliance with European data protection regulations. Customer data is encrypted and processed securely.
            </p>
          </div>

          <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
            <Lock className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">Compliant</h3>
            <p className="text-slate-700 leading-relaxed">
              Users have full control over their data with easy opt-out options.
            </p>
          </div>

          <div className="p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
            <Globe className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-3">Global Standards</h3>
            <p className="text-slate-700 leading-relaxed">
              SOC 2 Type II certified. ISO 27001 compliant infrastructure with 99.9% uptime guarantee.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <Award className="w-16 h-16 text-yellow-400 mb-4" />
              <h3 className="text-3xl font-bold mb-4">Powered by Shopify</h3>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                Built on Shopify's trusted infrastructure. Seamlessly integrated with your store's security protocols and data policies.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">PCI DSS Level 1</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">256-bit SSL</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">End-to-End Encryption</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Real-time Monitoring</div>
                    <div className="text-sm text-slate-300">24/7 security monitoring and threat detection</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Data Backups</div>
                    <div className="text-sm text-slate-300">Automated daily backups with instant recovery</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold mb-1">Privacy Controls</div>
                    <div className="text-sm text-slate-300">Granular permissions and data access controls</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
