/**
 * Formatting and Utility Helpers for PKR Expense Tracker
 */

export function formatPKR(amount: number | undefined | null, includeSymbol: boolean = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return includeSymbol ? 'Rs. 0' : '0';
  }
  
  const absAmount = Math.abs(amount);
  const formattedNumber = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(absAmount);

  const sign = amount < 0 ? '-' : '';
  return includeSymbol ? `${sign}Rs. ${formattedNumber}` : `${sign}${formattedNumber}`;
}

export function formatCompactPKR(amount: number): string {
  if (Math.abs(amount) >= 10000000) {
    // Crore (Pakistan / South Asia)
    return `Rs. ${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(amount) >= 100000) {
    // Lakh
    return `Rs. ${(amount / 100000).toFixed(1)} Lakh`;
  }
  if (Math.abs(amount) >= 1000) {
    return `Rs. ${(amount / 1000).toFixed(0)}k`;
  }
  return formatPKR(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getDaysRemaining(targetDate: string): number {
  const target = new Date(targetDate).getTime();
  const today = new Date().getTime();
  const diffTime = target - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
