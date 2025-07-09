import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";

// Load environment variables from .env file (e.g., SMTP credentials)
dotenv.config();

/**
 * Create a Nodemailer transporter object configured with SMTP settings.
 *
 * Reads SMTP configuration from environment variables:
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP server port (default to 587 if missing)
 * - SMTP_SERVICE: optional service name (like 'gmail')
 * - SMTP_USER, SMTP_PASS: authentication credentials
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465, // 465 for hostinger or 587 for gmail
  secure: true, // true for port 465, false for 587
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Render an email template using EJS.
 *
 * Looks for .ejs template files under:
 *   auth-service/src/utils/email-templates/
 *
 * @param templateName - The base name of the template file (without .ejs)
 * @param data - An object containing data to inject into the template
 * @returns rendered HTML as a string
 */

const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>
): Promise<string> => {
  const templatePath = path.join(
    process.cwd(),
    "apps",
    "auth-service",
    "src",
    "utils",
    "email-templates",
    `${templateName}.ejs`
  );

  return ejs.renderFile(templatePath, data);
};

/**
 * Send an email using the configured transporter.
 *
 * - Renders the specified EJS template with provided data.
 * - Sends an HTML email to the given recipient.
 *
 * @param to - recipient email address
 * @param subject - subject line of the email
 * @param templateName - base name of the EJS template file
 * @param data - data to inject into the template
 * @returns true if sent successfully, false otherwise
 */
export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, any>
) => {
  try {
    const html = await renderEmailTemplate(templateName, data);

    await transporter.sendMail({
      from: `${process.env.BRAND_NAME} <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.log("Error sending email", error);
    return false;
  }
};
