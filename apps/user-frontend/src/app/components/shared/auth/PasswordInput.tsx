"use client";

import React, { useState } from "react";
import { Input } from "@altrivo/ui-library/index";
import { Eye, EyeOff } from "lucide-react";
import { FieldErrors, UseFormRegister, Path } from "react-hook-form";

interface PasswordInputProps<TFormValues extends Record<string, any>> {
  name: Path<TFormValues>; // dynamically specify field name
  register: UseFormRegister<TFormValues>;
  errors: FieldErrors<TFormValues>;
  disabled?: boolean;
}

export function PasswordInput<TFormValues extends Record<string, any>>({
  name,
  register,
  errors,
  disabled = false,
}: PasswordInputProps<TFormValues>) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword((prev) => !prev);

  const passwordValidation = {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Minimum 6 characters",
    },
    validate: {
      hasNumber: (v: string) =>
        /\d/.test(v) || "Must include at least 1 number",
      hasUpper: (v: string) =>
        /[A-Z]/.test(v) || "Must include at least 1 uppercase letter",
      hasLower: (v: string) =>
        /[a-z]/.test(v) || "Must include at least 1 lowercase letter",
      hasSpecial: (v: string) =>
        /[!@#$%^&*(),.?":{}|<>]/.test(v) ||
        "Must include at least 1 special character",
    },
  };

  // support dynamic error field
  const fieldError = errors[name];

  return (
    <div className="space-y-1">
      <div className="relative flex items-center">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          disabled={disabled}
          {...register(name, passwordValidation)}
          className={`pr-12 ${fieldError ? "border-red-500" : ""}`}
        />
        <span
          className="absolute right-3 cursor-pointer"
          onClick={togglePassword}
        >
          {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
        </span>
      </div>
      {fieldError && (
        <p className="text-sm text-red-500">{fieldError.message as string}</p>
      )}
    </div>
  );
}
