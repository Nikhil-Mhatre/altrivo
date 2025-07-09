import express from "express";
import {
  loginUser,
  resetUserPassword,
  userForgotPassword,
  userRegistration,
  verifyForgotPassword,
  verifyUser,
} from "@apps/auth-service/src/controllers/auth.controller";

const authRouter = express.Router();

// User Registration (initial step - sends OTP)
authRouter.post("/api/user/register", userRegistration);

// Verify OTP and create user account
authRouter.post("/api/user/verify-registration", verifyUser);

// User Login
authRouter.post("/api/user/login", loginUser);

// Forgot Password - sends OTP to email
authRouter.post("/api/user/forgot-password", userForgotPassword);

// Verify OTP for forgot password
authRouter.post("/api/user/verify-forgot-password", verifyForgotPassword);

// Reset Password after OTP verification
authRouter.post("/api/user/reset-password", resetUserPassword);

export default authRouter;
