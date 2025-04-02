import {
  generateCourseReceiptHTML,
  generateSubscriptionReceiptHTML,
  generateConfirmationEmail,
  SubscriptionDetails,
  CourseDetails,
} from "./generateEmail.js";
import nodemailers from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development" });
const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS } = process.env;

async function verifyEmail(email: string): Promise<boolean> {
  try {
    const urlAPI = "";
    if (urlAPI == "") {
      return true;
    }
    const response = await fetch(urlAPI);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    const data = await response.json();
    return data.deliverability === "DELIVERABLE";
  } catch (error) {
    console.error("Error verifying email:", error);
    return false;
  }
}
const transporter = nodemailers.createTransport({
  host: EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: "learnspheredsw@gmail.com",
    pass: "vkfibrhhordwumml",
  },

});

async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<string> {
  try {
    await transporter.sendMail({
      from: `"LearnSphered" <${EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    return "The email was sent successfully";
  } catch (error) {
    return `Error sending email: ${
      error instanceof Error ? error.message : error
    }`;
  }
}

async function sendCoursePurchaseReceipt(
  userEmail: string,
  courseDetails: CourseDetails
): Promise<string> {
  try {
    const htmlContent = generateCourseReceiptHTML(courseDetails);
    return await sendEmail(
      userEmail,
      "Thank you for your purchase!",
      htmlContent
    );
  } catch (error) {
    return "Error sending email";
  }
}
async function sendSubscriptionReceipt(
  userEmail: string,
  subscriptionDetails: SubscriptionDetails
): Promise<string> {
  try {
    const htmlContent = generateSubscriptionReceiptHTML(subscriptionDetails);
    return await sendEmail(
      userEmail,
      "Thank you for subscribing!",
      htmlContent
    );
  } catch (error) {
    return "Error sending email";
  }
}

async function sendConfirmationEmail(
  userEmail: string,
  token: string
): Promise<string> {
  if (!(await verifyEmail(userEmail))) {
    console.error(userEmail, ": Invalid email address");
    throw new Error("Invalid email address");
  }
  const emailContent = generateConfirmationEmail(token);

  return await sendEmail(userEmail, "Confirm your account", emailContent);
}
export {
  sendCoursePurchaseReceipt,
  sendSubscriptionReceipt,
  sendConfirmationEmail,
};
