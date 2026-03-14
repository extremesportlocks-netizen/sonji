import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">sonji<span className="text-violet-500">.</span></Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">← Back to Home</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 14, 2026</p>

        <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-6">
          <p>Sonji ("we," "our," or "us") operates the sonji.io platform. This Privacy Policy describes how we collect, use, and protect your personal information when you use our services.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">Information We Collect</h2>
          <p>We collect information you provide directly when creating an account, including your name, email address, phone number, business name, and billing information. We also collect data you import into the platform, such as customer contacts, transaction records, and communication history.</p>
          <p>We automatically collect certain technical information, including IP address, browser type, device information, and usage patterns within the platform.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">How We Use Your Information</h2>
          <p>We use your information to provide and improve our CRM services, process payments, send transactional communications (account updates, billing notices), and provide customer support. If you opt in, we may send promotional messages about new features or offers.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">SMS & Email Communications</h2>
          <p>By providing your phone number and opting in, you consent to receive SMS messages from us including account notifications, promotional offers, and service updates. Message and data rates may apply. You can opt out at any time by replying STOP to any message or contacting us at hello@sonji.io.</p>
          <p>We will never sell, rent, or share your phone number or email address with third parties for their marketing purposes.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">Data Storage & Security</h2>
          <p>Your data is stored securely using industry-standard encryption. We use PostgreSQL databases with row-level security to ensure tenant data isolation. All data is transmitted over HTTPS with TLS encryption. Payment information is processed by Stripe and is never stored on our servers.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">Third-Party Services</h2>
          <p>We use the following third-party services to operate our platform:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Stripe — payment processing</li>
            <li>Clerk — authentication and user management</li>
            <li>Resend — email delivery</li>
            <li>Twilio — SMS messaging</li>
            <li>Vercel — hosting and deployment</li>
            <li>Neon — database hosting</li>
          </ul>
          <p>Each of these services has their own privacy policies governing their use of data.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information at any time. You can export your data or request account deletion by contacting hello@sonji.io. We will respond to all requests within 30 days.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">Data Retention</h2>
          <p>We retain your account data for as long as your account is active. If you cancel your subscription, we retain your data for 90 days before permanent deletion, allowing you to reactivate if needed.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">Children's Privacy</h2>
          <p>Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by email or through the platform.</p>

          <h2 className="text-lg font-semibold text-gray-900 mt-8">Contact Us</h2>
          <p>If you have questions about this Privacy Policy, contact us at:</p>
          <p>Email: hello@sonji.io<br />Sonji — Built by ESL Consulting LLC</p>
        </div>
      </main>
    </div>
  );
}
