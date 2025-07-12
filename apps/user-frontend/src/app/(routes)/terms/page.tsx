"use client";

import Link from "next/link";
import { Button, Card, CardContent } from "@altrivo/ui-library";
import { ArrowLeft } from "lucide-react";

export default function TermsOfUsePage() {
  return (
    <div className="container mx-auto py-12 max-w-3xl">
      <div className="flex flex-col items-center mb-8">
        {/* Logo from public folder */}
        <img src="brand_icon.svg" alt="Altrivo" className="mb-2 w-1/4 h-16" />
        <p className="text-gray-500">Your trusted e-commerce platform</p>
      </div>

      <div className="mb-6">
        <Link href="/">
          <Button
            variant="outline"
            className="flex items-center gap-2 hover:scale-105 transition-transform duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      <Card className="shadow-lg rounded-2xl">
        <CardContent className="space-y-6 p-6">
          <h1 className="text-3xl font-bold">Terms of Use</h1>
          <p className="text-sm text-gray-500">Effective Date: 7 July 2025</p>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              1. Use of Our Service
            </h2>
            <p>
              You may use our Service only if you can form a binding contract
              with us and only in compliance with these Terms and all applicable
              laws. You must be at least 18 years old.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Accounts</h2>
            <p>
              When you create an account, you must provide accurate, complete
              information. You are responsible for safeguarding your password
              and agree not to share your credentials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              3. Orders and Payments
            </h2>
            <p>
              By placing an order, you agree to pay the specified price and
              applicable taxes. We may cancel orders or refuse service at our
              discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              4. Intellectual Property
            </h2>
            <p>
              All content on Altrivo is our property or licensed to us. You may
              not copy, modify, distribute, or create derivative works without
              permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              5. Prohibited Activities
            </h2>
            <ul className="list-disc list-inside">
              <li>Use for any unlawful purpose</li>
              <li>Attempt to hack or disrupt systems</li>
              <li>Impersonate any person or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Termination</h2>
            <p>
              We may suspend or terminate your account if you violate these
              Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              7. Disclaimers & Limitation of Liability
            </h2>
            <p>
              Our Service is provided “as is.” We disclaim warranties to the
              fullest extent permitted by law. We are not liable for indirect
              damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Governing Law</h2>
            <p>These Terms are governed by the laws of India.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Changes</h2>
            <p>
              We may update these Terms. If changes are material, we will notify
              you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">10. Contact Us</h2>
            <p>
              If you have questions, contact us at{" "}
              <a
                href="mailto:support@altrivo.com"
                className="text-blue-600 underline"
              >
                support@altrivo.com
              </a>
              .
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
