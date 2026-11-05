const { getSettings } = require('../services/settings');
const { getCategories } = require('../services/categories');
const { formatPrice, formatDate } = require('../lib/format');
const { calculatePricing } = require('../lib/pricing');
const { getStockStatus } = require('../lib/stock');
const { buildWhatsAppLink } = require('../lib/whatsapp');

async function settingsMiddleware(req, res, next) {
  try {
    const settings = await getSettings();
    const categories = await getCategories();

    // Attach global settings & helpers to res.locals
    res.locals.settings = settings;
    res.locals.categories = categories;
    res.locals.currentPath = req.path;

    // Helper functions available in EJS templates
    res.locals.formatPrice = (amount) => formatPrice(amount, settings.currency_symbol || 'Rs');
    res.locals.formatDate = (date) => formatDate(date, settings.timezone || 'Asia/Colombo');
    res.locals.pricing = calculatePricing;
    res.locals.stockLabel = (qty, threshold) =>
      getStockStatus(qty, threshold, settings.show_exact_stock);
    res.locals.waLink = (productName, price, fullUrl) =>
      buildWhatsAppLink({
        whatsappNumber: settings.whatsapp_number,
        businessName: settings.business_name,
        template: settings.whatsapp_message_template,
        product: productName,
        price,
        url: fullUrl || `${req.protocol}://${req.get('host')}${req.originalUrl}`
      });

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = settingsMiddleware;

