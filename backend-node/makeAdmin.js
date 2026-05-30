const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2];
  if (!username) {
    console.error('Please provide a username as an argument.');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { username } });
  
  if (!user) {
    console.error(`User '${username}' not found in the database.`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { username },
    data: { is_admin: true }
  });

  console.log(`Success! User '${username}' is now an Admin!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
