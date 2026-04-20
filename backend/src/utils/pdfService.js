const html_to_pdf = require('html-pdf-node');
const path = require('path');
const fs = require('fs');

/**
 * Generate Application Form PDF
 */
const generateApplicationPdf = async (data) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.6; padding: 40px; }
            .header { border-bottom: 2px solid #065f46; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo-text { color: #065f46; font-size: 24px; font-weight: bold; }
            .ref-box { text-align: right; font-size: 12px; color: #666; }
            .section { margin-bottom: 25px; page-break-inside: avoid; }
            .section-title { background: #f0fdf4; color: #065f46; padding: 8px 15px; font-size: 14px; font-weight: bold; border-left: 4px solid #059669; margin-bottom: 15px; text-transform: uppercase; }
            .grid { display: flex; flex-wrap: wrap; }
            .col { width: 50%; padding-bottom: 10px; }
            .label { font-size: 10px; color: #999; text-transform: uppercase; font-weight: bold; }
            .value { font-size: 14px; font-weight: bold; color: #1f2937; }
            .full-width { width: 100%; }
            .signature-area { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; text-align: center; width: 250px; }
            .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo-text">NF PLANTATION (PVT) LTD</div>
            <div class="ref-box">
                <div>APPLICATION FORM</div>
                <strong>REF: ${data.referenceId}</strong><br>
                DATE: ${new Date().toLocaleDateString()}
            </div>
        </div>

        <div class="section">
            <div class="section-title">Step 1: Personal Identification</div>
            <div class="grid">
                <div class="col full-width"><div class="label">Full Name</div><div class="value">${data.name}</div></div>
                <div class="col"><div class="label">NIC Number</div><div class="value">${data.nic}</div></div>
                <div class="col"><div class="label">Gender</div><div class="value">${data.gender}</div></div>
                <div class="col"><div class="label">Date of Birth</div><div class="value">${data.dob}</div></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Step 2: Contact & Address</div>
            <div class="grid">
                <div class="col"><div class="label">Phone Number</div><div class="value">+94 ${data.phone}</div></div>
                <div class="col"><div class="label">Email Address</div><div class="value">${data.email}</div></div>
                <div class="col full-width"><div class="label">Permanent Address</div><div class="value">${data.address}</div></div>
                <div class="col"><div class="label">City</div><div class="value">${data.city}</div></div>
                <div class="col"><div class="label">District</div><div class="value">${data.district}</div></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Step 3: Banking & Investment</div>
            <div class="grid">
                <div class="col"><div class="label">Bank Name</div><div class="value">${data.bankName}</div></div>
                <div class="col"><div class="label">Account Number</div><div class="value">${data.accountNumber}</div></div>
                <div class="col"><div class="label">Account Holder</div><div class="value">${data.accountHolder}</div></div>
                <div class="col"><div class="label">Preferred Branch</div><div class="value">${data.preferredBranch}</div></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Authorization</div>
            <p style="font-size: 11px; color: #666; font-style: italic;">I hereby certify that the information provided above is true and complete to the best of my knowledge.</p>
            <div class="signature-area">
                ${data.signatureUrl ? `<img src="${data.signatureUrl}" style="height: 60px; filter: grayscale(100%);" />` : '<div style="height: 60px;"></div>'}
                <div style="font-size: 10px; font-weight: bold; color: #999;">ELECTRONIC SIGNATURE</div>
            </div>
        </div>

        <div class="footer">
            NF PLANTATION (PVT) LTD - Official Customer Registration Document
        </div>
    </body>
    </html>
    `;

    const options = { format: 'A4', margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' } };
    const file = { content: htmlContent };

    return await html_to_pdf.generatePdf(file, options);
};

/**
 * Generate Deposit Receipt PDF
 */
const generateDepositReceiptPdf = async (data) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1e293b; line-height: 1.6; padding: 50px; }
            .header { border-bottom: 3px solid #065f46; padding-bottom: 25px; margin-bottom: 35px; display: flex; justify-content: space-between; align-items: flex-start; }
            .brand { color: #065f46; }
            .logo-text { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 5px; }
            .reg-no { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            .receipt-title { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 15px; }
            .ref-box { text-align: right; }
            .ref-label { font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase; }
            .ref-value { font-size: 14px; font-weight: 700; color: #1e293b; }
            .section { margin-bottom: 35px; }
            .section-title { background: #f0fdf4; color: #065f46; padding: 10px 15px; font-size: 12px; font-weight: 800; border-left: 5px solid #059669; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
            .data-grid { display: flex; flex-wrap: wrap; margin-left: -10px; margin-right: -10px; }
            .data-item { width: 50%; padding: 0 10px 20px 10px; box-sizing: border-box; }
            .label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 800; margin-bottom: 5px; }
            .value { font-size: 15px; font-weight: 700; color: #1e293b; }
            .amount-card { background: linear-gradient(135deg, #065f46 0%, #064e3b 100%); color: white; padding: 40px; border-radius: 16px; text-align: center; margin: 40px 0; position: relative; overflow: hidden; }
            .amount-card::after { content: 'OFFICIAL'; position: absolute; right: -20px; top: 10px; font-size: 60px; font-weight: 900; opacity: 0.05; transform: rotate(-20deg); }
            .amount-label { font-size: 12px; text-transform: uppercase; font-weight: 600; opacity: 0.9; letter-spacing: 2px; }
            .amount-value { font-size: 44px; font-weight: 900; margin-top: 10px; }
            .security-stamp { border: 2px solid #059669; color: #059669; padding: 8px 15px; border-radius: 6px; font-weight: 900; font-size: 12px; text-transform: uppercase; display: inline-block; margin-top: 20px; transform: rotate(-3deg); }
            .footer { position: fixed; bottom: 50px; left: 50px; right: 50px; text-align: center; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .contact-info { margin-top: 5px; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="brand">
                <div class="logo-text">NF PLANTATION (PVT) LTD</div>
                <div class="reg-no">Registered No: PV 00276537</div>
                <div class="receipt-title">Deposit Confirmation Receipt</div>
            </div>
            <div class="ref-box">
                <div class="ref-label">Transaction Reference</div>
                <div class="ref-value" style="font-family: monospace; font-size: 16px;">${data.referenceNumber}</div>
                <div class="ref-label" style="margin-top: 15px;">Statement Date</div>
                <div class="ref-value">${new Date(data.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
        </div>

        <div class="amount-card">
            <div class="amount-label">Verified Credit Amount</div>
            <div class="amount-value">LKR ${new Intl.NumberFormat('en-LK').format(data.amount)}</div>
            <div class="security-stamp">VERIFIED & CREDITED</div>
        </div>

        <div class="section">
            <div class="section-title">Investor Details</div>
            <div class="data-grid">
                <div class="data-item"><div class="label">Investor Name</div><div class="value">${data.customerName}</div></div>
                <div class="data-item"><div class="label">Investor ID</div><div class="value">${data.userId}</div></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Payment Audit Details</div>
            <div class="data-grid">
                <div class="data-item"><div class="label">Payment Purpose</div><div class="value">Investment Wallet Top-up</div></div>
                <div class="data-item"><div class="label">Verification Status</div><div class="value" style="color: #059669;">APPROVED</div></div>
                <div class="data-item"><div class="label">Channel</div><div class="value">Manual Bank Wire Transfer</div></div>
                <div class="data-item"><div class="label">Approval Code</div><div class="value" style="font-family: monospace;">AUTH-${data.referenceNumber.substring(0,6).toUpperCase()}</div></div>
            </div>
        </div>

        <div style="margin-top: 50px; font-size: 11px; color: #64748b; font-style: italic; border: 1px dashed #cbd5e1; padding: 20px; border-radius: 12px; background: #f8fafc;">
            <strong>Important Declaration:</strong> This is a computer-generated transaction record provided by NF Plantation (Pvt) Ltd. The capital specified has been successfully reconciled against our corporate bank account and credited to your digital investment wallet. No physical signature is required for this digital statement.
        </div>

        <div class="footer">
            <div style="font-weight: 800; color: #1e293b; margin-bottom: 5px;">NF PLANTATION (PVT) LIMITED (PV 00276537)</div>
            Head Office: 234/A, Main Street, Vavuniya, Sri Lanka.
            <div class="contact-info">
                Hotline: +94 24 433 5099 | Support: nfplantation.official.it@gmail.com
            </div>
        </div>
    </body>
    </html>
    `;

    const options = { format: 'A4', margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' } };
    const file = { content: htmlContent };

    return await html_to_pdf.generatePdf(file, options);
};

/**
 * Generate Investment Confirmation PDF
 */
const generateInvestmentPdf = async (data) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.6; padding: 45px; }
            .header { border-bottom: 3px solid #065f46; padding-bottom: 25px; margin-bottom: 35px; }
            .logo { color: #065f46; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
            .doc-type { font-size: 14px; font-weight: bold; color: #666; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px; }
            .contract-title { font-size: 22px; font-weight: bold; color: #0c1c2c; margin: 30px 0 10px 0; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .section { margin-bottom: 30px; }
            .section-title { background: #f0fdf4; color: #065f46; padding: 10px 15px; font-size: 13px; font-weight: bold; border-left: 5px solid #059669; margin-bottom: 15px; text-transform: uppercase; }
            .data-grid { display: flex; flex-wrap: wrap; margin-left: -10px; margin-right: -10px; }
            .data-item { width: 50%; padding: 0 10px 15px 10px; box-sizing: border-box; }
            .label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 800; margin-bottom: 4px; }
            .value { font-size: 14px; font-weight: 700; color: #1e293b; }
            .highlight-box { background: #065f46; color: white; padding: 25px; border-radius: 12px; margin: 30px 0; display: flex; justify-content: space-between; align-items: center; }
            .highlight-amount { text-align: left; }
            .highlight-label { font-size: 11px; text-transform: uppercase; opacity: 0.9; font-weight: bold; }
            .highlight-val { font-size: 30px; font-weight: 900; margin-top: 5px; }
            .stamp-box { border: 2px solid #065f46; color: #065f46; padding: 10px; border-radius: 8px; font-weight: 900; font-size: 12px; text-transform: uppercase; transform: rotate(-5deg); opacity: 0.8; }
            .terms-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 10px; font-size: 11px; color: #475569; }
            .footer { position: fixed; bottom: 40px; left: 45px; right: 45px; font-size: 9px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">NF PLANTATION (PVT) LTD</div>
            <div class="doc-type">Investment Activation Receipt</div>
        </div>

        <div class="section">
            <div class="data-grid">
                <div class="data-item"><div class="label">Reference Number</div><div class="value">${data.referenceNumber}</div></div>
                <div class="data-item" style="text-align: right;"><div class="label">Generation Date</div><div class="value">${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div></div>
            </div>
        </div>

        <div class="highlight-box">
            <div class="highlight-amount">
                <div class="highlight-label">Invested Capital Amount</div>
                <div class="highlight-val">LKR ${new Intl.NumberFormat('en-LK').format(data.amount)}</div>
            </div>
            <div class="stamp-box">PENDING ADMIN APPROVAL</div>
        </div>

        <div class="section">
            <div class="section-title">Investor & Asset Details</div>
            <div class="data-grid">
                <div class="data-item"><div class="label">Investor Name</div><div class="value">${data.customerName}</div></div>
                <div class="data-item"><div class="label">Contractor ID</div><div class="value">${data.userId}</div></div>
                <div class="data-item"><div class="label">Selected Growth Plan</div><div class="value">${data.planName}</div></div>
                <div class="data-item"><div class="label">Plan Duration</div><div class="value">${data.duration} Months</div></div>
                <div class="data-item"><div class="label">Monthly Yield (ROI)</div><div class="value">${data.roi}% per Month</div></div>
                <div class="data-item"><div class="label">Yield Route</div><div class="value">${data.profitDestination === 'BANK' ? 'Automated Bank Withdrawal' : 'NF Internal Wallet'}</div></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Routing Information</div>
            <div class="data-grid">
                <div class="data-item"><div class="label">Beneficiary Bank</div><div class="value">${data.bankName || 'NOT SPECIFIED'}</div></div>
                <div class="data-item"><div class="label">Account Number</div><div class="value">${data.accountNumber || 'NOT SPECIFIED'}</div></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Legal Terms & Declarations</div>
            <div class="terms-box">
                This document serves as an official confirmation of your investment activation request. The capital amount specified above will be deducted from your NF Wallet and moved to the investment escrow upon final administrative approval. This contract is subject to the terms and conditions defined in the NF Plantation Fixed Deposit Rules & Regulations. 
                <br><br>
                <strong>Digital Signature:</strong> Verified by Contractor via electronic biometric signature pada during activation flow.
            </div>
        </div>

        <div class="footer">
            NF PLANTATION (PVT) LTD | Reg No: PV 00276537 | Support: +94 24 433 5099
        </div>
    </body>
    </html>
    `;

    const options = { format: 'A4', margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' } };
    const file = { content: htmlContent };

    return await html_to_pdf.generatePdf(file, options);
};

/**
 * Generate Withdrawal Receipt PDF
 */
const generateWithdrawalReceiptPdf = async (data) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1e293b; line-height: 1.6; padding: 50px; }
            .header { border-bottom: 3px solid #065f46; padding-bottom: 25px; margin-bottom: 35px; display: flex; justify-content: space-between; align-items: flex-start; }
            .brand { color: #065f46; }
            .logo-text { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 5px; }
            .receipt-title { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 15px; }
            .ref-box { text-align: right; }
            .ref-label { font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase; }
            .ref-value { font-size: 14px; font-weight: 700; color: #1e293b; }
            .section { margin-bottom: 35px; }
            .section-title { background: #f0fdf4; color: #065f46; padding: 10px 15px; font-size: 12px; font-weight: 800; border-left: 5px solid #059669; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
            .data-grid { display: flex; flex-wrap: wrap; margin-left: -10px; margin-right: -10px; }
            .data-item { width: 50%; padding: 0 10px 20px 10px; box-sizing: border-box; }
            .label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 800; margin-bottom: 5px; }
            .value { font-size: 15px; font-weight: 700; color: #1e293b; }
            .amount-card { background: #1e293b; color: white; padding: 40px; border-radius: 16px; text-align: center; margin: 40px 0; }
            .amount-label { font-size: 12px; text-transform: uppercase; font-weight: 600; opacity: 0.9; letter-spacing: 2px; }
            .amount-value { font-size: 44px; font-weight: 900; margin-top: 10px; }
            .footer { position: fixed; bottom: 50px; left: 50px; right: 50px; text-align: center; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="brand">
                <div class="logo-text">NF PLANTATION (PVT) LTD</div>
                <div class="receipt-title">Withdrawal Settlement Receipt</div>
            </div>
            <div class="ref-box">
                <div class="ref-label">Internal Reference</div>
                <div class="ref-value">${data.referenceNumber}</div>
                <div class="ref-label" style="margin-top: 15px;">Settlement Date</div>
                <div class="ref-value">${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
        </div>

        <div class="amount-card">
            <div class="amount-label">Total Payout Settled</div>
            <div class="amount-value">LKR ${new Intl.NumberFormat('en-LK').format(data.amount)}</div>
        </div>

        <div class="section">
            <div class="section-title">Beneficiary Account Details</div>
            <div class="data-grid">
                <div class="data-item"><div class="label">Account Holder</div><div class="value">${data.accountName}</div></div>
                <div class="data-item"><div class="label">Bank Name</div><div class="value">${data.bankName}</div></div>
                <div class="data-item"><div class="label">Account Number</div><div class="value">${data.accountNumber}</div></div>
                <div class="data-item"><div class="label">Branch</div><div class="value">${data.branchName}</div></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Transaction Audit</div>
            <div class="data-grid">
                <div class="data-item"><div class="label">Bank Receipt Reference</div><div class="value" style="color: #059669; font-weight: 800;">${data.payoutReferenceNumber}</div></div>
                <div class="data-item"><div class="label">Payout Status</div><div class="value">COMPLETED / SUCCESS</div></div>
            </div>
        </div>

        <div class="footer">
            <div style="font-weight: 800; color: #1e293b; margin-bottom: 5px;">NF PLANTATION (PVT) LIMITED</div>
            Head Office: 234/A, Main Street, Vavuniya, Sri Lanka. Support: nfplantation.official.it@gmail.com
        </div>
    </body>
    </html>
    `;

    const options = { format: 'A4', margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' } };
    const file = { content: htmlContent };

    return await html_to_pdf.generatePdf(file, options);
};

module.exports = {
    generateApplicationPdf,
    generateDepositReceiptPdf,
    generateInvestmentPdf,
    generateWithdrawalReceiptPdf
};
