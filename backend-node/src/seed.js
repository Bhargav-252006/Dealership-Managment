const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create user & dealer
  const user = await prisma.user.upsert({
    where: { username: 'surya' },
    update: {},
    create: {
      username: 'surya',
      password: 'surya@123',
      first_name: 'Surya',
      last_name: 'Dealer',
      email: 'surya@dealerconnect.com',
    }
  });

  const dealer = await prisma.dealer.upsert({
    where: { user_id: user.id },
    update: {},
    create: {
      user_id: user.id,
      phone: '9876543210',
      business_type: 'Oil',
    }
  });

  // ── Companies & Products ──
  const productData = [
    {
      name: 'Gold Drop', category: 'Oil',
      products: [
        { product_name: 'Gold Drop', unit_size: '1 Litre',  units_per_box: 16, default_price: 171 },
        { product_name: 'Gold Drop', unit_size: '5 Litre',  units_per_box: 4,  default_price: 885 },
        { product_name: 'Gold Drop', unit_size: '15 Litre', units_per_box: 1,  default_price: 2580 },
      ]
    },
    {
      name: 'Sunsure', category: 'Oil',
      products: [
        { product_name: 'Sunsure', unit_size: '325 g',   units_per_box: null, default_price: 62 },
        { product_name: 'Sunsure', unit_size: '375 g',   units_per_box: null, default_price: 64 },
        { product_name: 'Sunsure', unit_size: '700 g',   units_per_box: 16,   default_price: 121 },
        { product_name: 'Sunsure', unit_size: '2 Litre', units_per_box: null, default_price: 303 },
        { product_name: 'Sunsure', unit_size: '3 Litre', units_per_box: null, default_price: 433 },
        { product_name: 'Sunsure', unit_size: '5 Litre', units_per_box: 4,   default_price: 485 },
        { product_name: 'Sunsure', unit_size: '15 Litre',units_per_box: 1,   default_price: 2380 },
      ]
    },
    {
      name: 'Freedom', category: 'Oil',
      products: [
        { product_name: 'Freedom', unit_size: '1 Litre',  units_per_box: 16, default_price: 170 },
        { product_name: 'Freedom', unit_size: '5 Litre',  units_per_box: 4,  default_price: 890 },
        { product_name: 'Freedom', unit_size: '15 Litre', units_per_box: 1,  default_price: 2580 },
      ]
    },
    {
      name: 'Natural', category: 'Oil',
      products: [
        { product_name: 'Natural', unit_size: '1 Litre',  units_per_box: 16, default_price: 168 },
        { product_name: 'Natural', unit_size: '5 Litre',  units_per_box: 4,  default_price: 870 },
        { product_name: 'Natural', unit_size: '15 Litre', units_per_box: 1,  default_price: 2500 },
      ]
    },
    {
      name: 'Health Life', category: 'Oil',
      products: [
        { product_name: 'Health Life', unit_size: '700 g',   units_per_box: 16, default_price: 130 },
        { product_name: 'Health Life', unit_size: '1 Litre',  units_per_box: 16, default_price: 150 },
        { product_name: 'Health Life', unit_size: '5 Litre',  units_per_box: 4,  default_price: 780 },
        { product_name: 'Health Life', unit_size: '15 Litre', units_per_box: 1,  default_price: 2300 },
      ]
    },
    {
      name: 'Health Heart', category: 'Oil',
      products: [
        { product_name: 'Health Heart', unit_size: '700 g',   units_per_box: 16, default_price: 125 },
        { product_name: 'Health Heart', unit_size: '1 Litre',  units_per_box: 16, default_price: 160 },
        { product_name: 'Health Heart', unit_size: '5 Litre',  units_per_box: 4,  default_price: 780 },
        { product_name: 'Health Heart', unit_size: '15 Litre', units_per_box: 1,  default_price: 2350 },
      ]
    },
    {
      name: 'Deepam Oil', category: 'Oil',
      products: [
        { product_name: 'Deepam Oil', unit_size: '100 ml', units_per_box: 180, default_price: 0 },
        { product_name: 'Deepam Oil', unit_size: '200 ml', units_per_box: 180, default_price: 0 },
        { product_name: 'Deepam Oil', unit_size: '500 ml', units_per_box: 180, default_price: 0 },
        { product_name: 'Deepam Oil', unit_size: '1 Litre',units_per_box: 180, default_price: 0 },
      ]
    },
    {
      name: 'Palm Oil', category: 'Oil',
      products: [
        { product_name: 'Palm Oil', unit_size: '1 Litre', units_per_box: 16, default_price: 120 },
      ]
    },
  ];

  for (const co of productData) {
    const company = await prisma.company.upsert({
      where: { name: co.name },
      update: { category: co.category },
      create: { name: co.name, category: co.category }
    });

    for (const p of co.products) {
      await prisma.product.create({
        data: {
          company_id: company.id,
          product_name: p.product_name,
          unit_size: p.unit_size,
          units_per_box: p.units_per_box,
          default_price: p.default_price,
        }
      });
    }
    console.log(`✓ ${co.name} (${co.products.length} products)`);
  }

  console.log('\n✅ Seeding complete!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
