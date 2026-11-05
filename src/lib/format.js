/**
 * Formatting helpers
 * Currency, dates, and number formatting.
 * Sri Lanka currency example: Rs 189,000 (no decimals when .00)
 */

function formatPrice(amount, symbol = 'Rs') {
  const num = Number(amount);
  if (isNaN(num)) return `${symbol} 0`;

  const hasDecimals = num % 1 !== 0;
  const formatted = new Intl.NumberFormat('en-LK', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0
  }).format(num);

  return `${symbol} ${formatted}`;
}

function formatDate(date, timezone = 'Asia/Colombo') {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(d);
}

module.exports = { formatPrice, formatDate };

