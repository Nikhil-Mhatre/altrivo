"use client";

import React from "react";
import { Button } from "@altrivo/ui-library/index";
import Image from "next/image";

interface Props {
  disabled: boolean;
}

export function GoogleButton({ disabled }: Props) {
  return (
    <Button
      variant="outline"
      className="w-full flex items-center justify-center"
      disabled={disabled}
      onClick={() => alert("Google OAuth flow here")}
    >
      <Image
        src="/google_icon.svg"
        alt="Google"
        width={20}
        height={20}
        className="mr-2"
      />
      Continue with Google
    </Button>
  );
}
