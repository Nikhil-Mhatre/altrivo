import { NextFunction, Request, Response } from "express";
import { ValidationError } from "@packages/error-handler";
import crypto from "crypto";
import redis from "@packages/libs/redis";
import { sendEmail } from "./sendMail";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Regex to validate standard email format (RFC 5322 simple pattern)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Auth Helper: validateRegistrationData
 * -----------------------
 * Validates the incoming registration data payload for both user & seller types.
 * Throws ValidationError with specific message if the data is invalid.
 *
 * @param data Incoming request payload
 * @param userType Either 'user' or 'seller' to determine required fields
 * @throws ValidationError if validation fails
 */
export const validateRegistrationData = (
  data: Record<string, any>,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;

  if (!name || !email || !password) {
    throw new ValidationError("Name, email, and password are required.");
  }

  // For sellers, ensure phone_number and country are also provided
  if (userType === "seller" && (!phone_number || !country)) {
    throw new ValidationError(
      "Phone number and country are required for sellers."
    );
  }

  // Validate email format
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format!");
  }
};

/**
 * Auth Helper: checkOtpRestrictions
 * -----------------------
 * Checks OTP-related restrictions for a given email address.
 * Ensures user is not locked due to failed attempts, spam requests, or cooldowns.
 * Calls next middleware with ValidationError if any restriction is triggered.
 *
 * @param email User's email address
 * @param next Express NextFunction for forwarding errors
 */
export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    throw new ValidationError(
      "Account locked due to multiple failed attempts! Try again after 30 minutes."
    );
  }

  if (await redis.get(`otp_spam_lock:${email}`)) {
    throw new ValidationError(
      "Too many OTP requests! Please wait 1 hour before requesting again."
    );
  }

  if (await redis.get(`otp_cooldown:${email}`)) {
    throw new ValidationError(
      "Please wait 1 minute before requesting a new OTP."
    );
  }
};

/**
 * Auth Helper: sendOtp
 * -----------------------
 * Generates a secure 4-digit OTP, sends it via email,
 * and stores both OTP and cooldown flags in Redis for future validation.
 * 
 * What is Cooldown mean ?
 * -------------------------
 * 
 * In the context of your OTP system, a cooldown is a short enforced waiting period that prevents a user from requesting another OTP immediately after the previous one.

 * It’s a temporary lockout designed to slow down repeated requests. This helps to:

 * ✅ Prevent abuse, such as someone trying to flood the system with OTP requests.
 *
 * ✅ Lower the load on your email/SMS services.
 * 
 * ✅ Reduce accidental spamming (e.g., user keeps clicking “Resend OTP”).
 * 
 * ✅ Add a small rate-limit for security (slows down brute-force attempts).
 *
 * @param name Recipient's name for personalized email
 * @param email Recipient's email address
 * @param template Email template key for rendering
 */
export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  // Generate a secure 4-digit OTP (between 1000-9999)
  const otp = crypto.randomInt(1000, 9999).toString();

  // Send OTP via templated email
  await sendEmail(email, "Verify Your Email", template, {
    name,
    logoUrl: process.env.MAIL_LOGO_URL,
    companyName: process.env.BRAND_NAME || "Altrivo",
    otpCode: otp,
    expiryMinutes: 5,
    supportEmail: process.env.MAIL_SUPPORT,
    discordUrl: process.env.DICORD_URL,
    githubUrl: process.env.GITHUB_URL,
    twitterUrl: process.env.X_URL,
  });

  // Store OTP in Redis with 5 min expiry
  await redis.set(`otp:${email}`, otp, "EX", 300);

  // Set a 1-minute cooldown to reduce rapid repeated requests
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};

/**
 * Auth Helper: trackOtpRequests
 * -----------------------
 * Tracks how many OTP requests a user has made within the past hour.
 * After 2 OTP requests, imposes a 1-hour lock to prevent spam.
 *
 * @param email User's email address
 * @param next Express NextFunction for handling validation failures
 */
export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  const otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

  if (otpRequests >= 2) {
    // Too many requests: impose spam lock for 1 hour
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600);
    await redis.set(otpRequestKey, 0, "EX", 3600);
    throw new ValidationError(
      "Too many OTP requests. Please wait 1 hour before requesting again."
    );
  }

  // Increment request count with 1-hour expiry
  await redis.set(otpRequestKey, otpRequests + 1, "EX", 3600);
};

