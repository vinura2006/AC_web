/**
 * Stock label and availability logic
 * Implements section 7 of PROJECT_BRIEF.md:
 * qty = 0 -> "Out of stock" (red)
 * qty <= low_stock_threshold -> "Only N left" (amber)
 * Else -> "In stock" (green) and, if showExactStock is true, "In stock (N available)"
 */

function getStockStatus(qty, lowStockThreshold = 3, showExactStock = false) {
  const stockQty = Number(qty);
  const threshold = Number(lowStockThreshold ?? 3);

  if (isNaN(stockQty) || stockQty <= 0) {
    return {
      status: 'out_of_stock',
      label: 'Out of stock',
      badgeClass: 'badge-danger',
      inStock: false,
      qty: 0
    };
  }

  if (stockQty <= threshold) {
    return {
      status: 'low_stock',
      label: `Only ${stockQty} left`,
      badgeClass: 'badge-warning',
      inStock: true,
      qty: stockQty
    };
  }

  return {
    status: 'in_stock',
    label: showExactStock ? `In stock (${stockQty} available)` : 'In stock',
    badgeClass: 'badge-success',
    inStock: true,
    qty: stockQty
  };
}

module.exports = { getStockStatus };

