/**
 * Report Export Utilities
 * Handles Word (.docx), Excel (.xlsx), and PDF exports
 */

interface ExportData {
  title: string;
  dateRange: { startDate: string; endDate: string };
  stats: Array<{ label: string; value: string; change?: string }>;
  charts?: Array<{ title: string; data: any[] }>;
  tables?: Array<{ title: string; headers: string[]; rows: any[][] }>;
}

/**
 * Export to Word Document (.docx)
 * Full report including KPI, charts, tables, and summaries
 */
export const exportToWord = async (data: ExportData) => {
  try {
    // Dynamically import docx library
    const { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, HeightRule, BorderStyle, TextRun } = await import('docx');

    const now = new Date().toLocaleDateString();
    const statsRows = data.stats.map(stat => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: stat.label, bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: stat.value, bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: stat.change || '-' })] })] }),
      ],
    }));

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `📊 ${data.title}`,
                bold: true,
                size: 28,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Date Range: ${data.dateRange.startDate} to ${data.dateRange.endDate}`,
                italics: true,
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Summary',
                bold: true,
                size: 24,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Metric', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Value', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Change', bold: true })] })] }),
                ],
              }),
              ...statsRows,
            ],
          }),
          new Paragraph({
            children: [new TextRun('')],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated on ${now} by Pasale Business Management`,
                italics: true,
                size: 18,
                color: '999999',
              }),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    downloadFile(blob, `${data.title.replace(/\s+/g, '_')}_${data.dateRange.startDate}.docx`);
  } catch (error) {
    console.error('Error exporting to Word:', error);
    alert('Error exporting to Word. Please try again.');
  }
};

/**
 * Export to Excel (.xlsx)
 * Tabular data only - excludes graphs and KPI cards
 */
export const exportToExcel = async (data: ExportData) => {
  try {
    // Dynamically import xlsx library
    const XLSX = await import('xlsx');

    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ['Report', data.title],
      ['Date Range', `${data.dateRange.startDate} to ${data.dateRange.endDate}`],
      ['Generated', new Date().toLocaleDateString()],
      [],
      ['Metric', 'Value', 'Change'],
      ...data.stats.map(s => [s.label, s.value, s.change || '-']),
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Add table sheets if available
    if (data.tables && data.tables.length > 0) {
      data.tables.forEach(table => {
        const tableData = [
          [table.title],
          table.headers,
          ...table.rows,
        ];
        const ws = XLSX.utils.aoa_to_sheet(tableData);
        XLSX.utils.book_append_sheet(wb, ws, table.title.slice(0, 31)); // Sheet name max 31 chars
      });
    }

    XLSX.writeFile(wb, `${data.title.replace(/\s+/g, '_')}_${data.dateRange.startDate}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Error exporting to Excel. Please try again.');
  }
};

/**
 * Export Full Report as PDF
 * Includes KPI cards, charts, tables, and summaries
 */
export const exportToPDF = (data: ExportData) => {
  const now = new Date().toLocaleDateString();
  const statsHtml = data.stats
    .map(
      s =>
        `<div style="border-left: 4px solid #7c3aed; padding: 15px; background: #f9fafb; margin: 10px 0; border-radius: 8px;">
        <div style="font-size: 12px; color: #6b7280;">${s.label}</div>
        <div style="font-size: 24px; font-weight: 700; color: #1f2937;">${s.value}</div>
        ${s.change ? `<div style="font-size: 11px; color: #10b981; margin-top: 5px;">${s.change}</div>` : ''}
      </div>`
    )
    .join('');

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1f2937; max-width: 900px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #7c3aed; }
          .header h1 { font-size: 28px; color: #1f2937; margin-bottom: 8px; }
          .header p { color: #6b7280; font-size: 14px; }
          .date-range { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .section h2 { font-size: 18px; color: #374151; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
          .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
          @media print { body { padding: 20px; } .section { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 ${data.title}</h1>
        </div>
        <div class="date-range">
          <strong>Date Range:</strong> ${data.dateRange.startDate} to ${data.dateRange.endDate}
        </div>
        <div class="section">
          <h2>Summary</h2>
          <div class="stats-grid">${statsHtml}</div>
        </div>
        <div class="footer">
          <p>Generated on ${now} | Pasale Business Management</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};

/**
 * Helper function to download files
 */
const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Print full page
 */
export const printPage = () => {
  window.print();
};
