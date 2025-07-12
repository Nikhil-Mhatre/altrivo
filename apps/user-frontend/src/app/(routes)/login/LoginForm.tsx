"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Button, Input, Card, CardContent } from "@altrivo/ui-library/index";
import {
  GoogleButton,
  PasswordInput,
} from "@apps/user-frontend/src/app/components/shared/auth";
import Link from "next/link";

// Types for the form
type LoginFormInputs = {
  email: string;
  password: string;
};

// Mock login function to simulate async request
const loginUser = async (data: LoginFormInputs) => {
  return new Promise((resolve) => setTimeout(() => resolve(data), 1500));
};

export default function LoginForm() {
  // react-hook-form setup with validation rules
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>();

  // react-query mutation for login
  const mutation = useMutation({
    mutationFn: (data: LoginFormInputs) => loginUser(data),
    onSuccess: (data) => {
      console.log("Login successful:", data);
    },
  });

  // Handle form submit
  const onSubmit = (data: LoginFormInputs) => {
    mutation.mutate(data);
  };

  // Determine if UI should be disabled
  const isDisabled = isSubmitting || mutation.isPending;

  return (
    <Card className="w-full max-w-md mx-auto mt-10 p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold font-display">
          Hey There, Welcome Back!
        </h1>
      </div>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Input */}
          <div>
            <Input
              type="text"
              placeholder="Email"
              disabled={isDisabled}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Invalid email address",
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

          {/* Password Input */}
          <PasswordInput<LoginFormInputs>
            name="password"
            register={register}
            errors={errors}
            disabled={isDisabled}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isDisabled}>
            {mutation.isPending ? "Loading..." : "Login"}
          </Button>

          {/* Or continue with Google */}
          <div className="flex items-center my-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-400 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <GoogleButton disabled={isDisabled} />

          {/* Switch to Signup */}
          <p className="text-center text-sm mt-4">
            {"Don’t have an account?"}{" "}
            <Link href="/signup" className="text-primary underline">
              Sign up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
