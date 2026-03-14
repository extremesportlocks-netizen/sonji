import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">sonji<span className="text-violet-500">.</span></Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Home</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 14, 2026</p>

        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-6">
          <p>These Terms of Service ("Terms") govern your use of the Sonji platform operated by ESL Consulting LLC ("Company," "we," "our"). By creating an account or using our services, you agree to these Terms.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">1. Services</h2>
          <p>Sonji is a multi-tenant CRM platform that provides contact management, email marketing, SMS messaging, pipeline management, invoicing, and business automation tools. We provide the platform "as-is" and continuously improve it.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">2. Account Registration</h2>
          <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials. You must be at least 18 years old to use our services. One person or legal entity may maintain no more than one free account.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">3. Acceptable Use</h2>
          <p>You agree not to use Sonji to send unsolicited messages (spam), store or transmit illegal content, violate any applicable laws or regulations, attempt to gain unauthorized access to other accounts or systems, or resell access to the platform without authorization.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">4. SMS & Email Messaging</h2>
          <p>When using our SMS and email features, you are responsible for obtaining proper consent from your contacts before sending messages. You must comply with all applicable laws including the Telephone Consumer Protection Act (TCPA), CAN-SPAM Act, and any state-specific regulations. All messages must include opt-out instructions. Message frequency varies by campaign. Standard message and data rates may apply to SMS recipients.</p>
          <p>You agree to include <strong>STOP</strong> opt-out instructions in all marketing messages and to honor opt-out requests immediately. You agree to include <strong>HELP</strong> instructions for support. Program name: Sonji CRM. Support contact: hello@sonji.io.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">5. Billing & Payments</h2>
          <p>Paid plans are billed monthly or annually in advance. All fees are non-refundable except as required by law. We reserve the right to change pricing with 30 days notice. Payment processing is handled by Stripe. You authorize us to charge your payment method on file for all applicable fees.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">6. Data Ownership</h2>
          <p>You retain full ownership of all data you upload or create within Sonji. We do not claim any intellectual property rights over your content. You grant us a limited license to process your data solely to provide the services. You can export or delete your data at any time.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">7. Service Availability</h2>
          <p>We strive for 99.9% uptime but do not guarantee uninterrupted service. We may perform scheduled maintenance with advance notice. We are not liable for downtime caused by factors beyond our control.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, ESL Consulting LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, regardless of the cause of action.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">9. Termination</h2>
          <p>You may cancel your account at any time. We may suspend or terminate accounts that violate these Terms. Upon termination, your data will be retained for 90 days before permanent deletion.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">10. Governing Law</h2>
          <p>These Terms are governed by the laws of the State of Florida. Any disputes shall be resolved in the courts of Lee County, Florida.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">11. Changes to Terms</h2>
          <p>We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated Terms. We will notify you of material changes via email.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">12. Contact</h2>
          <p>Questions about these Terms? Contact us at:</p>
          <p>Email: hello@sonji.io<br />Sonji — Built by ESL Consulting LLC<br />Estero, FL</p>
        </div>
      </main>
    </div>
  );
}
