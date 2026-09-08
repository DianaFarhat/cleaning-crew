import "dotenv/config";
import {PrismaClient} from "@/app/generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";

const prisma= new PrismaClient({
    adapter: new PrismaPg({connectionString: process.env.DATABASE_URL}),
});

async function main(){
  await prisma.user.deleteMany();
    // Admin
  const admin = await prisma.user.create({
    data: {
      username: "Jad Khoury",
      role: "admin",
      email: "jad.khoury@yallacrew.com",
      email_verified: true,
      password_hash: "passwordHash",
      phone_number: "+96170123456",
    },
  });

  // Cleaners
  const cleaner1 = await prisma.user.create({
    data: {
      username: "Maya Fares",
      role: "cleaner",
      email: "maya.fares@yallacrew.com",
      email_verified: true,
      password_hash: "passwordHash",
      phone_number: "+96171234567",
      cleaner_status: "active",
    },
  });

  const cleaner2 = await prisma.user.create({
    data: {
      username: "Rami Nasrallah",
      role: "cleaner",
      email: "rami.nasrallah@yallacrew.com",
      email_verified: true,
      password_hash: "passwordHash",
      phone_number: "+96176345678",
      cleaner_status: "active",
    },
  });

  // Chalet owners
  const ownerNames = [
    { username: "Karim Aoun", email: "karim.aoun@gmail.com", phone: "+96178456789" },
    { username: "Layal Haddad", email: "layal.haddad@gmail.com", phone: "+96179567890" },
    { username: "Elie Mansour", email: "elie.mansour@gmail.com", phone: "+96170678901" },
    { username: "Nour Chalhoub", email: "nour.chalhoub@gmail.com", phone: "+96171789012" },
    { username: "Tarek Saade", email: "tarek.saade@gmail.com", phone: "+96176890123" },
  ];

  const owners = [];
  for (const o of ownerNames) {
    const owner = await prisma.user.create({
      data: {
        username: o.username,
        role: "owner",
        email: o.email,
        email_verified: true,
        password_hash: "passwordHash",
        phone_number: o.phone,
      },
    });
    owners.push(owner);
  }




}


//Disconnect when done
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });