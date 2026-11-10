import { MonthlyReportData, InstituteSettings, FeeTransaction } from '../types';

/**
 * Print or Save Monthly Report Card as PDF
 */
export const printMonthlyReport = (
  report: MonthlyReportData,
  settings: InstituteSettings
): void => {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert('Please allow popups to download or print the PDF report.');
    return;
  }

  const { student, month, totalWorkingDays, presentDays, absentDays, attendancePercentage, feeStatus, pendingAmount, remarks } = report;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Student Report - ${student.name} - ${month}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 40px;
    }
    .report-card {
      max-width: 750px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
      padding: 40px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 24px;
      margin-bottom: 30px;
    }
    .institute-title {
      font-size: 24px;
      font-weight: 800;
      color: #1e3a8a;
      letter-spacing: -0.5px;
    }
    .institute-subtitle {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }
    .institute-meta {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 4px;
    }
    .report-badge {
      background: #eff6ff;
      color: #1d4ed8;
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid #bfdbfe;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px;
    }
    .info-label {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
    }
    .info-sub {
      font-size: 12px;
      color: #475569;
      margin-top: 2px;
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stats-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      margin-bottom: 30px;
    }
    .stats-table th {
      background: #f1f5f9;
      padding: 12px 16px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
    }
    .stats-table td {
      padding: 14px 16px;
      font-size: 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }
    .stats-table tr:last-child td {
      border-bottom: none;
    }
    .rate-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 13px;
    }
    .rate-good { background: #dcfce7; color: #15803d; }
    .rate-warning { background: #fef3c7; color: #b45309; }
    .rate-danger { background: #fee2e2; color: #b91c1c; }
    
    .remarks-box {
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 30px;
    }
    .remarks-text {
      font-size: 13px;
      color: #581c87;
      line-height: 1.6;
      font-style: italic;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 30px;
      border-top: 1px dashed #cbd5e1;
    }
    .sign-box {
      text-align: center;
      width: 180px;
    }
    .sign-line {
      border-bottom: 1px solid #94a3b8;
      height: 40px;
      margin-bottom: 8px;
    }
    .sign-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }
    .print-actions {
      text-align: center;
      margin-top: 24px;
    }
    .btn-print {
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
    }
    @media print {
      body { background: white; padding: 0; }
      .report-card { border: none; box-shadow: none; padding: 20px; }
      .print-actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="report-card">
    <div class="header">
      <div>
        <h1 class="institute-title">${settings.instituteName}</h1>
        <div class="institute-subtitle">${settings.tagline}</div>
        <div class="institute-meta">${settings.address} | 📞 ${settings.phone}</div>
      </div>
      <div class="report-badge">
        ${month}
      </div>
    </div>

    <div class="grid">
      <div class="info-box">
        <div class="info-label">Student Details</div>
        <div class="info-value">${student.name}</div>
        <div class="info-sub">Roll No: <b>${student.rollNo}</b> &bull; Class: <b>${student.class}</b></div>
        <div class="info-sub">Subjects: ${student.subjects.join(', ')}</div>
      </div>

      <div class="info-box">
        <div class="info-label">Parent / Guardian</div>
        <div class="info-value">${student.parentName}</div>
        <div class="info-sub">WhatsApp: <b>${student.parentPhone}</b></div>
        <div class="info-sub">Academic Session: 2026-2027</div>
      </div>
    </div>

    <div class="section-title">📊 Monthly Attendance Performance</div>
    <table class="stats-table">
      <thead>
        <tr>
          <th>Total Working Days</th>
          <th>Days Present</th>
          <th>Days Absent</th>
          <th>Attendance Rate</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><b>${totalWorkingDays} Days</b></td>
          <td style="color: #16a34a; font-weight: 700;">${presentDays} Days</td>
          <td style="color: #dc2626; font-weight: 700;">${absentDays} Days</td>
          <td>
            <span class="rate-badge ${attendancePercentage >= 85 ? 'rate-good' : attendancePercentage >= 75 ? 'rate-warning' : 'rate-danger'}">
              ${attendancePercentage}% (${attendancePercentage >= 75 ? 'Meets Criteria' : 'Short Attendance'})
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">💰 Fee Status Summary</div>
    <table class="stats-table">
      <thead>
        <tr>
          <th>Monthly Fee</th>
          <th>Status</th>
          <th>Outstanding Balance</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${settings.currencySymbol}${student.monthlyFee.toLocaleString('en-IN')}</td>
          <td>
            <span class="rate-badge ${feeStatus === 'paid' ? 'rate-good' : 'rate-danger'}">
              ${feeStatus === 'paid' ? 'Paid in Full' : 'Pending Payment'}
            </span>
          </td>
          <td style="font-weight: 700; color: ${pendingAmount > 0 ? '#dc2626' : '#16a34a'};">
            ${settings.currencySymbol}${pendingAmount.toLocaleString('en-IN')}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="remarks-box">
      <div class="info-label" style="color: #7e22ce;">Faculty Observations & Remarks</div>
      <div class="remarks-text">"${remarks}"</div>
    </div>

    <div class="footer">
      <div class="sign-box">
        <div class="sign-line"></div>
        <div class="sign-label">Class Teacher Signature</div>
      </div>
      <div style="font-size: 11px; color: #94a3b8; text-align: center;">
        Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}<br>
        EduPulse Institute Management System
      </div>
      <div class="sign-box">
        <div class="sign-line"></div>
        <div class="sign-label">Institute Seal & Authority</div>
      </div>
    </div>
  </div>

  <div class="print-actions">
    <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <script>
    // Auto open print prompt
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

/**
 * Print Payment Receipt
 */
export const printReceipt = (
  tx: FeeTransaction,
  settings: InstituteSettings
): void => {
  const printWindow = window.open('', '_blank', 'width=700,height=800');
  if (!printWindow) {
    alert('Please allow popups to print receipt.');
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - ${tx.receiptNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #f8fafc; padding: 40px; }
    .receipt { max-width: 600px; margin: 0 auto; background: white; border: 1px solid #cbd5e1; border-radius: 14px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { text-align: center; border-bottom: 2px dashed #94a3b8; padding-bottom: 20px; margin-bottom: 24px; }
    .title { font-size: 22px; font-weight: 800; color: #1e3a8a; }
    .tagline { font-size: 12px; color: #64748b; margin-top: 2px; }
    .receipt-no { display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 4px 12px; border-radius: 9999px; font-weight: 700; font-size: 13px; margin-top: 10px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
    .label { color: #64748b; font-weight: 500; }
    .val { font-weight: 700; color: #0f172a; }
    .total-box { background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0; display: flex; justify-content: space-between; align-items: center; }
    .total-val { font-size: 24px; font-weight: 800; color: #15803d; }
    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
    @media print { body { padding: 0; background: white; } .receipt { border: none; box-shadow: none; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="title">${settings.instituteName}</div>
      <div class="tagline">${settings.tagline}</div>
      <div>${settings.address} &bull; ${settings.phone}</div>
      <div class="receipt-no">FEE RECEIPT: ${tx.receiptNo}</div>
    </div>

    <div class="row">
      <span class="label">Date:</span>
      <span class="val">${tx.date}</span>
    </div>
    <div class="row">
      <span class="label">Student Name:</span>
      <span class="val">${tx.studentName}</span>
    </div>
    <div class="row">
      <span class="label">Class / Batch:</span>
      <span class="val">${tx.studentClass}</span>
    </div>
    <div class="row">
      <span class="label">Month / Term:</span>
      <span class="val">${tx.month}</span>
    </div>
    <div class="row">
      <span class="label">Payment Mode:</span>
      <span class="val">${tx.paymentMode} ${tx.referenceNo ? `(${tx.referenceNo})` : ''}</span>
    </div>
    <div class="row">
      <span class="label">Notes:</span>
      <span class="val">${tx.notes || 'Tuition Fee Payment'}</span>
    </div>

    <div class="total-box">
      <span style="font-weight: 700; color: #334155;">Amount Received:</span>
      <span class="total-val">${settings.currencySymbol}${tx.amount.toLocaleString('en-IN')}</span>
    </div>

    <div style="display: flex; justify-content: space-between; margin-top: 40px;">
      <div>
        <div style="border-bottom: 1px solid #cbd5e1; width: 140px; margin-bottom: 4px;"></div>
        <div style="font-size: 11px; color: #64748b;">Received By: ${tx.collectedBy}</div>
      </div>
      <div>
        <div style="border-bottom: 1px solid #cbd5e1; width: 140px; margin-bottom: 4px;"></div>
        <div style="font-size: 11px; color: #64748b; text-align: right;">Authorized Signature</div>
      </div>
    </div>

    <div class="footer">
      This is a computer-generated fee acknowledgement receipt. Thank you!
    </div>
  </div>
  <script>
    window.addEventListener('load', () => setTimeout(() => window.print(), 400));
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
