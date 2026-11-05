/**
 * Pricing business logic
 * Implements section 7 of PROJECT_BRIEF.md:
 * If sale_price is not null and sale_price < price and (offer_ends_at is null or offer_ends_at > now),
 * product is "on offer".
 */

function calculatePricing(price, salePrice = null, offerEndsAt = null, now = new Date()) {
  const numPrice = Number(price);
  const numSalePrice = salePrice !== null && salePrice !== undefined && salePrice !== '' ? Number(salePrice) : null;

  if (isNaN(numPrice) || numPrice < 0) {
    throw new Error('Invalid price');
  }

  const isOfferActive =
    numSalePrice !== null &&
    !isNaN(numSalePrice) &&
    numSalePrice >= 0 &&
    numSalePrice < numPrice &&
    (offerEndsAt === null || offerEndsAt === undefined || new Date(offerEndsAt).getTime() > new Date(now).getTime());

  if (isOfferActive) {
    const savings = numPrice - numSalePrice;
    const discountPercent = Math.round((savings / numPrice) * 100);
    return {
      isOnOffer: true,
      currentPrice: numSalePrice,
      originalPrice: numPrice,
      savings,
      discountPercent,
      offerEndsAt: offerEndsAt ? new Date(offerEndsAt).toISOString() : null
    };
  }

  return {
    isOnOffer: false,
    currentPrice: numPrice,
    originalPrice: numPrice,
    savings: 0,
    discountPercent: 0,
    offerEndsAt: null
  };
}

module.exports = { calculatePricing };

