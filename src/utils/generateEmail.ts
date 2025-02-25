import dotenv from "dotenv";
import { string } from "zod";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const { URL_FE } = process.env;
type SubscriptionDetails = {
  id: Number;
  description: String;
  duration: Number;
  price: Number;
  datePurchase: Date;
  activateDate: Date;
};

type CourseDetails = {
  id: Number;
  title: String;
  price: Number;
  datePurchase: Date;
};

function generateCourseReceiptHTML(courseDetails: CourseDetails) {
  const formattedPurchaseDate = new Date(
    courseDetails.datePurchase
  ).toLocaleDateString();
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
  <h1 style="text-align: center; color: #4CAF50;">Course Receipt</h1>
  <p style="text-align: center; font-size: 14px; color: #777;">Thank you for subscribing! Below are the details of your course:</p>
  
  <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px;">
    <p><b>CoursePurchase ID:</b> ${courseDetails.id}</p>
          <p><b>Title:</b> ${courseDetails.title}</p>
          <p><b>Price:</b> $${courseDetails.price}</p>
          <p><b>Purchase Date:</b> ${formattedPurchaseDate}</p>
  </div>
  
  <p style="text-align: center; font-size: 14px; color: #555;">We hope you enjoy your course! If you have any questions, feel free to contact us.</p>
  <footer style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
   
    <p><img 
      src="https://raw.githubusercontent.com/Joaquipe13/assets/main/images/Logo.jpg" 
      alt="Company Logo" 
      style="width:13px; height: auto;"
    /> LearnSphered © 2025. All rights reserved.</p>
  </footer>
</div>
      `;
}

function generateSubscriptionReceiptHTML(
  subscriptionDetails: SubscriptionDetails
) {
  const formattedPurchaseDate = new Date(
    subscriptionDetails.datePurchase
  ).toLocaleDateString();
  const formattedActivateDate = new Date(
    subscriptionDetails.activateDate
  ).toLocaleDateString();
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
  <h1 style="text-align: center; color: #4CAF50;">Subscription Receipt</h1>
  <p style="text-align: center; font-size: 14px; color: #777;">Thank you for subscribing! Below are the details of your subscription:</p>
  
  <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 5px;">
    <p><b>ID:</b> ${subscriptionDetails.id}</p>
    <p><b>Description:</b> ${subscriptionDetails.description}</p>
    <p><b>Duration:</b> ${subscriptionDetails.duration} months</p>
    <p><b>Price:</b> $${subscriptionDetails.price}</p>
    <p><b>Purchase Date:</b> ${formattedPurchaseDate}</p>
    <p><b>Activation Date:</b> ${formattedActivateDate}</p>
  </div>
  
  <p style="text-align: center; font-size: 14px; color: #555;">We hope you enjoy your subscription! If you have any questions, feel free to contact us.</p>
  <footer style="text-align: center; font-size: 12px; color: #aaa; margin-top: 20px;">
    <p><img 
      src="https://raw.githubusercontent.com/Joaquipe13/assets/main/images/Logo.jpg" 
      alt="Company Logo" 
      style="width:13px; height: auto;"
    /> LearnSphered © 2025. All rights reserved.</p>
  </footer>
</div>
    `;
}
function generateConfirmationEmail(token: string) {
  const confirmationLink: string = `${URL_FE}/confirm/${token}`;
  const emailContent: string = `
    <h1>Confirm your account</h1>
    <p>Click <a href="${confirmationLink}">here</a> to confirm your registration.</p>
  `;
  return emailContent;
}
export {
  generateCourseReceiptHTML,
  generateSubscriptionReceiptHTML,
  generateConfirmationEmail,
  SubscriptionDetails,
  CourseDetails,
};
