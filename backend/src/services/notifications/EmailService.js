const nodemailer = require('nodemailer');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendApprovalEmail = async (data) => {
  const { 
    email, customerName, receiptNumber, customerId, 
    approvedAmount, approvalDate, paymentReference, planName,
    filePath, filename
  } = data;

  const mailOptions = {
    from: `"NF Plantation" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Deposit Approved - Receipt Attached',
    text: `
      Dear ${customerName},

      We are pleased to inform you that your deposit has been approved successfully.

      Receipt Number: ${receiptNumber}
      Customer ID: ${customerId}
      Approved Amount: Rs. ${new Intl.NumberFormat('en-LK').format(approvedAmount)}
      Approval Date: ${new Date(approvalDate).toLocaleDateString()}
      Payment Reference: ${paymentReference || 'N/A'}

      Please find the official receipt attached with this email for your reference.

      Your deposit has now been recorded successfully in our system. You may log in to your account to view the updated investment details and transaction history.

      If you need any assistance, please contact our support team.

      Regards,
      NF Plantation Investment Solutions
      +94 11 234 5678
      support@nf-plantation.com

      This is an automatically generated email. Please do not reply to this email.
    `,
    attachments: [
      {
        filename: filename,
        path: filePath,
        contentType: 'application/pdf'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
};
