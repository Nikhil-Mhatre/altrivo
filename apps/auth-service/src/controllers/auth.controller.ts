import { Request, Response, NextFunction } from "express";
import {
  validateRegistrationData,
  checkOtpRestrictions,
  trackOtpRequests,
  sendOtp,
  verifyOtp,
  handleForgotPassword,
  verifyForgotPasswordOTP,
} from "@apps/auth-service/src/utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookies";

/**
 * Registers a new user.
 *
 * - Validates input data (name, email, password).
 * - Checks for duplicate user in DB.
 * - Enforces OTP request restrictions and sends OTP to email.
 *
 * @param req Express request object containing { name, email, password }
 * @param res Express response object
 * @param next Express next middleware for error handling
 * @returns JSON success message if OTP sent
 *
 */
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate input data against schema (name, email, password)
    validateRegistrationData(req.body, "user");

    const { name, email } = req.body;

    // Check if a user already exists with the same email
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    // Enforce OTP sending rules (rate limiting, blocking, etc.)
    await checkOtpRestrictions(email, next);
    await trackOtpRequests(email, next);

    // Send OTP to the provided email for verification
    await sendOtp(name, email, "user-activation-mail");

    // Respond with success
    return res.status(200).json({
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Verifies user's OTP and creates account in database.
 *
 * - Checks required fields (email, otp, name, password).
 * - Validates OTP for email.
 * - Hashes password and stores new user in DB.
 *
 * @param req Express request object containing { email, otp, password, name }
 * @param res Express response object
 * @param next Express next middleware for error handling
 * @returns JSON success message on successful registration
 */
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;

    // Ensure all required fields are present
    if (!email || !otp || !password || !name) {
      return next(new ValidationError("All fields are required!"));
    }

    // Check again if a user already exists with this email
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    // Validate OTP
    await verifyOtp(email, otp, next);

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Authenticates user by verifying credentials,
 * issues JWT access and refresh tokens,
 * and sets them as secure HTTP-only cookies.
 *
 * @param req Express request object containing { email, password }
 * @param res Express response object
 * @param next Express next middleware for error handling
 * @returns JSON with user info and success message
 */
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Ensure required fields are provided
    if (!email || !password) {
      return next(new ValidationError("Email and Password are required!"));
    }

    // Look up user in database
    const user = await prisma.users.findUnique({
      where: { email },
    });
    if (!user) {
      return next(new AuthError("User doesn't exist!"));
    }

    // Compare provided password to hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return next(new ValidationError("Invalid Password!"));
    }

    // Generate JWT access token (short-lived)
    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );

    // Generate JWT refresh token (long-lived)
    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" }
    );

    // Set secure HTTP-only cookies
    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);

    return res.status(200).json({
      message: "Login successfully!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Handles forgot password flow for users.
 *
 * - Validates input email.
 * - Checks user existence in DB.
 * - Applies OTP restrictions (cooldown, spam protection).
 * - Sends OTP to user's email for password reset.
 *
 * @param req Express request object containing { email }
 * @param res Express response object
 * @param next Express next middleware for error handling
 *
 * @returns JSON success message if OTP sent to user's email
 */
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Delegate the actual forgot password logic to shared helper,
    // specifying this is a 'user' type (vs 'seller' etc)
    await handleForgotPassword(req, res, next, "user");
  } catch (error) {
    // Any unexpected errors are passed to global error handler
    return next(error);
  }
};

/**
 * Verifies the OTP sent during forgot password flow.
 *
 * - Delegates to helper which validates the OTP against Redis.
 * - Handles incorrect OTP, retries, locks via shared mechanism.
 * - On success, responds with confirmation that user can proceed to reset password.
 *
 * @param req Express request object containing { email, otp }
 * @param res Express response object
 * @param next Express next middleware for error handling
 */
export const verifyForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Simply delegate to shared helper which handles validation,
    // failed attempts, lockouts, etc.
    await verifyForgotPasswordOTP(req, res, next);
  } catch (error) {
    // Forward unexpected errors to global error handler
    return next(error);
  }
};

/**
 * Resets user's password after OTP verification.
 *
 * - Validates that both email and new password are provided.
 * - Ensures the user exists in the DB.
 * - Checks that new password is not same as the old password.
 * - Hashes the new password and updates it in the DB.
 *
 * @param req Express request object containing { email, newPassword }
 * @param res Express response object
 * @param next Express next middleware for error handling
 *
 * @returns JSON message confirming password reset success
 */
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;

    // Validate presence of required fields
    if (!email || !newPassword) {
      return next(new ValidationError("Email and new password are required!"));
    }

    // Check if the user actually exists
    const user = await prismadb.users.findUnique({ where: { email } });
    if (!user) {
      return next(new ValidationError("User not found!"));
    }

    // Prevent user from setting the same password again
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword) {
      return next(
        new ValidationError(
          "New password cannot be the same as the old password!"
        )
      );
    }

    // Hash the new password before saving to DB
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prismadb.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    return next(error);
  }
};
