const { pool } = require('../config/db');

const CATEGORIES = [
  {
    name: 'Air Conditioners',
    slug: 'air-conditioners',
    description: 'High-efficiency inverter & non-inverter air conditioners for homes and commercial spaces.',
    icon: 'snowflake',
    sort_order: 1,
    spec_fields: [
      { key: 'type', label: 'AC Type', type: 'select', options: ['Split', 'Window', 'Cassette', 'Portable'], filterable: true, show_on_card: true, show_in_table: true },
      { key: 'capacity_btu', label: 'Capacity (BTU)', type: 'number', unit: 'BTU', filterable: true, show_on_card: true, show_in_table: true },
      { key: 'inverter', label: 'Inverter Technology', type: 'boolean', filterable: true, show_on_card: true, show_in_table: true },
      { key: 'energy_rating', label: 'Energy Rating', type: 'select', options: ['3 Star', '4 Star', '5 Star', 'Inverter Eco'], filterable: false, show_on_card: false, show_in_table: true },
      { key: 'refrigerant', label: 'Refrigerant', type: 'select', options: ['R32', 'R410A', 'R22'], filterable: false, show_on_card: false, show_in_table: true },
      { key: 'room_size', label: 'Recommended Room Size', type: 'text', filterable: false, show_on_card: false, show_in_table: true },
      { key: 'power_consumption_w', label: 'Power Consumption', type: 'number', unit: 'W', filterable: false, show_on_card: false, show_in_table: true },
      { key: 'noise_db', label: 'Noise Level', type: 'number', unit: 'dB', filterable: false, show_on_card: false, show_in_table: true },
      { key: 'wifi_control', label: 'Smart Wi-Fi Control', type: 'boolean', filterable: false, show_on_card: false, show_in_table: true },
      { key: 'voltage', label: 'Operating Voltage', type: 'text', filterable: false, show_on_card: false, show_in_table: true }
    ]
  },
  {
    name: 'Access Points',
    slug: 'access-points',
    description: 'Enterprise & residential high-speed wireless access points, PoE powered with seamless roaming.',
    icon: 'wifi',
    sort_order: 2,
    spec_fields: [
      { key: 'wifi_standard', label: 'Wi-Fi Standard', type: 'select', options: ['Wi-Fi 5', 'Wi-Fi 6', 'Wi-Fi 6E', 'Wi-Fi 7'], filterable: true, show_on_card: true, show_in_table: true },
      { key: 'bands', label: 'Frequency Bands', type: 'select', options: ['Dual-band', 'Tri-band'], filterable: false, show_on_card: false, show_in_table: true },
      { key: 'max_speed_mbps', label: 'Max Throughput', type: 'number', unit: 'Mbps', filterable: false, show_on_card: true, show_in_table: true },
      { key: 'poe', label: 'PoE Standard', type: 'select', options: ['None', '802.3af', '802.3at', '802.3bt', 'Passive'], filterable: true, show_on_card: true, show_in_table: true },
      { key: 'ethernet_ports', label: 'Ethernet Ports', type: 'text', filterable: false, show_on_card: false, show_in_table: true },
      { key: 'mounting', label: 'Mounting', type: 'select', options: ['Ceiling', 'Wall', 'Desk'], filterable: false, show_on_card: false, show_in_table: true },
      { key: 'max_clients', label: 'Max Concurrent Clients', type: 'number', filterable: false, show_on_card: false, show_in_table: true },
      { key: 'management', label: 'Management Mode', type: 'select', options: ['Standalone', 'Controller', 'Cloud'], filterable: true, show_on_card: false, show_in_table: true },
      { key: 'environment', label: 'Environment', type: 'select', options: ['Indoor', 'Outdoor'], filterable: true, show_on_card: false, show_in_table: true },
      { key: 'antennas', label: 'Antenna Config', type: 'text', filterable: false, show_on_card: false, show_in_table: true }
    ]
  }
];

const DEFAULT_SETTINGS = [
  { key: 'business_name', value: 'FrostNet Technologies' },
  { key: 'tagline', value: 'Cooling and networking solutions, delivered' },
  { key: 'whatsapp_number', value: '94771234567' },
  { key: 'phone', value: '+94 77 123 4567' },
  { key: 'email', value: 'info@frostnet.lk' },
  { key: 'address', value: 'No. 42 Galle Road, Colombo 03, Sri Lanka' },
  { key: 'hours', value: 'Mon to Sat, 9:00 AM to 6:00 PM' },
  { key: 'currency_code', value: 'LKR' },
  { key: 'currency_symbol', value: 'Rs' },
  { key: 'timezone', value: 'Asia/Colombo' },
  { key: 'show_exact_stock', value: false },
  { key: 'hero_title', value: 'Next-Gen Climate Control & Enterprise Connectivity' },
  { key: 'hero_subtitle', value: 'Direct distributor prices with genuine warranty and immediate WhatsApp quotes.' },
  { key: 'whatsapp_message_template', value: "Hi {business}, I'm interested in {product} ({price}). {url}" },
  { key: 'about_title', value: 'About FrostNet Technologies' },
  { key: 'about_body', value: 'Founded in Colombo, FrostNet Technologies specializes in providing premium commercial & residential air conditioning solutions alongside carrier-grade wireless networking hardware.' }
];

async function seedCategories() {
  if (!pool) {
    console.error('❌ DATABASE_URL is not set.');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    console.log('🌱 Seeding categories and default settings...');

    // Upsert categories
    for (const cat of CATEGORIES) {
      await client.query(
        `INSERT INTO categories (name, slug, description, icon, sort_order, is_active, spec_fields)
         VALUES ($1, $2, $3, $4, $5, true, $6)
         ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name,
             description = EXCLUDED.description,
             icon = EXCLUDED.icon,
             sort_order = EXCLUDED.sort_order,
             spec_fields = EXCLUDED.spec_fields,
             updated_at = CURRENT_TIMESTAMP`,
        [cat.name, cat.slug, cat.description, cat.icon, cat.sort_order, JSON.stringify(cat.spec_fields)]
      );
      console.log(`✅ Category ready: ${cat.name} (${cat.slug})`);
    }

    // Seed default site settings
    for (const s of DEFAULT_SETTINGS) {
      await client.query(
        `INSERT INTO site_settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key) DO NOTHING`,
        [s.key, JSON.stringify(s.value)]
      );
    }
    console.log('✅ Site settings seeded.');
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seedCategories().catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}

module.exports = { seedCategories, CATEGORIES, DEFAULT_SETTINGS };
