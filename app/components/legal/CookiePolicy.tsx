// CookiePolicy.tsx - Add your code here
import { Cookie, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link to="/">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors inline-flex"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </motion.div>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Cookie className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Cookie Policy
              </h1>
              <p className="text-slate-600 mt-1">How ShopiBot uses essential cookies to enhance your chat experience</p>
              <p className="text-slate-500 text-sm mt-1">Last updated: October 2025</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Our Use of Cookies</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                At ShopiBot, we use only essential cookies to ensure the chatbot functions properly on your Shopify store.
                We keep things transparent and privacy-focused — <strong>no tracking, no advertising, and no hidden data collection.</strong>
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our cookies exist purely to make your customers' live chat experience seamless and reliable.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. What Cookies Do We Use?</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use a single essential cookie:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
                <p className="text-slate-900 font-mono text-lg font-semibold">
                  shopibot/session
                </p>
                <p className="text-slate-700 mt-2">
                  This cookie is fundamental for the correct operation of the chatbot and ensures consistent functionality across your store.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. What Does Our Cookie Do?</h2>
              <ul className="list-disc list-inside text-slate-700 space-y-3 ml-4">
                <li>
                  <strong>Functionality:</strong> Keeps the chat session active when a customer navigates between pages, so the conversation continues smoothly.
                </li>
                <li>
                  <strong>User Experience:</strong> Prevents multiple trigger messages and ensures consistent chatbot behavior across the website.
                </li>
                <li>
                  <strong>Session Management:</strong> Maintains temporary context so the chatbot can understand and respond accurately during a browsing session.
                </li>
                <li>
                  <strong>Duration:</strong> This cookie is temporary — it is automatically deleted once the chat session ends or after 24 hours, whichever comes first.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. What Do We Collect Through Cookies?</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our cookie does not collect personal data on its own.
                It only holds temporary technical information necessary for real-time chat operation, such as:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Session context (to maintain conversation flow)</li>
                <li>Dialogue continuity across store pages</li>
                <li>Technical state of the chat widget (e.g., open or minimized)</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                Any customer data (such as emails, conversation history, or photo analysis results) is stored directly within the merchant's Shopify database, <strong>not by ShopiBot</strong>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Do We Need User Consent?</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our cookie is classified as <strong>essential</strong> under global privacy laws, including:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li><strong>GDPR</strong> (EU/UK)</li>
                <li><strong>CCPA/CPRA</strong> (California)</li>
                <li><strong>PDPL</strong> (UAE)</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                Therefore, explicit consent is not required.
                However, for transparency, we recommend merchants mention ShopiBot's cookie in their own store's privacy or cookie notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Our Commitment</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <p className="text-slate-700 leading-relaxed mb-3">
                  We only use cookies when strictly necessary.
                  ShopiBot does not use cookies for:
                </p>
                <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                  <li>Behavioral tracking</li>
                  <li>Analytics or profiling</li>
                  <li>Advertising or retargeting</li>
                </ul>
                <p className="text-slate-700 leading-relaxed mt-4">
                  Your customers' privacy and data security are our top priorities.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Contact</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                For any questions regarding this Cookie Policy, please contact:
              </p>
              <div className="bg-slate-50 p-6 rounded-lg">
                <p className="text-slate-700 mb-2">
                  <strong>Welcome Middle East FZ-LLC</strong>
                </p>
                <p className="text-slate-700 mb-2">
                  📧 <a href="mailto:support@welcomeme.ae" className="text-blue-600 hover:underline">support@welcomeme.ae</a>
                </p>
                <p className="text-slate-700">
                  🏢 Dubai, United Arab Emirates
                </p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
