/**
 * WhatsApp Link generator
 * Implements rule:
 * https://wa.me/<whatsapp_number>?text=<encodeURIComponent(message)>
 * Template default: "Hi [[BUSINESS_NAME]], I'm interested in {product} ({price}). {url}"
 */

function buildWhatsAppLink({
  whatsappNumber,
  businessName = 'FrostNet Technologies',
  template,
  product = '',
  price = '',
  url = ''
}) {
  const cleanNumber = (whatsappNumber || '').toString().replace(/[^0-9]/g, '');

  const defaultTemplate = "Hi {business}, I'm interested in {product} ({price}). {url}";
  const rawTemplate = template && template.trim().length > 0 ? template : defaultTemplate;

  const message = rawTemplate
    .replace(/\{business\}/g, businessName)
    .replace(/\{product\}/g, product)
    .replace(/\{price\}/g, price)
    .replace(/\{url\}/g, url)
    .trim();

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

module.exports = { buildWhatsAppLink };

