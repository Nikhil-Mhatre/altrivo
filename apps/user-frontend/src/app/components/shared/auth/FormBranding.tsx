import Link from "next/link";
import React from "react";

export function FormBranding() {
  return (
    <div className="text-center w-full">
      <Link href="/">
        <img
          src="brand_icon.svg"
          alt="Altrivo"
          className="h-20 w-1/6 mx-auto"
        />
      </Link>
    </div>
  );
}
