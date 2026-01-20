import { PrismaClient, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

function randomPhone(index: number) {
  return `9${String(100000000 + index).slice(0, 9)}`;
}

function randomAadhar(index: number) {
  return `AADHAR${index}${Date.now()}`;
}

const courses = [
  "Web Development",
  "AI & Machine Learning",
  "Digital Marketing",
  "Cloud Computing",
  "Data Science",
];

const paymentStatuses = [
  PaymentStatus.PENDING,
  PaymentStatus.PAID,
  PaymentStatus.FAILED,
];

async function seedUsers() {
  const users = Array.from({ length: 150 }).map((_, i) => ({
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    userImg: "https://i.pravatar.cc/150",
    phoneNo: randomPhone(i),
    fatherName: `Father ${i + 1}`,
    motherName: `Mother ${i + 1}`,
    courseName: courses[i % courses.length],
    aadharCardNo: randomAadhar(i),
    aadharFront: "https://dummyimage.com/300x200",
    aadharBack: "https://dummyimage.com/300x200",
    marksheets: [
      "https://dummyimage.com/300x200",
      "https://dummyimage.com/300x200",
    ],
    address: `Address Line ${i + 1}, City, State`,
    paymentStatus: paymentStatuses[i % paymentStatuses.length],
  }));

  await prisma.userInfo.createMany({
    data: users,
  });

  console.log("✅ 150 users seeded successfully");
}

seedUsers()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
