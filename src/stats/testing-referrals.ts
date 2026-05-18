import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testActualResults() {
  console.log('--- FETCHING ACTUAL REFERRAL STATS ---');
  
  // Replace this with a real Teacher ID from your DB to test the specific linkage
  const testTeacherId = "some-teacher-id"; // 

  const teacher = await prisma.user_Details.findUnique({
    where: { id: testTeacherId },
    select: { referral_code: true, user_name: true }
  });

  if (!teacher || !teacher.referral_code) {
    console.error("Teacher not found or has no code.");
    return;
  }

  const students = await prisma.user_Details.findMany({
    where: { referral_code: teacher.referral_code },
    include: { subscriptions: true }
  });

  console.log(`Teacher: ${teacher.user_name} (${teacher.referral_code})`);
  console.log(`Referred Students Found: ${students.length}`);
  
  students.forEach(s => {
    console.log(`- Student: ${s.user_name} | Subs: ${s.subscriptions.length}`);
  });
}

testActualResults()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());