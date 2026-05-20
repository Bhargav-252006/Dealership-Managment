const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding Shamirpet location and shops...');

  const dealer = await prisma.dealer.findFirst();
  if (!dealer) {
    console.error('No dealer found!');
    return;
  }

  const location = await prisma.location.upsert({
    where: {
      dealer_id_name: {
        dealer_id: dealer.id,
        name: 'Shamirpet (Medchal 501401)'
      }
    },
    update: {},
    create: {
      dealer_id: dealer.id,
      name: 'Shamirpet (Medchal 501401)'
    }
  });

  const shops = [
    { shop_name: 'Sri Venkateshwara Kirana & General Store', owner_name: 'Venkatesh', phone: '9876543211', address: 'Main Road, Shamirpet' },
    { shop_name: 'Laxmi Super Market', owner_name: 'Laxmi Narayana', phone: '9876543212', address: 'Near Bus Stand, Shamirpet' },
    { shop_name: 'Balaji Traders', owner_name: 'Balaji', phone: '9876543213', address: 'Medchal Road, Shamirpet' },
    { shop_name: 'Srinivasa Provisions', owner_name: 'Srinivas', phone: '9876543214', address: 'Bazaar Street, Shamirpet' },
    { shop_name: 'Shiva Sai Kirana', owner_name: 'Shiva', phone: '9876543215', address: 'Village Center, Shamirpet' }
  ];

  for (const s of shops) {
    await prisma.shop.create({
      data: {
        dealer_id: dealer.id,
        location_id: location.id,
        ...s
      }
    });
  }

  console.log('Successfully added Shamirpet shops!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
