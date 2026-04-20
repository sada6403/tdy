const pdf = require('html-pdf-node');
const path = require('path');
const fs = require('fs');
const DepositReceipt = require('../models/DepositReceipt');

/**
 * Generates a unique receipt number in the format: DEP-YYYYMMDD-XXXX
 */
exports.generateReceiptNumber = async () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const prefix = `DEP-${dateStr}-`;

  // Find the last receipt created today to increment the sequence
  const lastReceipt = await DepositReceipt.findOne({ 
    receiptNumber: new RegExp(`^${prefix}`) 
  }).sort({ createdAt: -1 });

  let sequence = 1;
  if (lastReceipt) {
    const lastSequence = parseInt(lastReceipt.receiptNumber.split('-').pop());
    sequence = lastSequence + 1;
  }

  return `${prefix}${sequence.toString().padStart(4, '0')}`;
};

/**
 * Generates a professional PDF receipt
 */
exports.generatePdfReceipt = async (data) => {
  const { 
    receiptNumber, customerName, customerId, approvedAmount, 
    approvalDate, paymentReference, planName, depositDate,
    customerEmail, customerNic, customerAddress, depositAmount,
    planDuration, monthlyRoi, investmentAmount
  } = data;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Courier New', Courier, monospace; color: #000; margin: 30px; font-size: 11pt; line-height: 1.4; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 15px; }
        .company-name { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
        .company-address { font-size: 10pt; color: #333; }
        
        .meta-container { display: flex; justify-content: space-between; margin-top: 20px; margin-bottom: 30px; }
        .customer-info { width: 60%; }
        .receipt-info { width: 35%; text-align: left; }
        .meta-row { display: flex; margin-bottom: 2px; }
        .meta-label { width: 120px; }
        .meta-value { font-weight: bold; }

        .statement { margin: 40px 0; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 20px 5px; }
        
        .footer-info { margin-top: 60px; border-top: 1px solid #000; padding-top: 10px; font-size: 9pt; }
        .mode-row { display: flex; justify-content: space-between; margin-top: 15px; }
        
        .signature-area { margin-top: 80px; font-style: italic; font-size: 9pt; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">NF Plantation Investment Solutions</div>
        <div class="company-address">
          Level 4, Orion Towers, No. 12, Dr. Colvin R. De Silva Mawatha, Colombo 02.<br>
          Tel : +94 11 234 5678 | Email: support@nf-plantation.com
        </div>
      </div>

      <div class="meta-container">
        <div class="customer-info">
          <div>${customerName.toUpperCase()}</div>
          <div>${customerAddress || 'SRI LANKA'}</div>
          <div>NIC: ${customerNic || 'N/A'}</div>
        </div>
        <div class="receipt-info">
          <div class="meta-row"><span class="meta-label">Page</span> <span class="meta-value">: 1</span></div>
          <div class="meta-row"><span class="meta-label">Receipt No</span> <span class="meta-value">: ${receiptNumber}</span></div>
          <div class="meta-row"><span class="meta-label">Account Code</span> <span class="meta-value">: ${customerId}</span></div>
          <div class="meta-row"><span class="meta-label">Date</span> <span class="meta-value">: ${new Date(approvalDate).toLocaleDateString()}</span></div>
        </div>
      </div>

      <div class="statement">
        Received with thanks from ${customerName.toUpperCase()}<br>
        a sum of Rs. ${new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2 }).format(approvedAmount)} being the Deposit / Investment Settlement.
      </div>

      <div class="footer-info">
        <div class="mode-row">
          <span>Mode of payment : DIRECT TO BANK</span>
          <span style="font-weight: bold;">TOTAL RECEIVED : Rs. ${new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2 }).format(approvedAmount)}</span>
        </div>
        <div style="margin-top: 15px;">
          Remarks: ${paymentReference || 'N/A'}
        </div>
      </div>

      <div class="signature-area">
        This is a computer generated report and does not require a physical signature.
      </div>
    </body>
    </html>
  `;

  const options = { format: 'A4' };
  const file = { content: htmlContent };
  
  const pdfBuffer = await pdf.generatePdf(file, options);
  
  // Define filename like: Receipt_[CustomerID]_[ReceiptNumber].pdf
  const filename = `Receipt_${customerId}_${receiptNumber}.pdf`;
  const dirPath = path.join(__dirname, '../../uploads/receipts');
  
  // Ensure directory exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.join(dirPath, filename);
  fs.writeFileSync(filePath, pdfBuffer);

  return { filePath, filename };
};
