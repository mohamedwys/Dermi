import { FileText, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function TermsOfService() {
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
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Terms of Service
              </h1>
              <p className="text-slate-600 mt-1">Last updated: October 2025</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms of Service ("Terms") govern your access to and use of ShopiBot, a Shopify chatbot application operated by <strong>Welcome Middle East FZ-LLC</strong> ("ShopiBot," "we," "us," or "our").
                By installing or using ShopiBot, you ("Merchant," "you") agree to be legally bound by these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Eligibility</h2>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>You must be at least 18 years old and a valid Shopify merchant.</li>
                <li>By installing ShopiBot, you confirm that you have the legal authority to bind your business to these Terms and that your use complies with all applicable laws.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Services</h2>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>ShopiBot provides AI-powered chatbot functionality, including photo/image analysis and personalized recommendations for your Shopify store.</li>
                <li>We aim to provide reliable, secure, and continuous service but do not guarantee uninterrupted or error-free operation.</li>
                <li>We may improve, modify, or remove features to enhance functionality or comply with legal and technical standards.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Account & Payments</h2>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Fees for ShopiBot are billed through Shopify's billing system.</li>
                <li>Payment processing is securely handled by Stripe, Inc., subject to its own Terms of Service and Privacy Policy.</li>
                <li>Fees are non-refundable unless required by law.</li>
                <li>You remain responsible for maintaining an active Shopify account to use ShopiBot.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Data Processing & Privacy</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                ShopiBot processes the following types of data to provide its Services:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Chat conversations and messages</li>
                <li>Customer emails (when voluntarily provided)</li>
                <li>Photo/Image analysis results (original images are processed temporarily and auto-deleted)</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                All data is stored in the merchant's Shopify database and temporarily processed via Prisma on Fly.io servers.
              </p>
              <p className="text-slate-700 leading-relaxed mt-4">
                ShopiBot acts as a Data Processor, and you (the Merchant) act as the Data Controller under GDPR.
              </p>
              <p className="text-slate-700 leading-relaxed mt-4">
                Please review our <Link to="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link> for full details on data collection, storage, and retention.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Acceptable Use</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                You agree not to use ShopiBot to:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Violate any applicable law or regulation, including GDPR, CCPA, or UAE PDPL.</li>
                <li>Send spam, collect unauthorized personal data, or misuse customer information.</li>
                <li>Upload, share, or process illegal, discriminatory, or harmful content through the chatbot.</li>
                <li>Interfere with, disrupt, or attempt to compromise ShopiBot's systems or infrastructure.</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                Violations may result in immediate suspension or termination of your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Intellectual Property</h2>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>All intellectual property rights in ShopiBot — including its code, AI models, user interface, design, and branding — belong exclusively to Welcome Middle East FZ-LLC.</li>
                <li>You are granted a limited, non-exclusive, non-transferable, revocable license to use ShopiBot for your Shopify store.</li>
                <li>You may not copy, modify, reverse engineer, or redistribute any part of ShopiBot without our written consent.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Third-Party Services</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                ShopiBot integrates with secure third-party services to deliver functionality:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li><strong>Shopify Inc.</strong> – platform integration and data storage</li>
                <li><strong>Stripe Inc.</strong> – secure billing and payment processing</li>
                <li><strong>Fly.io</strong> – application hosting</li>
                <li><strong>Prisma ORM</strong> – temporary structured data management</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                We are not responsible for errors, downtimes, or breaches arising from third-party service providers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                ShopiBot is provided "as is" and "as available."
                We make no warranties, express or implied, regarding performance, reliability, or suitability for a particular purpose.
                We do not guarantee that the chatbot's analysis or recommendations are free of errors, nor that services will meet every business requirement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>ShopiBot and Welcome Middle East FZ-LLC shall not be liable for indirect, incidental, special, or consequential damages, including loss of data, profits, or business opportunities.</li>
                <li>Our total liability shall not exceed the amount you paid for ShopiBot in the three (3) months preceding the claim.</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                Some jurisdictions do not allow certain limitations, so these provisions may not apply to you in full.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Termination</h2>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>You may uninstall ShopiBot at any time via your Shopify admin panel.</li>
                <li>We may suspend or terminate your access if:
                  <ul className="list-circle list-inside ml-6 mt-2 space-y-1">
                    <li>You breach these Terms.</li>
                    <li>You misuse or abuse the Service.</li>
                    <li>Continued operation becomes commercially or legally unfeasible.</li>
                  </ul>
                </li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                Upon termination, all temporary processing stops immediately, and your Shopify data remains under your control.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. International Compliance</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                ShopiBot complies with relevant data protection and AI governance laws, including:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li><strong>GDPR</strong> – for users in the EEA/UK</li>
                <li><strong>CCPA/CPRA</strong> – for California residents</li>
                <li><strong>Federal Decree-Law No. 45 of 2021 (PDPL)</strong> – for UAE users</li>
                <li><strong>EU AI Act (2025)</strong> – for AI system transparency and fairness</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Governing Law & Dispute Resolution</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms are governed by the laws of the United Arab Emirates.
                Any dispute arising from or relating to these Terms shall be subject to the exclusive jurisdiction of the courts of Dubai, UAE.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Changes to These Terms</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may update or amend these Terms from time to time to reflect changes in technology, law, or business operations.
                Continued use of ShopiBot after updates constitutes your acceptance of the revised Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">14. Contact</h2>
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
