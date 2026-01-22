import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Thive Lab",
  description: "Terms of Service for Thive Lab services and website.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <Link href="/" className="mb-8 inline-block text-sm text-indigo-400 hover:text-indigo-300">
          ← Back to Home
        </Link>

        <article className="prose prose-invert prose-zinc max-w-none">
          <h1 className="text-4xl font-semibold text-white">Terms of Service</h1>
          <p className="text-zinc-400">Last updated: January 22, 2026</p>

          <section className="mt-8 space-y-6 text-zinc-300">
            <div>
              <h2 className="text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
              <p className="mt-2">
                By accessing and using Thive Lab&apos;s services, you agree to be bound by these Terms of Service and all
                applicable laws and regulations.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">2. Use License</h2>
              <p className="mt-2">
                Permission is granted to temporarily access the materials on Thive Lab&apos;s website for personal,
                non-commercial transitory viewing only.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">3. Disclaimer</h2>
              <p className="mt-2">
                The materials on Thive Lab&apos;s website are provided on an &apos;as is&apos; basis. Thive Lab makes no warranties,
                expressed or implied, and hereby disclaims and negates all other warranties including, without limitation,
                implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement
                of intellectual property or other violation of rights.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">4. Limitations</h2>
              <p className="mt-2">
                In no event shall Thive Lab or its suppliers be liable for any damages (including, without limitation,
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability
                to use the materials on Thive Lab&apos;s website.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">5. Accuracy of Materials</h2>
              <p className="mt-2">
                The materials appearing on Thive Lab&apos;s website could include technical, typographical, or photographic
                errors. Thive Lab does not warrant that any of the materials on its website are accurate, complete, or
                current.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">6. Links</h2>
              <p className="mt-2">
                Thive Lab has not reviewed all of the sites linked to its website and is not responsible for the contents
                of any such linked site.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">7. Modifications</h2>
              <p className="mt-2">
                Thive Lab may revise these terms of service for its website at any time without notice. By using this
                website you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">8. Governing Law</h2>
              <p className="mt-2">
                These terms and conditions are governed by and construed in accordance with the laws and you irrevocably
                submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white">9. Contact Information</h2>
              <p className="mt-2">
                If you have any questions about these Terms, please contact us at:{" "}
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
