// PrivacyPolicy.tsx - Add your code here
import { Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function PrivacyPolicy() {
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
            <div className="p-3 bg-green-100 rounded-xl">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Privacy Policy
              </h1>
              <p className="text-slate-600 mt-1">Last updated: October 2025</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <p className="text-slate-700 leading-relaxed mb-4">
                This Privacy Policy explains how ShopiBot, a Shopify chatbot application developed by <strong>Welcome Middle East FZ-LLC</strong> ("ShopiBot", "we", "our", or "us"), collects, processes, and protects personal data when merchants ("Clients") and their customers ("End-Users") use our chatbot and related services ("Services").
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Scope</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                This Policy applies to:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Merchants who install ShopiBot on their Shopify store.</li>
                <li>End-Users (customers) who interact with the chatbot integrated on a merchant's store.</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                It does not apply to:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>The merchant's own privacy or data practices.</li>
                <li>Shopify's independent data processing activities.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Information We Process</h2>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">a. Merchant Data</h3>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>We collect basic store information through Shopify's installation API.</li>
                <li>Payment and subscription details are securely processed by Stripe.</li>
                <li>Configuration preferences and chat settings are stored via Shopify and Prisma to enable app functionality.</li>
                <li>No other merchant personal information is collected or retained by ShopiBot.</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">b. End-User Data</h3>
              <p className="text-slate-700 leading-relaxed mb-3">
                ShopiBot temporarily processes and stores limited data strictly for chatbot functionality and merchant support:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li><strong>Conversations & Messages:</strong> Stored in the merchant's Shopify database for customer service purposes.</li>
                <li><strong>Customer Emails:</strong> Collected only when provided by the user for support or personalized recommendations.</li>
                <li><strong>Photo/Image Analysis:</strong> Images uploaded for AI analysis are processed temporarily. Only extracted results (e.g., "dry skin," "normal skin," etc.) are stored. The original image is auto-deleted immediately after analysis.</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                No data is sold, shared, or used for marketing or profiling.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Data Retention</h2>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Chat data and extracted photo analysis results remain in the merchant's Shopify database until the merchant deletes them.</li>
                <li>ShopiBot does not permanently store chat history or image data on its servers.</li>
                <li>Temporary processing occurs through Fly.io and Prisma, after which all temporary data is automatically erased.</li>
                <li>Stripe may retain billing information as required by financial regulations.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Purpose of Processing</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We process data solely to:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Deliver chatbot functionality and photo analysis results.</li>
                <li>Enable merchants to receive and manage customer interactions.</li>
                <li>Provide AI-powered analysis and personalized recommendations.</li>
                <li>Process subscription payments securely via Stripe.</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                We do not use data for advertising, tracking, or resale purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Legal Basis</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                For merchants and customers in the EEA or UK, we rely on:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li><strong>Article 6(1)(b) GDPR</strong> – Processing necessary for contract performance (chat and analysis functions).</li>
                <li><strong>Article 6(1)(f) GDPR</strong> – Legitimate interest (to ensure chatbot functionality and support).</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                For California residents, ShopiBot complies with <strong>CCPA/CPRA</strong> regarding transparency, access, and deletion rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Third-Party Services (Sub-Processors)</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We work with secure, GDPR-compliant partners:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li><strong>Shopify Inc.</strong> – Merchant & customer data storage</li>
                <li><strong>Stripe Inc.</strong> – Secure payment processing</li>
                <li><strong>Fly.io</strong> – Application hosting</li>
                <li><strong>Prisma ORM</strong> – Temporary structured data management</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                All sub-processors are bound by strong confidentiality, data protection, and encryption agreements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. International Data Transfers</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Data may be processed in or transferred to countries where Shopify, Stripe, or Fly.io operate.
                These transfers comply with:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Standard Contractual Clauses (SCCs)</li>
                <li>EU-U.S. Data Privacy Framework (where applicable)</li>
                <li>CCPA/CPRA for U.S. users</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Security Measures</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We apply industry-standard safeguards, including:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>End-to-end encryption (TLS/HTTPS)</li>
                <li>Role-based access controls</li>
                <li>Regular infrastructure monitoring and audits</li>
                <li>Auto-deletion of processed images and session data</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                We do not permanently store or re-use customer chat data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Your Rights</h2>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Merchants can access, modify, or delete customer data at any time through their Shopify dashboard.</li>
                <li>End-Users should contact the merchant directly to exercise data rights (access, rectification, deletion).</li>
                <li>ShopiBot assists merchants with fulfilling such requests upon verification.</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                For any privacy-related inquiries, you may contact us at:{' '}
                <a href="mailto:privacy@welcomeme.ae" className="text-blue-600 hover:underline">
                  📧 privacy@welcomeme.ae
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Children's Privacy</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                ShopiBot is not intended for children under 16.
                We do not knowingly collect or process children's data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Business Transfers</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If ShopiBot undergoes a merger, acquisition, or sale, relevant data may be transferred in compliance with this Policy and applicable data protection laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Governing Law</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                This Policy is governed by the laws of the United Arab Emirates.
                For EU and UK users, GDPR rights apply in addition to local law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Contact Information</h2>
              <div className="bg-slate-50 p-6 rounded-lg">
                <p className="text-slate-700 mb-2">
                  <strong>Welcome Middle East FZ-LLC</strong>
                </p>
                <p className="text-slate-700 mb-2">
                  📧 <a href="mailto:privacy@welcomeme.ae" className="text-blue-600 hover:underline">privacy@welcomeme.ae</a>
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