/**
 * Auth Helper: verifyUser
 * -----------------------
 * Verifies a user-provided OTP against the stored OTP for the given email.
 *
 * - If OTP matches, clears stored OTP and resets failed attempts.
 * - If OTP does not match, increments failed attempts and locks account after 3 failures.
 * - Also handles case when OTP is expired or does not exist.
 *
 * @param email - The email address associated with the OTP.
 * @param otp - The one-time password provided by the user.
 * @param next - Express NextFunction to handle forwarding ValidationErrors.
 *
 * @returns void
 */
export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  // Retrieve OTP from Redis for the given email
  const storedOtp = await redis.get(`otp:${email}`);

  if (!storedOtp) {
    throw new ValidationError("expired OTP!");
  }

  // Fetch the count of previous failed attempts
  const failedAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

  // If the OTP does not match
  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      // Lock the account for 30 minutes after 3 failed attempts
      await redis.set(`otp_lock:${email}`, "locked", "EX", 1800);
      await redis.del(`otp:${email}`, failedAttemptsKey);

      throw new ValidationError(
        "Too many failed attempts. Your account is locked for 30 minutes."
      );
    }

    // Increment failed attempts and set short expiration of 5 minutres
    await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300);

    throw new ValidationError(
      `Incorrect OTP. You have ${2 - failedAttempts} attempt(s) left.`
    );
  }

  // If OTP is correct, clean up stored keys
  await redis.del(`otp:${email}`, failedAttemptsKey);
};

/**
 * Auth Helper: handleForgotPassword
 * -----------------------
 * Handles forgot password flow by:
 * - Validating the email input
 * - Checking if the user exists in DB
 * - Applying OTP restrictions and tracking
 * - Sending OTP to user's email for password reset
 *
 * @param req Express request object containing { email }
 * @param res Express response object
 * @param next Express next middleware for error handling
 * @param userType Either 'user' or 'seller' to determine which model to query
 *
 * @returns JSON message indicating that OTP was sent
 */
export const handleForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
  userType: "user" | "seller"
) => {
  try {
    const { email } = req.body;

    // Validate presence of email field
    if (!email) {
      throw new ValidationError("Email is required!");
    }

    // Check if the user exists based on userType
    const user =
      userType === "user" &&
      (await prismadb.users.findUnique({ where: { email } }));

    if (!user) {
      throw new ValidationError(`${userType} not found with this email!`);
    }

    // Check OTP restrictions (cooldowns, spam locks, etc.)
    await checkOtpRestrictions(email, next);

    // Track OTP request count to enforce rate limiting
    await trackOtpRequests(email, next);

    // Generate OTP and send to the user's email using "forgot-password" template
    await sendOtp(user.name, email, "forgot-password");

    // Respond with success message
    return res.status(200).json({
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    // Forward error to global error handler
    return next(error);
  }
};

/**
 * Auth Helper: verifyForgotPasswordOTP
 * -----------------------
 * Verifies the OTP submitted during forgot password flow.
 *
 * - Validates presence of email and OTP in request body.
 * - Calls the shared verifyOtp helper to handle Redis checks, failed attempts & locking.
 * - If OTP is valid, responds with success message allowing user to proceed with password reset.
 *
 * @param req Express request object containing { email, otp }
 * @param res Express response object
 * @param next Express next middleware for error handling
 *
 * @returns JSON message confirming OTP verification success
 */
export const verifyForgotPasswordOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;

    // Ensure both email and otp fields are provided
    if (!email || !otp) {
      throw new ValidationError("Email and OTP are required!");
    }

    // Use the shared OTP verification logic which:
    // - checks stored OTP in Redis
    // - handles failed attempts (increments & locks after retries)
    // - deletes OTP keys if verification succeeds
    await verifyOtp(email, otp, next);

    // Respond to client indicating OTP verification success
    return res.status(200).json({
      message: "OTP verified. You can now reset your password.",
    });
  } catch (error) {
    // Pass any errors to global error handler middleware
    return next(error);
  }
};
