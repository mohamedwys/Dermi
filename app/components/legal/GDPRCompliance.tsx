// GDPRCompliance.tsx - Add your code here
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function GDPRCompliance() {
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
            <div className="p-3 bg-purple-100 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                GDPR Compliance
              </h1>
              <p className="text-slate-600 mt-1">Last updated: October 4, 2025</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Our Commitment to GDPR</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We are committed to protecting the privacy and security of personal data in accordance with the General Data Protection Regulation (GDPR). This document outlines how we comply with GDPR requirements and your rights under this regulation.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                The GDPR applies to the processing of personal data of individuals in the European Union (EU) and European Economic Area (EEA). We take our obligations under GDPR seriously and have implemented appropriate measures to ensure compliance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Legal Basis for Processing</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We process your personal data based on one or more of the following legal grounds:
              </p>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">Contract Performance</h3>
                  <p className="text-slate-700 text-sm">
                    Processing necessary to provide our service and fulfill our contractual obligations to you.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">Legitimate Interests</h3>
                  <p className="text-slate-700 text-sm">
                    Processing necessary for our legitimate business interests, such as fraud prevention, security, and service improvement.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">Consent</h3>
                  <p className="text-slate-700 text-sm">
                    Processing based on your explicit consent for specific purposes, such as marketing communications.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">Legal Obligation</h3>
                  <p className="text-slate-700 text-sm">
                    Processing required to comply with legal obligations, such as tax laws and regulatory requirements.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Your Rights Under GDPR</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Under GDPR, you have the following rights regarding your personal data:
              </p>

              <div className="space-y-4">
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Right to Access</h3>
                  <p className="text-slate-700 text-sm">
                    You have the right to request access to your personal data and receive a copy of it.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Right to Rectification</h3>
                  <p className="text-slate-700 text-sm">
                    You have the right to request correction of inaccurate or incomplete personal data.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Right to Erasure ('Right to be Forgotten')</h3>
                  <p className="text-slate-700 text-sm">
                    You have the right to request deletion of your personal data under certain circumstances.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Right to Restriction of Processing</h3>
                  <p className="text-slate-700 text-sm">
                    You have the right to request that we limit the processing of your personal data in certain situations.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Right to Data Portability</h3>
                  <p className="text-slate-700 text-sm">
                    You have the right to receive your personal data in a structured, commonly used format and transmit it to another controller.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Right to Object</h3>
                  <p className="text-slate-700 text-sm">
                    You have the right to object to processing of your personal data based on legitimate interests or for direct marketing.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Rights Related to Automated Decision-Making</h3>
                  <p className="text-slate-700 text-sm">
                    You have the right not to be subject to decisions based solely on automated processing, including profiling, that produce legal or significant effects.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Right to Withdraw Consent</h3>
                  <p className="text-slate-700 text-sm">
                    Where processing is based on consent, you have the right to withdraw your consent at any time.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. How to Exercise Your Rights</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                To exercise any of your GDPR rights, you can:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Email our Data Protection Officer at dpo@yourcompany.com</li>
                <li>Use the data management tools in your account settings</li>
                <li>Submit a request through our support system</li>
                <li>Send a written request to our registered address</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                We will respond to your request within one month. In complex cases, we may extend this period by two additional months, and we will inform you of any such extension.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-blue-900 text-sm">
                  <strong>Verification:</strong> To protect your privacy, we may need to verify your identity before processing your request. We may ask for additional information to confirm your identity.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Data Protection Measures</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to ensure data protection:
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Technical Measures</h3>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>End-to-end encryption for data in transit</li>
                <li>Encryption of sensitive data at rest</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Multi-factor authentication</li>
                <li>Automated backup and disaster recovery systems</li>
                <li>Intrusion detection and prevention systems</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">Organizational Measures</h3>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Data protection policies and procedures</li>
                <li>Regular staff training on data protection</li>
                <li>Access controls and role-based permissions</li>
                <li>Data processing agreements with third parties</li>
                <li>Privacy by design and by default principles</li>
                <li>Regular data protection impact assessments</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Data Processing Agreements</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                When we process personal data on behalf of our customers (as a data processor), we ensure:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Formal Data Processing Agreements (DPAs) are in place</li>
                <li>Processing is only performed on documented instructions</li>
                <li>Confidentiality obligations are maintained</li>
                <li>Appropriate security measures are implemented</li>
                <li>Sub-processors are properly authorized and managed</li>
                <li>Assistance is provided for data subject rights requests</li>
                <li>Data is deleted or returned at the end of services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. International Data Transfers</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                When we transfer personal data outside the EEA, we ensure appropriate safeguards are in place:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Adequacy decisions for certain countries</li>
                <li>Binding Corporate Rules (BCRs) where applicable</li>
                <li>Additional security measures as required</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Data Breach Notification</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                In the event of a personal data breach, we will:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Notify the relevant supervisory authority within 72 hours of becoming aware</li>
                <li>Inform affected individuals without undue delay if the breach poses a high risk</li>
                <li>Document all data breaches and our response actions</li>
                <li>Implement measures to mitigate potential adverse effects</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Data Protection Officer</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We have appointed a Data Protection Officer (DPO) who is responsible for:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Monitoring GDPR compliance</li>
                <li>Advising on data protection obligations</li>
                <li>Conducting data protection impact assessments</li>
                <li>Cooperating with supervisory authorities</li>
                <li>Serving as the contact point for data subjects and authorities</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                You can contact our DPO at: dpo@yourcompany.com
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Right to Lodge a Complaint</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you believe we have not complied with GDPR requirements, you have the right to lodge a complaint with:
              </p>
              <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
                <li>Our Data Protection Officer (first point of contact)</li>
                <li>Your local data protection authority</li>
                <li>The supervisory authority in the EU member state where you reside or work</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-4">
                A list of EU data protection authorities can be found at: <a href="https://edpb.europa.eu/about-edpb/board/members_en" className="text-blue-600 hover:underline">https://edpb.europa.eu</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Children's Data</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our service is not directed to children under 16 years of age. We do not knowingly collect personal data from children under 16. If we become aware that we have collected personal data from a child under 16, we will take steps to delete it promptly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Updates to GDPR Compliance</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We regularly review and update our GDPR compliance measures. This document will be updated to reflect any changes in our practices or legal requirements. Material changes will be communicated to affected individuals.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Contact Information</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                For GDPR-related inquiries, please contact:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-700 mb-2"><strong>Data Protection Officer</strong></p>
                <p className="text-slate-700">Email: dpo@yourcompany.com</p>
                <p className="text-slate-700">Address: 123 Business St, Suite 100, City, State 12345</p>
                <p className="text-slate-700 mt-3">
                  General Privacy: privacy@yourcompany.com
                </p>
              </div>
            </section>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                Our Commitment
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                We are committed to maintaining the highest standards of data protection and privacy. Your trust is important to us, and we continuously work to ensure our practices meet and exceed GDPR requirements.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
