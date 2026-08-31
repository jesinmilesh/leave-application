// Master Seed Script for PEC DLPMS - Safe & Idempotent Seeding for Production Render Setup
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PEC DLPMS Idempotent Database Seed...');

  // 1. Seed Department Master Records
  const departments = [
    { code: 'CSE (CYBER SECURITY)', name: 'CSE - Cyber Security' },
    { code: 'CSE (AIML)', name: 'CSE - Artificial Intelligence & Machine Learning' },
    { code: 'CSE', name: 'Computer Science and Engineering' },
    { code: 'AIDS', name: 'Artificial Intelligence & Data Science' },
    { code: 'IT', name: 'Information Technology' },
    { code: 'ECE', name: 'Electronics and Communication Engineering' },
    { code: 'EEE', name: 'Electrical and Electronics Engineering' },
    { code: 'CSBS', name: 'Computer Science & Business Systems' },
    { code: 'MECHANICAL', name: 'Mechanical Engineering' }
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name },
      create: dept
    });
  }
  console.log('✅ Department master records verified.');

  // Hash default initial password: PEC@Leave26!
  const passwordHash = await bcrypt.hash('PEC@Leave26!', 12);
  console.log('🔒 Initial password PEC@Leave26! hashed successfully.');

  // Helper for idempotent User creation
  async function seedAccount({ email, role, fullName, extraData }) {
    let existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
      console.log(`👤 Creating initial account: ${fullName} (${email}) [${role}]...`);
      const createPayload = {
        email,
        passwordHash,
        role,
        isFirstLogin: true
      };

      if (role === 'MENTOR') {
        createPayload.mentor = {
          create: {
            fullName,
            department: extraData.department || 'CSE (CYBER SECURITY)'
          }
        };
      } else if (role === 'HOD') {
        createPayload.hod = {
          create: {
            fullName,
            department: extraData.department || 'CSE (CYBER SECURITY)'
          }
        };
      } else if (role === 'STUDENT') {
        createPayload.student = {
          create: {
            fullName,
            registerNumber: extraData.registerNumber,
            department: extraData.department,
            year: extraData.year,
            section: extraData.section,
            hostelBlock: extraData.hostelBlock,
            roomNo: extraData.roomNo,
            mentorId: extraData.mentorId
          }
        };
      } else {
        createPayload.staff = {
          create: {
            fullName,
            role
          }
        };
      }

      existingUser = await prisma.user.create({
        data: createPayload,
        include: { mentor: true, hod: true, student: true, staff: true }
      });
    } else {
      console.log(`ℹ️ Account already exists: ${fullName} (${email}) - skipping duplicate creation.`);
    }

    return existingUser;
  }

  // 1. Mentor Account: Kalaimani
  const mentorUser = await seedAccount({
    email: 'mentor.cybersec@prathyusha.edu.in',
    role: 'MENTOR',
    fullName: 'Kalaimani',
    extraData: { department: 'CSE (CYBER SECURITY)' }
  });

  const mentorProfile = mentorUser.mentor || await prisma.mentor.findUnique({ where: { userId: mentorUser.id } });

  // 2. HOD Account: Anithalakshmi
  await seedAccount({
    email: 'hod.cybersec@prathyusha.edu.in',
    role: 'HOD',
    fullName: 'Anithalakshmi',
    extraData: { department: 'CSE (CYBER SECURITY)' }
  });

  // 3. Student Account: Jesin Milesh
  await seedAccount({
    email: 'jesinmilesh@gmail.com',
    role: 'STUDENT',
    fullName: 'Jesin Milesh',
    extraData: {
      registerNumber: '111424149024',
      department: 'CSE (CYBER SECURITY)',
      year: '3rd Year',
      section: 'A',
      hostelBlock: 'Block A - Boys Hostel',
      roomNo: 'AG2',
      mentorId: mentorProfile ? mentorProfile.id : null
    }
  });

  // 4. Warden Account: Ravi
  await seedAccount({
    email: 'warden@prathyusha.edu.in',
    role: 'WARDEN',
    fullName: 'Ravi',
    extraData: {}
  });

  // 5. Main Gate Account: Main Gate Security
  await seedAccount({
    email: 'gate@prathyusha.edu.in',
    role: 'MAIN_GATE',
    fullName: 'Main Gate Security',
    extraData: {}
  });

  // 6. Principal Account: Principal
  await seedAccount({
    email: 'principal@prathyusha.edu.in',
    role: 'PRINCIPAL',
    fullName: 'Principal',
    extraData: {}
  });

  // 7. Admin Account: System Administrator
  await seedAccount({
    email: 'admin@prathyusha.edu.in',
    role: 'ADMIN',
    fullName: 'System Administrator',
    extraData: {}
  });

  console.log('✨ Seed process complete! Exactly 7 initial system accounts verified.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
