/**
 * Format a number as currency (GBP)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Shorten a string with ellipsis
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Format sort code with hyphens
 */
export function formatSortCode(sortCode: string): string {
  const cleaned = sortCode.replace(/[^0-9]/g, '');
  if (cleaned.length !== 6) return sortCode;
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}`;
}

/**
 * Format account number with spaces
 */
export function formatAccountNumber(accountNumber: string): string {
  const cleaned = accountNumber.replace(/[^0-9]/g, '');
  if (cleaned.length !== 8) return accountNumber;
  return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)}`;
} 