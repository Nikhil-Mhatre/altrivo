import { Response } from "express";

/**
 * helper: setCookie
 * -----------------------
 * Helper to set a secure HTTP-only cookie.
 *
 * @param res - Express response object
 * @param name - Name of the cookie
 * @param value - Value of the cookie
 */
export const setCookie = (res: Response, name: string, value: string): void => {
  res.cookie(name, value, {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: true, // Ensures cookie is only sent over HTTPS
    sameSite: "none", // Cross-site requests allowed (useful for APIs on different domains)
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};
