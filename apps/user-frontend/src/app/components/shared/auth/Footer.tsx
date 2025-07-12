import Link from "next/link";
import React from "react";

export function Footer() {
  return (
    <footer className="mt-6 text-center text-sm text-gray-600">
      By signing in you agree to our{" "}
      <Link href="/terms" className="hover:underline text-primary">
        Terms of Use
      </Link>
      ,{" "}
      <Link href="/privacy" className="hover:underline text-primary">
        Privacy Policy
      </Link>
      .
    </footer>
  );
}
