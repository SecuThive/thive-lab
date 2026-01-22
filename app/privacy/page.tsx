import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Thive Lab",
  description: "Privacy Policy for Thive Lab services and website.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <Link href="/" className="mb-8 inline-block text-sm text-indigo-400 hover:text-indigo-300">
          ← Back to Home
        </Link>

        <article className="prose prose-invert prose-zinc max-w-none">
          <h1 className="text-4xl font-semibold text-white">Privacy Policy</h1>
          <p className="text-zinc-400">Last updated: January 22, 2026</p>

          <section className="mt-8 space-y-6 text-zinc-300">
            <div>
              <h2 className="text-2xl font-semibold text-white">1. Information We Collect</h2>
              <p className="mt-2">
                We collect information that you provide directly to us, including when you sign up for our waitlist,
                contact us, or use our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">2. How We Use Your Information</h2>
              <p className="mt-2">
                We use the information we collect to operate, maintain, and improve our services, communicate with you,
                and comply with legal obligations.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">3. Information Sharing</h2>
              <p className="mt-2">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your
                consent, except as described in this policy or as required by law.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">4. Cookies and Tracking</h2>
              <p className="mt-2">
                We use cookies and similar tracking technologies to track activity on our service and hold certain
                information. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">5. Third-Party Services</h2>
              <p className="mt-2">
                Our website may contain advertisements served by Google AdSense and other third-party advertising partners.
                These partners may use cookies and similar technologies to collect information about your visits to this and
                other websites to provide relevant advertisements.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">6. Data Security</h2>
              <p className="mt-2">
                We implement appropriate technical and organizational measures to protect your personal information.
                However, no method of transmission over the internet is 100% secure.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">7. Your Rights</h2>
              <p className="mt-2">
                You have the right to access, update, or delete your personal information. Contact us at
                thive8564@gmail.com to exercise these rights.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">8. Changes to This Policy</h2>
              <p className="mt-2">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">9. Contact Us</h2>
              <p className="mt-2">
                If you have any questions about this Privacy Policy, please contact us at:{" "}
                <a href="mailto:thive8564@gmail.com" className="text-indigo-400 hover:text-indigo-300">
                  thive8564@gmail.com
                </a>
              </p>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
