"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, Card, CardContent } from "@altrivo/ui-library/index";
import axios from "axios";
import { toast } from "sonner";

export type OtpFormProps = {
  onSubmit: (data: { otp: string }) => void;
  loading?: boolean;
  title?: string;
};

export function OtpForm({
  onSubmit,
  loading = false,
  title = "Verify OTP",
}: OtpFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ otp: string }>();

  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResendClick = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user/resend-otp`
      );
      toast.success("OTP Sent Again", {
        description: "Check your email for the new OTP.",
      });
      setResendTimer(30); // restart timer
    } catch (error: any) {
      console.error("Resend OTP failed:", error);
      toast.error("Failed to resend OTP", {
        description: "Please try again later.",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10 p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold font-display">{title}</h1>
      </div>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Enter OTP"
              {...register("otp", { required: "OTP is required" })}
              className={errors.otp ? "border-red-500" : ""}
              disabled={loading}
            />
            {errors.otp && (
              <p className="text-sm text-red-500 mt-1">{errors.otp.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="text-center mt-4">
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend available in {resendTimer}s
              </p>
            ) : (
              <button
                type="button"
                className="text-primary underline text-sm"
                onClick={handleResendClick}
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
