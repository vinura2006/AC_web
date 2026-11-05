const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

function createSvgPlaceholder(name, categoryName, color1 = '#0E1626', color2 = '#22D3EE') {
  return `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cyber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" stop-opacity="0.3" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22D3EE" stroke-opacity="0.1" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="#070B14" />
  <rect width="100%" height="100%" fill="url(#cyber-grad)" />
  <rect width="100%" height="100%" fill="url(#grid)" />
  <circle cx="400" cy="250" r="120" fill="none" stroke="${color2}" stroke-width="2" stroke-dasharray="8 6" opacity="0.4"/>
  <text x="400" y="240" font-family="'Space Grotesk', sans-serif" font-weight="700" font-size="28" fill="#E6EDF7" text-anchor="middle">${categoryName}</text>
  <text x="400" y="280" font-family="'JetBrains Mono', monospace" font-size="16" fill="${color2}" text-anchor="middle">${name}</text>
  <text x="400" y="550" font-family="'Inter', sans-serif" font-size="13" fill="#8FA3BF" text-anchor="middle">FrostNet Technologies • Official Hardware</text>
</svg>`;
}

const DEMO_PRODUCTS = [
  // 6 Air Conditioners
  {
    category_slug: 'air-conditioners',
    name: 'Demo Inverter Split AC 12000 BTU',
    slug: 'demo-inverter-split-ac-12000-btu',
    brand: 'Daikin',
    model: 'FTKF35TV',
    short_description: 'Energy-saving 1.0 Ton R32 Eco Inverter air conditioner with whisper-quiet operation.',
    description: '### Key Advantages\n- **Inverter Technology**: Saves up to 60% electricity compared to standard non-inverters.\n- **R32 Refrigerant**: Eco-friendly coolant with zero ozone depletion.\n- **Quiet Operation**: Low indoor noise level of 24 dB.',
    price: 185000,
    sale_price: 165000,
    offer_ends_at: new Date(Date.now() + 7 * 86400000),
    is_weekly_offer: true,
    is_featured: true,
    stock_qty: 8,
    low_stock_threshold: 3,
    status: 'published',
    warranty_text: '5 Years Compressor, 1 Year Comprehensive',
    specs: {
      type: 'Split',
      capacity_btu: 12000,
      inverter: true,
      energy_rating: '5 Star',
      refrigerant: 'R32',
      room_size: '120 - 150 sq.ft',
      power_consumption_w: 1100,
      noise_db: 24,
      wifi_control: true,
      voltage: '220V - 240V / 50Hz'
    }
  },
  {
    category_slug: 'air-conditioners',
    name: 'Demo Dual-Inverter Split AC 18000 BTU',
    slug: 'demo-dual-inverter-split-ac-18000-btu',
    brand: 'LG',
    model: 'S4-Q18KL3AA',
    short_description: '1.5 Ton high cooling dual inverter split unit with ocean black protection.',
    description: 'Engineered for tropical climates with anti-corrosion gold fin condensers and super fast cooling.',
    price: 245000,
    sale_price: 220000,
    offer_ends_at: new Date(Date.now() + 4 * 86400000),
    is_weekly_offer: true,
    is_featured: true,
    stock_qty: 2,
    low_stock_threshold: 3,
    status: 'published',
    warranty_text: '10 Years Compressor, 1 Year Unit',
    specs: {
      type: 'Split',
      capacity_btu: 18000,
      inverter: true,
      energy_rating: '5 Star',
      refrigerant: 'R32',
      room_size: '180 - 220 sq.ft',
      power_consumption_w: 1650,
      noise_db: 29,
      wifi_control: true,
      voltage: '230V / 50Hz'
    }
  },
  {
    category_slug: 'air-conditioners',
    name: 'Demo Heavy Duty Split AC 24000 BTU',
    slug: 'demo-heavy-duty-split-ac-24000-btu',
    brand: 'Mitsubishi',
    model: 'MSZ-HJ71VA',
    short_description: '2.0 Ton large hall inverter air conditioner for master bedrooms and boardrooms.',
    description: 'Robust Japanese engineering with extended air throw up to 12 meters.',
    price: 330000,
    sale_price: null,
    offer_ends_at: null,
    is_weekly_offer: false,
    is_featured: true,
    stock_qty: 5,
    low_stock_threshold: 3,
    status: 'published',
    warranty_text: '5 Years Compressor, 2 Years Service',
    specs: {
      type: 'Split',
      capacity_btu: 24000,
      inverter: true,
      energy_rating: '4 Star',
      refrigerant: 'R410A',
      room_size: '250 - 320 sq.ft',
      power_consumption_w: 2150,
      noise_db: 34,
      wifi_control: false,
      voltage: '230V / 50Hz'
    }
  },
  {
    category_slug: 'air-conditioners',
    name: 'Demo Compact Window AC 9000 BTU',
    slug: 'demo-compact-window-ac-9000-btu',
    brand: 'Carrier',
    model: 'CR-W09CA',
    short_description: '0.75 Ton compact window air conditioner ideal for small server rooms or security cabins.',
    description: 'Easy DIY window slot installation with mechanical rotary knobs and quick cooling.',
    price: 115000,
    sale_price: 99000,
    offer_ends_at: new Date(Date.now() + 2 * 86400000),
    is_weekly_offer: false,
    is_featured: false,
    stock_qty: 1,
    low_stock_threshold: 2,
    status: 'published',
    warranty_text: '1 Year Warranty',
    specs: {
      type: 'Window',
      capacity_btu: 9000,
      inverter: false,
      energy_rating: '3 Star',
      refrigerant: 'R32',
      room_size: '90 - 110 sq.ft',
      power_consumption_w: 950,
      noise_db: 42,
      wifi_control: false,
      voltage: '230V / 50Hz'
    }
  },
  {
    category_slug: 'air-conditioners',
    name: 'Demo 4-Way Ceiling Cassette AC 36000 BTU',
    slug: 'demo-4-way-ceiling-cassette-ac-36000-btu',
    brand: 'Panasonic',
    model: 'CS-F36DB4E5',
    short_description: '3.0 Ton commercial false ceiling 360-degree airflow cassette system.',
    description: 'Uniform cool airflow distribution across open-plan offices and retail showrooms.',
    price: 520000,
    sale_price: null,
    offer_ends_at: null,
    is_weekly_offer: false,
    is_featured: false,
    stock_qty: 0,
    low_stock_threshold: 1,
    status: 'published',
    warranty_text: '5 Years Compressor Warranty',
    specs: {
      type: 'Cassette',
      capacity_btu: 36000,
      inverter: true,
      energy_rating: 'Inverter Eco',
      refrigerant: 'R32',
      room_size: '400 - 550 sq.ft',
      power_consumption_w: 3200,
      noise_db: 36,
      wifi_control: true,
      voltage: '380V - 415V (3 Phase)'
    }
  },
  {
    category_slug: 'air-conditioners',
    name: 'Demo Portable Mobile AC 12000 BTU',
    slug: 'demo-portable-mobile-ac-12000-btu',
    brand: 'Midea',
    model: 'MPPD-12CRN1',
    short_description: 'Wheeled plug-and-play portable air conditioner with flexible exhaust hose.',
    description: 'No outdoor unit installation required. Plugs directly into any wall outlet.',
    price: 135000,
    sale_price: null,
    offer_ends_at: null,
    is_weekly_offer: false,
    is_featured: false,
    stock_qty: 4,
    low_stock_threshold: 2,
    status: 'draft',
    warranty_text: '1 Year Full Replacement',
    specs: {
      type: 'Portable',
      capacity_btu: 12000,
      inverter: false,
      energy_rating: '3 Star',
      refrigerant: 'R290',
      room_size: '120 - 160 sq.ft',
      power_consumption_w: 1250,
      noise_db: 51,
      wifi_control: false,
      voltage: '230V / 50Hz'
    }
  },

  // 6 Access Points
  {
    category_slug: 'access-points',
    name: 'Demo Wi-Fi 6 Enterprise Access Point 3000 Mbps',
    slug: 'demo-wifi-6-enterprise-access-point-3000-mbps',
    brand: 'Ubiquiti',
    model: 'UniFi U6 Pro',
    short_description: 'High-density ceiling-mount Wi-Fi 6 AP supporting 300+ clients with PoE+ support.',
    description: '### Enterprise Connectivity\n- **Dual-band Wi-Fi 6**: Speeds up to 5.3 Gbps aggregate throughput.\n- **PoE+ 802.3at**: Single cable installation for power and gigabit uplink.',
    price: 65000,
    sale_price: 54000,
    offer_ends_at: new Date(Date.now() + 5 * 86400000),
    is_weekly_offer: true,
    is_featured: true,
    stock_qty: 12,
    low_stock_threshold: 3,
    status: 'published',
    warranty_text: '1 Year Official UniFi Replacement',
    specs: {
      wifi_standard: 'Wi-Fi 6',
      bands: 'Dual-band',
      max_speed_mbps: 3000,
      poe: '802.3at',
      ethernet_ports: '1x GbE RJ45',
      mounting: 'Ceiling',
      max_clients: 350,
      management: 'Controller',
      environment: 'Indoor',
      antennas: 'Internal 4x4 MIMO'
    }
  },
  {
    category_slug: 'access-points',
    name: 'Demo Wi-Fi 6E High-Density Cloud AP 5400 Mbps',
    slug: 'demo-wifi-6e-high-density-cloud-ap-5400-mbps',
    brand: 'Aruba',
    model: 'AP-635',
    short_description: 'Tri-band Wi-Fi 6E Access Point utilizing the ultra-wide 6GHz wireless spectrum.',
    description: 'Delivers zero-interference enterprise bandwidth with centralized Aruba Central cloud management.',
    price: 145000,
    sale_price: 125000,
    offer_ends_at: new Date(Date.now() + 3 * 86400000),
    is_weekly_offer: true,
    is_featured: true,
    stock_qty: 3,
    low_stock_threshold: 2,
    status: 'published',
    warranty_text: 'Limited Lifetime Warranty',
    specs: {
      wifi_standard: 'Wi-Fi 6E',
      bands: 'Tri-band',
      max_speed_mbps: 5400,
      poe: '802.3bt',
      ethernet_ports: '2x 2.5GbE SmartRate',
      mounting: 'Ceiling',
      max_clients: 512,
      management: 'Cloud',
      environment: 'Indoor',
      antennas: 'Omni-directional Tri-Band'
    }
  },
  {
    category_slug: 'access-points',
    name: 'Demo Outdoor IP67 Weatherproof Wi-Fi 6 AP',
    slug: 'demo-outdoor-ip67-weatherproof-wifi-6-ap',
    brand: 'Ruijie Reyee',
    model: 'RG-RAP6260(H)-D',
    short_description: 'Rugged outdoor Wi-Fi 6 AP with IP68 lightning protection for campuses and yards.',
    description: 'Long-distance directional antennas with high-temperature resistance and seamless Reyee Cloud mesh.',
    price: 89000,
    sale_price: null,
    offer_ends_at: null,
    is_weekly_offer: false,
    is_featured: true,
    stock_qty: 6,
    low_stock_threshold: 2,
    status: 'published',
    warranty_text: '3 Years Warranty',
    specs: {
      wifi_standard: 'Wi-Fi 6',
      bands: 'Dual-band',
      max_speed_mbps: 1800,
      poe: '802.3at',
      ethernet_ports: '1x GbE, 1x SFP Port',
      mounting: 'Wall',
      max_clients: 200,
      management: 'Cloud',
      environment: 'Outdoor',
      antennas: 'External Detachable Antennas'
    }
  },
  {
    category_slug: 'access-points',
    name: 'Demo In-Wall Hotel & Office Hospitality AP',
    slug: 'demo-in-wall-hotel-office-hospitality-ap',
    brand: 'TP-Link Omada',
    model: 'EAP615-Wall',
    short_description: 'Sleek in-wall plate Wi-Fi 6 AP with 4 downstream RJ45 ethernet pass-through ports.',
    description: 'Fits standard wall junction boxes, ideal for hotels, boardrooms, and smart homes.',
    price: 38000,
    sale_price: 32000,
    offer_ends_at: new Date(Date.now() + 6 * 86400000),
    is_weekly_offer: false,
    is_featured: false,
    stock_qty: 2,
    low_stock_threshold: 3,
    status: 'published',
    warranty_text: '2 Years Warranty',
    specs: {
      wifi_standard: 'Wi-Fi 6',
      bands: 'Dual-band',
      max_speed_mbps: 1800,
      poe: '802.3af',
      ethernet_ports: '4x GbE RJ45 Out, 1x Uplink',
      mounting: 'Wall',
      max_clients: 120,
      management: 'Controller',
      environment: 'Indoor',
      antennas: 'Internal Low-Profile'
    }
  },
  {
    category_slug: 'access-points',
    name: 'Demo Standalone Long-Range Wi-Fi 5 AP',
    slug: 'demo-standalone-long-range-wifi-5-ap',
    brand: 'MikroTik',
    model: 'cAP ac',
    short_description: 'Versatile RouterOS powered dual-band ceiling and wall mount access point.',
    description: 'Flexible RouterOS feature set with dual Ethernet ports and PoE passthrough.',
    price: 31000,
    sale_price: null,
    offer_ends_at: null,
    is_weekly_offer: false,
    is_featured: false,
    stock_qty: 0,
    low_stock_threshold: 2,
    status: 'published',
    warranty_text: '1 Year Warranty',
    specs: {
      wifi_standard: 'Wi-Fi 5',
      bands: 'Dual-band',
      max_speed_mbps: 1167,
      poe: 'Passive',
      ethernet_ports: '2x GbE RJ45',
      mounting: 'Ceiling',
      max_clients: 100,
      management: 'Standalone',
      environment: 'Indoor',
      antennas: 'Omni 2.5 dBi'
    }
  },
  {
    category_slug: 'access-points',
    name: 'Demo Wi-Fi 7 Flagship 10Gbps AP',
    slug: 'demo-wifi-7-flagship-10gbps-ap',
    brand: 'Cisco Meraki',
    model: 'MR78-X',
    short_description: 'Next-generation Wi-Fi 7 multi-link operation (MLO) access point.',
    description: 'Unprecedented speeds and ultra-low latency for VR, 8K video conferencing, and automated factories.',
    price: 320000,
    sale_price: null,
    offer_ends_at: null,
    is_weekly_offer: false,
    is_featured: false,
    stock_qty: 2,
    low_stock_threshold: 1,
    status: 'draft',
    warranty_text: 'Lifetime Meraki Enterprise Support',
    specs: {
      wifi_standard: 'Wi-Fi 7',
      bands: 'Tri-band',
      max_speed_mbps: 9600,
      poe: '802.3bt',
      ethernet_ports: '1x 10GbE mGig Port',
      mounting: 'Ceiling',
      max_clients: 700,
      management: 'Cloud',
      environment: 'Indoor',
      antennas: 'Internal 8x8 Smart Beamforming'
    }
  }
];

