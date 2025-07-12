"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Button, Input, Card, CardContent } from "@altrivo/ui-library/index";
import {
  GoogleButton,
  OtpForm,
  PasswordInput,
} from "@apps/user-frontend/src/app/components/shared/auth";
import Link from "next/link";
import { toast } from "sonner";

export type SignupFormInputs = {
  name: string;
  email: string;
  password: string;
};

export default function SignupForm() {
  const [step, setStep] = useState<"signup" | "otp">("signup");
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormInputs>();

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormInputs) => {
      setSignupData(data); // store data for OTP verification
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user/register`,
        data,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.info("Check Email", {
        description: "An OTP has been sent to your email.",
      });

      setStep("otp");
    },
    onError: (error: any) => {
      console.error("Signup error:", error);
      toast.error("Signup Failed", {
        description: error?.response?.data?.message || "Please try again.",
      });
      reset(); // clear sensitive fields
    },
  });

  const onOtpSubmit = async (data: { otp: string }) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user/verify-registration`,
        {
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
          otp: data.otp,
        }
      );
      if (response.data.success) {
        toast.success("OTP verified!", {
          description: "Account created. Please login.",
        });
        // 🚀 redirect to login
        window.location.href = "/login";
      }
    } catch (error: any) {
      console.error("OTP verify error:", error);
      toast.error("Invalid OTP. Please try again.");
    }
  };

  const isDisabled = isSubmitting || signupMutation.isPending;

  return step === "signup" ? (
    <Card className="w-full max-w-md mx-auto mt-10 p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold font-display">
          {step === "signup" ? "Create Your Account" : "Verify OTP"}
        </h1>
      </div>
      <CardContent>
        {step === "signup" ? (
          <form
            onSubmit={handleSubmit((data) => signupMutation.mutate(data))}
            className="space-y-4"
          >
            <div>
              <Input
                type="text"
                placeholder="Name"
                disabled={isDisabled}
                {...register("name", {
                  required: "Name is required",
                  minLength: { value: 2, message: "At least 2 characters" },
                  pattern: {
                    value: /^[a-zA-Z\s'-]+$/,
                    message: "Only letters & spaces",
                  },
                })}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Input
                type="email"
                placeholder="Email"
                disabled={isDisabled}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Invalid email",
                  },
                })}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <PasswordInput<SignupFormInputs>
              name="password"
              register={register}
              errors={errors}
              disabled={isDisabled}
            />

            <Button type="submit" className="w-full" disabled={isDisabled}>
              {signupMutation.isPending ? "Processing..." : "Signup"}
            </Button>

            <div className="flex items-center my-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-400 text-sm">or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <GoogleButton disabled={isDisabled} />

            <p className="text-center text-sm mt-4">
              Already have account?{" "}
              <Link href="/login" className="text-primary underline">
                Log in
              </Link>
            </p>
          </form>
        ) : (
          <OtpForm
            onSubmit={onOtpSubmit}
            loading={false}
            title="Verify Signup OTP"
          />
        )}
      </CardContent>
    </Card>
  ) : (
    <OtpForm onSubmit={onOtpSubmit} loading={false} title="Verify Signup OTP" />
  );
}
