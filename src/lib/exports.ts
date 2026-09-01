import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Category, Wallet, LedgerMonth, Budget, SavingsGoal } from '../types';
import { formatPKR, formatDate } from './formatters';

export function exportTransactionsToExcel(
  transactions: Transaction[],
  categories: Category[],
  wallets: Wallet[],
  title: string = 'Transactions_Report'
) {
  const catMap = new Map(categories.map(c => [c.id, c.name]));
  const walletMap = new Map(wallets.map(w => [w.id, w.name]));

  const rows = transactions.map(t => ({
    'Date': t.date,
    'Type': t.type.toUpperCase(),
    'Category': catMap.get(t.category_id) || 'Uncategorized',
    'Description / Note': t.note || '-',
    'Amount (PKR)': t.amount,
    'Wallet': walletMap.get(t.wallet_id) || 'Main Wallet',
    'Recurring': t.is_recurring ? (t.recurrence_pattern || 'Yes') : 'No'
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

  // Summary sheet
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  const summaryData = [
    { 'Metric': 'Total Income (PKR)', 'Value': totalIncome },
    { 'Metric': 'Total Expenses (PKR)', 'Value': totalExpense },
    { 'Metric': 'Net Savings (PKR)', 'Value': netSavings },
    { 'Metric': 'Transaction Count', 'Value': transactions.length },
    { 'Metric': 'Generated On', 'Value': new Date().toLocaleString() }
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ledger Summary');

  XLSX.writeFile(workbook, `${title.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
}

export function exportMonthLedgerToPDF(
  ledger: LedgerMonth,
  transactions: Transaction[],
  categories: Category[],
  wallets: Wallet[],
  profileName: string
) {
  const doc = new jsPDF();
  const catMap = new Map(categories.map(c => [c.id, c.name]));
  const walletMap = new Map(wallets.map(w => [w.id, w.name]));

  // Brand Header
  doc.setFillColor(124, 58, 237); // Deep Purple
  doc.rect(0, 0, 210, 32, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Smart Expense Tracker (PKR)', 14, 16);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Monthly Financial Ledger: ${ledger.month_name} | Profile: ${profileName}`, 14, 25);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 155, 25);

  // Financial KPI Cards
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');

  // Income box
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(14, 40, 58, 22, 3, 3, 'FD');
  doc.setTextColor(16, 185, 129);
  doc.text('Total Income', 18, 48);
  doc.setFontSize(14);
  doc.text(formatPKR(ledger.total_income), 18, 57);

  // Expense box
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(76, 40, 58, 22, 3, 3, 'FD');
  doc.setTextColor(239, 68, 68);
  doc.setFontSize(11);
  doc.text('Total Expenses', 80, 48);
  doc.setFontSize(14);
  doc.text(formatPKR(ledger.total_expense), 80, 57);

  // Net Savings box
  doc.setFillColor(245, 243, 255);
  doc.setDrawColor(124, 58, 237);
  doc.roundedRect(138, 40, 58, 22, 3, 3, 'FD');
  doc.setTextColor(124, 58, 237);
  doc.setFontSize(11);
  doc.text('Net Savings', 142, 48);
  doc.setFontSize(14);
  doc.text(formatPKR(ledger.net_savings), 142, 57);

  // Transaction Table
  const tableData = transactions.map(t => [
    formatDate(t.date),
    t.type.toUpperCase(),
    catMap.get(t.category_id) || 'Other',
    t.note || '-',
    walletMap.get(t.wallet_id) || 'Wallet',
    formatPKR(t.amount)
  ]);

  autoTable(doc, {
    startY: 70,
    head: [['Date', 'Type', 'Category', 'Note / Description', 'Wallet', 'Amount (PKR)']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [124, 58, 237],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount} — Smart Expense Tracker PWA`, 14, 288);
  }

  doc.save(`${ledger.month_name.replace(/\s+/g, '_')}_Ledger_PKR.pdf`);
}

export function exportComprehensiveReportPDF(
  title: string,
  periodText: string,
  transactions: Transaction[],
  categories: Category[],
  wallets: Wallet[],
  budgets: Budget[],
  savingsGoals: SavingsGoal[],
  profileName: string
) {
  const doc = new jsPDF();
  const catMap = new Map(categories.map(c => [c.id, c.name]));
  const walletMap = new Map(wallets.map(w => [w.id, w.name]));

  // Brand Header
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 36, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ExpensePK — Financial Statement', 14, 18);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report Period: ${periodText} | Profile: ${profileName}`, 14, 28);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 28);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0';

  // KPI Row
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 44, 182, 24, 'F');

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL INCOME', 20, 52);
  doc.text('TOTAL EXPENSES', 68, 52);
  doc.text('NET SAVINGS', 116, 52);
  doc.text('SAVINGS RATE', 160, 52);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(formatPKR(totalIncome), 20, 62);
  doc.setTextColor(239, 68, 68);
  doc.text(formatPKR(totalExpense), 68, 62);
  doc.setTextColor(124, 58, 237);
  doc.text(formatPKR(netSavings), 116, 62);
  doc.setTextColor(59, 130, 246);
  doc.text(`${savingsRate}%`, 160, 62);

  // Top Spending Breakdown
  const catExpenses: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const catName = catMap.get(t.category_id) || 'Other';
    catExpenses[catName] = (catExpenses[catName] || 0) + t.amount;
  });

  const catRows = Object.entries(catExpenses)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => [
      cat,
      formatPKR(amt),
      totalExpense > 0 ? `${((amt / totalExpense) * 100).toFixed(1)}%` : '0%'
    ]);

  autoTable(doc, {
    startY: 75,
    head: [['Expense Category', 'Total Spent (PKR)', '% of Total Outflow']],
    body: catRows.length > 0 ? catRows : [['No expenses recorded', 'Rs. 0', '0%']],
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 }
  });

  // Transaction Log Table
  const lastY = (doc as any).lastAutoTable.finalY || 120;

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Details', 14, lastY + 12);

  const txRows = transactions.slice(0, 40).map(t => [
    formatDate(t.date),
    t.type.toUpperCase(),
    catMap.get(t.category_id) || 'Other',
    t.note || '-',
    walletMap.get(t.wallet_id) || 'Wallet',
    formatPKR(t.amount)
  ]);

  autoTable(doc, {
    startY: lastY + 16,
    head: [['Date', 'Type', 'Category', 'Description', 'Wallet', 'Amount (PKR)']],
    body: txRows,
    headStyles: { fillColor: [124, 58, 237] },
    styles: { fontSize: 8.5 }
  });

  doc.save(`${title.replace(/\s+/g, '_')}_PKR.pdf`);
}