async function seedDemo() {
  if (process.env.NODE_ENV === 'production') {
    console.error('⛔ Refusing to run seed-demo in production!');
    process.exit(1);
  }

  if (!pool) {
    console.error('❌ DATABASE_URL is not set.');
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    console.log('📦 Seeding demo products and generating local SVG images...');

    const demoDir = path.join(__dirname, '../../public/uploads/demo');
    fs.mkdirSync(demoDir, { recursive: true });

    // Lookup categories
    const catRes = await client.query('SELECT id, slug, name FROM categories');
    const catMap = new Map(catRes.rows.map((r) => [r.slug, r]));

    for (const prod of DEMO_PRODUCTS) {
      const cat = catMap.get(prod.category_slug);
      if (!cat) {
        console.warn(`Category slug ${prod.category_slug} not found, skipping product ${prod.name}`);
        continue;
      }

      // Generate 2 SVG images
      const img1Name = `${prod.slug}-1.svg`;
      const img2Name = `${prod.slug}-2.svg`;
      const img1Path = path.join(demoDir, img1Name);
      const img2Path = path.join(demoDir, img2Name);

      fs.writeFileSync(img1Path, createSvgPlaceholder(prod.model, cat.name, '#0E1626', '#22D3EE'), 'utf8');
      fs.writeFileSync(img2Path, createSvgPlaceholder(prod.brand, cat.name, '#141F36', '#8B5CF6'), 'utf8');

      const img1Url = `/uploads/demo/${img1Name}`;
      const img2Url = `/uploads/demo/${img2Name}`;

      const res = await client.query(
        `INSERT INTO products (
          category_id, name, slug, brand, model, short_description, description,
          price, sale_price, offer_ends_at, is_weekly_offer, is_featured, stock_qty,
          low_stock_threshold, status, specs, warranty_text
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
        ON CONFLICT (slug) DO UPDATE
        SET price = EXCLUDED.price,
            sale_price = EXCLUDED.sale_price,
            offer_ends_at = EXCLUDED.offer_ends_at,
            is_weekly_offer = EXCLUDED.is_weekly_offer,
            is_featured = EXCLUDED.is_featured,
            stock_qty = EXCLUDED.stock_qty,
            status = EXCLUDED.status,
            specs = EXCLUDED.specs,
            warranty_text = EXCLUDED.warranty_text
        RETURNING id`,
        [
          cat.id,
          prod.name,
          prod.slug,
          prod.brand,
          prod.model,
          prod.short_description,
          prod.description,
          prod.price,
          prod.sale_price,
          prod.offer_ends_at,
          prod.is_weekly_offer,
          prod.is_featured,
          prod.stock_qty,
          prod.low_stock_threshold,
          prod.status,
          JSON.stringify(prod.specs),
          prod.warranty_text
        ]
      );

      const productId = res.rows[0].id;

      // Upsert product images
      await client.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
      await client.query(
        `INSERT INTO product_images (product_id, url, thumb_url, alt_text, sort_order, is_primary)
         VALUES ($1, $2, $2, $3, 1, true),
                ($1, $4, $4, $5, 2, false)`,
        [productId, img1Url, `${prod.name} Primary View`, img2Url, `${prod.name} Detail View`]
      );

      console.log(`✅ Demo product ready: ${prod.name}`);
    }

    console.log('🎉 Demo data seeded successfully with local SVG placeholders.');
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seedDemo().catch((err) => {
    console.error('Demo seeding error:', err);
    process.exit(1);
  });
}

module.exports = { seedDemo, DEMO_PRODUCTS };
