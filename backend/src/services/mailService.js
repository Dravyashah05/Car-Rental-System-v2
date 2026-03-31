const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.ethereal.email",
  port: process.env.MAIL_PORT || 587,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const sendMail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: '"Car Rental Support" <noreply@car-rental-system.com>',
      to,
      subject,
      html
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending mail:", error);
    return null;
  }
};

const sendBookingConfirmation = async (riderEmail, rideDetails) => {
  const subject = `Booking Confirmed - ${rideDetails._id.toString().slice(-8).toUpperCase()}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #3b6fdc;">Booking Confirmation</h2>
      <p>Hello,</p>
      <p>Your booking has been successfully <strong>confirmed</strong>. Here are the ride details:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr style="background: #f8fafc;">
          <th style="text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0;">Booking ID</th>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">#${rideDetails._id.toString().slice(-8).toUpperCase()}</td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0;">Pickup</th>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${rideDetails.pickup?.address || "N/A"}</td>
        </tr>
        <tr style="background: #f8fafc;">
          <th style="text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0;">Drop-off</th>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${rideDetails.dropoff?.address || "N/A"}</td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0;">Estimated Fare</th>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">₹${rideDetails.fare || "---"}</td>
        </tr>
         <tr style="background: #f8fafc;">
          <th style="text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0;">Status</th>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #16a34a; font-weight: bold;">Confirmed</td>
        </tr>
      </table>

      <p style="margin-top: 30px;">Thank you for choosing Car Rental System!</p>
      <p style="font-size: 0.85em; color: #64748b;">This is an automated email. Please do not reply.</p>
    </div>
  `;

  return sendMail(riderEmail, subject, html);
};

module.exports = {
  sendMail,
  sendBookingConfirmation
};
