import { NextFunction, Request, Response } from "express";
import { AppError } from "./index";

/**
 * Global error handling middleware
 *
 * - Captures any error thrown in the request pipeline.
 * - Differentiates between known (AppError) and unknown errors.
 * - Sends appropriate HTTP status codes and JSON responses.
 */
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If error is an instance of our custom AppError,
  // send a structured JSON response with its statusCode and message.
  if (err instanceof AppError) {
    console.log(`Error ${req.method} ${req.url} - ${err.message}`);

    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details && { details: err.details }), // include extra details if available
    });
  }

  // If error is not recognized, log it and return a generic 500 response
  console.log("Unhandled error: ", err);
  return res.status(500).json({
    error: "Something went wrong, please try again",
  });
};
