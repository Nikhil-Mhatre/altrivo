"use client";

import Link from "next/link";
import { Button, Card, CardContent } from "@altrivo/ui-library";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 max-w-3xl">
      <div className="flex flex-col items-center mb-8">
        {/* Logo from public folder */}
        <img
          src="brand_icon.svg"
          alt="Altrivo"
          className="mb-2 w-1/4 h-16"
        />
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
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Effective Date: 7 July 2025</p>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              1. Information We Collect
            </h2>
            <ul className="list-disc list-inside">
              <li>
                <strong>Account Information:</strong> Name, email, address,
                payment details.
              </li>
              <li>
                <strong>Usage Data:</strong> Pages visited, device info, IP
                address.
              </li>
              <li>
                <strong>Cookies:</strong> We use cookies to improve your
                experience.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              2. How We Use Your Information
            </h2>
            <p>
              To process orders, communicate with you, improve our services, and
              send promotional emails (which you can opt out of).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              3. How We Share Information
            </h2>
            <p>
              With service providers (like payment processors), to comply with
              laws, or in connection with business transfers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Security</h2>
            <p>
              We use reasonable measures to protect your data, but no internet
              transmission is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Your Rights</h2>
            <p>
              Depending on your location, you may request access, correction, or
              deletion of your data. Contact us to make a request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">
              6. Children’s Privacy
            </h2>
            <p>
              We do not knowingly collect information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Changes</h2>
            <p>
              We may update this Policy and will notify you of significant
              changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Contact Us</h2>
            <p>
              Questions? Email us at{" "}
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
