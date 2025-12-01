// AICompliance.tsx - Add your code here
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, FileCheck, Database, Eye, Ban } from 'lucide-react';

export function AICompliance() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Compliance Policy – ShopiBot
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              How ShopiBot ensures compliance with GDPR, UAE PDPL & EU AI Act
            </p>
            <p className="text-sm text-gray-500">Last updated: October 2025</p>
          </div>

          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              1. Understanding compliance requirements
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  GDPR (General Data Protection Regulation)
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Only minimal and necessary data is processed.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Full transparency on how AI and data are used.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Users can request access, correction, or erasure via the merchant.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>All processing is temporary, encrypted, and purpose-limited.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  UAE PDPL (Federal Decree-Law No. 45 of 2021)
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Data is processed solely for legitimate business purposes (chat support, analysis, and personalization).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>No retention beyond what's required for customer service or until the merchant deletes it.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Merchants are the primary contact for access or deletion requests.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  EU AI Act
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Clear disclosure that users are interacting with AI.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Systems designed to avoid biased or discriminatory outputs.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Transparent logic and explainable responses.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Continuous monitoring and safeguards for risk management.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="border-l-4 border-gray-300 pl-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileCheck className="w-6 h-6 text-gray-700" />
              2. Roles in data processing
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Shopify Merchants = Data Controllers
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">→</span>
                    <span>Determine the purposes and means of processing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">→</span>
                    <span>Must update their store privacy policy to reflect chatbot use.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">→</span>
                    <span>Are responsible for managing customer data access and deletion requests.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  ShopiBot = Data Processor
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">→</span>
                    <span>Processes chat-related data only to deliver automated responses and analyses.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">→</span>
                    <span>Implements technical and organizational safeguards to ensure compliance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">→</span>
                    <span>Does not retain or reuse customer information once the session or business purpose ends.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6 text-green-600" />
              3. How ShopiBot ensures compliance
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Data collection & processing
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span><strong>Minimal data</strong> — only conversations, messages, emails (if provided), and uploaded photos/images used for AI-based analysis.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span><strong>Purpose-limited</strong> — processed strictly for support, analysis, or personalized recommendations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span><strong>Transparency</strong> — users are clearly informed they are interacting with AI.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span><strong>Deletion policy</strong> — all data resides in the merchant's Shopify database or Prisma instance until the merchant deletes it.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span>No profiling or advertising use.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Security measures
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span>All data transmissions use end-to-end HTTPS encryption.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span>Hosting and processing are performed on Fly.io using industry-grade protections.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span>Payments, if any, are managed via Stripe (PCI-DSS compliant).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-1">✓</span>
                    <span>Restricted access — no human review of individual chats or photos.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="border-l-4 border-gray-300 pl-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-gray-700" />
              4. What data is processed & why
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  For Merchants (Shopify store owners)
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span><strong>Shopify account & billing info:</strong> for app installation and subscription.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span><strong>Chatbot configuration data:</strong> for personalization and analytics.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  For End Users (store customers)
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span><strong>Chat messages:</strong> analyzed to respond intelligently and contextually.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span><strong>Email (optional):</strong> used only for sending personalized guides or follow-ups.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span><strong>Uploaded photos/images:</strong> temporarily processed to extract results for photo or image analysis (e.g., AI-based suggestions).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span><strong>Conversation history:</strong> stored securely in the merchant's Shopify database or Prisma system, until the merchant chooses to delete it.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Ban className="w-6 h-6 text-red-600" />
              5. What ShopiBot does not do
            </h2>

            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-1">✗</span>
                <span>No storage of chat history on ShopiBot servers beyond processing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-1">✗</span>
                <span>No resale, advertising, or third-party sharing of data.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-1">✗</span>
                <span>No behavioral or cross-site tracking.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold mt-1">✗</span>
                <span>No analytics derived from customer behavior outside the chatbot context.</span>
              </li>
            </ul>
          </section>

          <section className="border-l-4 border-gray-300 pl-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-gray-700" />
              6. Deletion & User Rights
            </h2>

            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span><strong>End Users:</strong> may request access, correction, or deletion directly from the merchant.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span><strong>Merchants:</strong> can delete conversations, messages, and associated data at any time via their Shopify or Prisma dashboard.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>ShopiBot automatically deletes all temporary processing data once the interaction is completed or transferred to the merchant's database.</span>
              </li>
            </ul>
          </section>

          <section className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-amber-600" />
              7. Merchant reminder (for your privacy policy)
            </h2>

            <p className="text-gray-700 mb-4">
              Disclosure template for your store:
            </p>

            <div className="bg-white border-2 border-amber-300 rounded-lg p-6">
              <p className="text-gray-800 leading-relaxed mb-4">
                Our store uses <strong>ShopiBot AI</strong> to provide smart customer support and photo-based recommendations.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Conversations, messages, and images are processed only to assist you.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>No personal data is stored outside our Shopify account.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Your information is encrypted and securely managed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>We do not use your data for tracking or advertising.</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-slate-100 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact</h2>
            <p className="text-gray-700 mb-4">
              For questions about AI compliance or data handling, contact:
            </p>
            <div className="text-gray-700">
              <p className="font-semibold mb-2">Welcome Middle East FZ-LLC</p>
              <p className="mb-1">
                📧 Email: <a href="mailto:support@welcomeme.ae" className="text-blue-600 hover:underline">support@welcomeme.ae</a>
              </p>
              <p>🏢 Dubai, United Arab Emirates</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
