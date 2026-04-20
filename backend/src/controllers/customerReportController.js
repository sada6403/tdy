const customerReportService = require('../services/report/customerReportService');
const html_to_pdf = require('html-pdf-node');

/**
 * Controller for generating official administration reports
 */
exports.generateReport = async (req, res, next) => {
    try {
        const { id, category } = req.params;
        const { format } = req.query; // 'json' or 'pdf'

        let reportData;
        switch (category) {
            case 'profile': reportData = await customerReportService.getProfileReport(id); break;
            case 'wallet': reportData = await customerReportService.getWalletStatement(id); break;
            case 'investments': reportData = await customerReportService.getInvestmentsReport(id); break;
            case 'transactions': reportData = await customerReportService.getTransactionsAudit(id); break;
            case 'withdrawals': reportData = await customerReportService.getWithdrawalsReport(id); break;
            case 'deposits': reportData = await customerReportService.getDepositsReport(id); break;
            case 'compliance': reportData = await customerReportService.getComplianceReport(id); break;
            case 'full': reportData = await customerReportService.getFullFinancialReport(id); break;
            default:
                reportData = await customerReportService.getFullFinancialReport(id);
        }

        if (format === 'pdf') {
            return this.generatePdfResponse(reportData, res);
        }

        res.json({ success: true, data: reportData });
    } catch (error) {
        next(error);
    }
};

/**
 * Internal helper to generate PDF from HTML template
 */
exports.generatePdfResponse = async (reportData, res) => {
    try {
        const options = { format: 'A4', margin: { top: '30px', bottom: '30px', left: '30px', right: '30px' } };
        
        // Comprehensive HTML template for PDF generation
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; line-height: 1.5; margin: 0; padding: 0; }
                        .container { padding: 0; }
                        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #10b981; padding-bottom: 15px; margin-bottom: 30px; }
                        .logo-box { display: flex; align-items: center; gap: 8px; }
                        .logo-icon { width: 30px; height: 30px; background-color: #10b981; border-radius: 6px; }
                        .logo-text { color: #10b981; font-size: 20px; font-weight: 900; letter-spacing: -0.5px; }
                        .header-right { text-align: right; }
                        .report-title { font-size: 16px; font-weight: 900; color: #0f172a; margin: 0; }
                        .meta { font-size: 10px; color: #94a3b8; margin-top: 4px; }
                        
                        .section { margin-bottom: 30px; }
                        .section-title { font-size: 12px; font-weight: 900; color: #0f172a; background-color: #f8fafc; padding: 8px 12px; border-left: 3px solid #10b981; margin-bottom: 15px; text-transform: uppercase; }
                        
                        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 10px; }
                        .item { display: flex; flex-direction: column; }
                        .label { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
                        .value { font-size: 12px; font-weight: 700; color: #1e293b; }
                        
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                        th { background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 10px; font-weight: 900; color: #64748b; }
                        td { border-bottom: 1px solid #f1f5f9; padding: 10px; font-size: 11px; text-align: left; }
                        .amount { text-align: right; font-weight: bold; }
                        
                        .summary-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
                        .summary-item { text-align: center; }
                        
                        .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div>
                                <div class="logo-box">
                                    <div class="logo-text">NF PLANTATION</div>
                                </div>
                                <div class="meta" style="font-weight: 800;">ADMIN PORTAL • FINANCIAL SERVICES</div>
                            </div>
                            <div class="header-right">
                                <div class="report-title">${reportData.metadata.reportTitle}</div>
                                <div class="meta">Date: ${new Date(reportData.metadata.generatedAt).toLocaleDateString()}</div>
                                <div class="meta">Ref: REP-${Date.now().toString().slice(-8)}</div>
                            </div>
                        </div>

                        <div class="section">
                            <div class="section-title">1. Customer Identification</div>
                            <div class="grid">
                                <div class="item"><div class="label">Full Legal Name</div><div class="value">${reportData.profile.fullName}</div></div>
                                <div class="item"><div class="label">System User ID</div><div class="value" style="color: #10b981;">${reportData.profile.userId}</div></div>
                                <div class="item"><div class="label">NIC / Identity Number</div><div class="value">${reportData.profile.nic}</div></div>
                                <div class="item"><div class="label">Mobile Number</div><div class="value">${reportData.profile.mobile}</div></div>
                                <div class="item"><div class="label">Primary Email</div><div class="value">${reportData.profile.email}</div></div>
                                <div class="item"><div class="label">Assigned Branch</div><div class="value">${reportData.profile.branch}</div></div>
                            </div>
                        </div>

                        ${reportData.wallet ? `
                        <div class="section">
                            <div class="section-title">2. Wallet Liquidity Statement</div>
                            <div class="summary-box">
                                <div class="summary-item"><div class="label">Available Balance</div><div class="value">LKR ${reportData.wallet.availableBalance.toLocaleString()}</div></div>
                                <div class="summary-item"><div class="label">Held / Pending</div><div class="value">LKR ${reportData.wallet.heldBalance.toLocaleString()}</div></div>
                                <div class="summary-item"><div class="label">Total Capital Status</div><div class="value" style="color: #10b981;">LKR ${(reportData.wallet.availableBalance + (reportData.summary?.activeInvestmentTotal || 0)).toLocaleString()}</div></div>
                            </div>
                        </div>
                        ` : ''}

                        ${reportData.investments && reportData.investments.length > 0 ? `
                        <div class="section">
                            <div class="section-title">3. Investment Portfolio Details</div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>PLAN MODEL</th>
                                        <th>AMOUNT</th>
                                        <th>START DATE</th>
                                        <th>MATURITY</th>
                                        <th>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${reportData.investments.map(inv => `
                                        <tr>
                                            <td style="font-weight: 800;">${inv.planName}</td>
                                            <td class="amount">${inv.amount.toLocaleString()}</td>
                                            <td>${new Date(inv.startDate).toLocaleDateString()}</td>
                                            <td>${new Date(inv.maturityDate).toLocaleDateString()}</td>
                                            <td>${inv.status}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        ` : ''}

                        ${reportData.transactions && reportData.transactions.length > 0 ? `
                        <div class="section">
                            <div class="section-title">4. Transaction Ledger (Recent)</div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>DATE</th>
                                        <th>TYPE</th>
                                        <th>DESCRIPTION</th>
                                        <th class="amount">AMOUNT (LKR)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${reportData.transactions.slice(0, 15).map(tx => `
                                        <tr>
                                            <td>${new Date(tx.date).toLocaleDateString()}</td>
                                            <td style="font-weight: 800;">${tx.type}</td>
                                            <td>${tx.description}</td>
                                            <td class="amount">${tx.amount.toLocaleString()}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        ` : ''}

                        <div class="footer">
                            <div>© ${new Date().getFullYear()} NF Plantation • Authorized System Document</div>
                            <div>Gen by: ADMIN • Page 1 of 1</div>
                        </div>
                    </div>
                </body>
            </html>
        `;

        const file = { content: html };
        const pdfBuffer = await html_to_pdf.generatePdf(file, options);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=NF_Report_${reportData.profile.userId}_${reportData.metadata.category}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF Error:', error);
        res.status(500).json({ success: false, message: 'PDF Generation Failed', error: error.message });
    }
};
