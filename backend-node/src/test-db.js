const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Testing dashboard queries...');
  try {
    const dealerId = 1; // Assuming dealer 1 exists
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    console.log('1. Shops count');
    const total_shops = await prisma.shop.count({ where: { dealer_id: dealerId } });
    console.log({ total_shops });
    
    console.log('2. Orders today count');
    const orders_today = await prisma.order.count({
      where: { dealer_id: dealerId, order_date: { gte: startOfDay } }
    });
    console.log({ orders_today });
    
    console.log('3. Recent orders');
    const recent_orders = await prisma.order.findMany({
      where: { dealer_id: dealerId },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: { shop: { include: { location: true } }, items: true }
    });
    console.log(`Found ${recent_orders.length} orders`);
    
    console.log('Success!');
  } catch (err) {
    console.error('Error during query:', err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
