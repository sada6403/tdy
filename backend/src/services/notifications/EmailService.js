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

exports.sendAgentAssignmentEmailToCustomer = async ({ customerEmail, customerName, agentName, agentContact, agentEmail, branchName, branchAddress }) => {
  const mailOptions = {
    from: `"NF Plantation" <${process.env.SMTP_USER}>`,
    to: customerEmail,
    subject: 'Your Dedicated Field Agent Has Been Assigned - NF Plantation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafb; padding: 32px;">
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          <div style="background: #065f46; padding: 28px 32px;">
            <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 800;">NF Plantation Investment Solutions</h1>
            <p style="color: #a7f3d0; margin: 6px 0 0; font-size: 13px;">Official Client Communication</p>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 15px; color: #1e293b; margin-bottom: 24px;">Dear <strong>${customerName}</strong>,</p>
            <p style="color: #475569; line-height: 1.7; margin-bottom: 24px;">
              We are pleased to inform you that a dedicated Field Agent has been assigned to your account to provide you with personalised support and assistance with your investments.
            </p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 24px; margin-bottom: 28px;">
              <h3 style="font-size: 14px; font-weight: 800; color: #065f46; text-transform: uppercase; margin: 0 0 16px 0; letter-spacing: 0.05em;">Your Assigned Agent</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600; width: 140px;">Agent Name</td><td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 800;">${agentName}</td></tr>
                <tr><td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">Mobile Number</td><td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 800;">${agentContact}</td></tr>
                <tr><td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">Email Address</td><td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 800;">${agentEmail}</td></tr>
                <tr><td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">Branch</td><td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 800;">${branchName}</td></tr>
                ${branchAddress ? `<tr><td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">Branch Address</td><td style="padding: 8px 0; font-size: 14px; color: #0f172a;">${branchAddress}</td></tr>` : ''}
              </table>
            </div>
            <p style="color: #475569; font-size: 13px; line-height: 1.7;">Your agent will be in touch with you shortly. You may also reach out to them directly using the contact details above for any queries regarding your investments.</p>
          </div>
          <div style="background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">NF Plantation Investment Solutions &nbsp;|&nbsp; support@nf-plantation.com</p>
            <p style="font-size: 11px; color: #cbd5e1; margin: 6px 0 0;">This is an automatically generated email. Please do not reply directly to this email.</p>
          </div>
        </div>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

exports.sendCustomerDetailsEmailToAgent = async ({ agentEmail, agentName, customerName, customerNIC, customerMobile, customerEmail, customerAddress, branchName }) => {
  const mailOptions = {
    from: `"NF Plantation" <${process.env.SMTP_USER}>`,
    to: agentEmail,
    subject: `New Client Assignment — ${customerName} | NF Plantation`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafb; padding: 32px;">
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          <div style="background: #1e293b; padding: 28px 32px;">
            <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 800;">NF Plantation — Agent Portal</h1>
            <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">New Client Assignment Notice</p>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 15px; color: #1e293b; margin-bottom: 24px;">Dear <strong>${agentName}</strong>,</p>
            <p style="color: #475569; line-height: 1.7; margin-bottom: 24px;">
              A new client has been assigned to your portfolio at the <strong>${branchName}</strong>. Please find the client details below and make contact at the earliest convenience.
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; margin-bottom: 28px;">
              <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin: 0 0 16px 0; letter-spacing: 0.05em;">Client Profile</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600; width: 140px;">Full Name</td><td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 800;">${customerName}</td></tr>
                <tr><td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">NIC Number</td><td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${customerNIC}</td></tr>
                <tr><td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">Mobile</td><td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${customerMobile}</td></tr>
                <tr><td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">Email</td><td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${customerEmail}</td></tr>
                ${customerAddress ? `<tr><td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">Address</td><td style="padding: 8px 0; font-size: 14px; color: #0f172a;">${customerAddress}</td></tr>` : ''}
                <tr><td style="padding: 8px 0; font-size: 13px; color: #64748b; font-weight: 600;">Branch</td><td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 700;">${branchName}</td></tr>
              </table>
            </div>
            <p style="color: #475569; font-size: 13px; line-height: 1.7;">Please initiate contact with the client and confirm the assignment within 48 hours. Log in to the NF Plantation system for full client history and investment details.</p>
          </div>
          <div style="background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">NF Plantation Investment Solutions &nbsp;|&nbsp; support@nf-plantation.com</p>
            <p style="font-size: 11px; color: #cbd5e1; margin: 6px 0 0;">This is an automated system message. Please do not reply directly to this email.</p>
          </div>
        </div>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};
