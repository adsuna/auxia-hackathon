import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.interview.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.match.deleteMany();
  await prisma.like.deleteMany();
  await prisma.exposure.deleteMany();
  await prisma.report.deleteMany();
  await prisma.job.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create students
  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice.smith@university.edu',
        role: Role.STUDENT,
        verifiedAt: new Date(),
        studentProfile: {
          create: {
            name: 'Alice Smith',
            branch: 'Computer Science',
            year: 2024,
            headline: 'Full-stack developer passionate about AI and machine learning',
            skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning'],
            projectUrl: 'https://github.com/alice/ai-chatbot',
            resumeUrl: 'https://example.com/alice-resume.pdf',
          }
        }
      },
      include: { studentProfile: true }
    }),
    prisma.user.create({
      data: {
        email: 'bob.johnson@university.edu',
        role: Role.STUDENT,
        verifiedAt: new Date(),
        studentProfile: {
          create: {
            name: 'Bob Johnson',
            branch: 'Information Technology',
            year: 2025,
            headline: 'Backend developer with expertise in cloud technologies',
            skills: ['Java', 'Spring Boot', 'AWS', 'Docker', 'Kubernetes'],
            projectUrl: 'https://github.com/bob/microservices-app',
            videoUrl: 'https://example.com/bob-intro.mp4',
          }
        }
      },
      include: { studentProfile: true }
    }),
    prisma.user.create({
      data: {
        email: 'carol.davis@university.edu',
        role: Role.STUDENT,
        verifiedAt: new Date(),
        studentProfile: {
          create: {
            name: 'Carol Davis',
            branch: 'Computer Science',
            year: 2024,
            headline: 'Frontend specialist with UX/UI design background',
            skills: ['React', 'TypeScript', 'CSS', 'Figma', 'Next.js'],
            projectUrl: 'https://github.com/carol/design-system',
            resumeUrl: 'https://example.com/carol-resume.pdf',
            videoUrl: 'https://example.com/carol-intro.mp4',
          }
        }
      },
      include: { studentProfile: true }
    }),
    prisma.user.create({
      data: {
        email: 'david.wilson@university.edu',
        role: Role.STUDENT,
        verifiedAt: new Date(),
        studentProfile: {
          create: {
            name: 'David Wilson',
            branch: 'Data Science',
            year: 2025,
            headline: 'Data scientist with focus on predictive analytics',
            skills: ['Python', 'R', 'SQL', 'TensorFlow', 'Pandas'],
            projectUrl: 'https://github.com/david/stock-predictor',
          }
        }
      },
      include: { studentProfile: true }
    }),
    prisma.user.create({
      data: {
        email: 'eve.brown@university.edu',
        role: Role.STUDENT,
        verifiedAt: new Date(),
        studentProfile: {
          create: {
            name: 'Eve Brown',
            branch: 'Computer Engineering',
            year: 2024,
            headline: 'Mobile app developer with cross-platform expertise',
            skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'],
            projectUrl: 'https://github.com/eve/fitness-tracker',
            resumeUrl: 'https://example.com/eve-resume.pdf',
          }
        }
      },
      include: { studentProfile: true }
    })
  ]);

  // Create recruiters
  const recruiters = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.recruiter@techcorp.com',
        role: Role.RECRUITER,
        verifiedAt: new Date(),
        recruiterProfile: {
          create: {
            name: 'John Recruiter',
            org: 'TechCorp Inc.',
            title: 'Senior Technical Recruiter',
          }
        }
      },
      include: { recruiterProfile: true }
    }),
    prisma.user.create({
      data: {
        email: 'sarah.hiring@innovate.io',
        role: Role.RECRUITER,
        verifiedAt: new Date(),
        recruiterProfile: {
          create: {
            name: 'Sarah Hiring',
            org: 'Innovate Solutions',
            title: 'Talent Acquisition Manager',
          }
        }
      },
      include: { recruiterProfile: true }
    }),
    prisma.user.create({
      data: {
        email: 'mike.talent@startup.com',
        role: Role.RECRUITER,
        verifiedAt: new Date(),
        recruiterProfile: {
          create: {
            name: 'Mike Talent',
            org: 'StartupXYZ',
            title: 'Head of People',
          }
        }
      },
      include: { recruiterProfile: true }
    })
  ]);

  // Create jobs
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        recruiterId: recruiters[0].id,
        title: 'Full Stack Developer Intern',
        description: 'Join our team to build scalable web applications using modern technologies. Work on real projects that impact millions of users.',
        skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
        batch: 2024,
        location: 'San Francisco, CA',
        ctcMin: 80000,
        ctcMax: 120000,
        videoUrl: 'https://example.com/techcorp-intro.mp4',
      }
    }),
    prisma.job.create({
      data: {
        recruiterId: recruiters[0].id,
        title: 'Backend Engineer - New Grad',
        description: 'Build robust APIs and microservices. Experience with cloud platforms preferred.',
        skills: ['Java', 'Spring Boot', 'Docker', 'Kubernetes', 'AWS'],
        batch: 2025,
        location: 'Remote',
        ctcMin: 90000,
        ctcMax: 130000,
      }
    }),
    prisma.job.create({
      data: {
        recruiterId: recruiters[1].id,
        title: 'Frontend Developer',
        description: 'Create beautiful and responsive user interfaces. Work closely with design team.',
        skills: ['React', 'TypeScript', 'CSS', 'Next.js', 'Figma'],
        batch: 2024,
        location: 'New York, NY',
        ctcMin: 75000,
        ctcMax: 110000,
        videoUrl: 'https://example.com/innovate-intro.mp4',
      }
    }),
    prisma.job.create({
      data: {
        recruiterId: recruiters[1].id,
        title: 'Data Scientist Intern',
        description: 'Apply machine learning to solve business problems. Work with large datasets.',
        skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Pandas'],
        batch: 2025,
        location: 'Boston, MA',
        ctcMin: 70000,
        ctcMax: 100000,
      }
    }),
    prisma.job.create({
      data: {
        recruiterId: recruiters[2].id,
        title: 'Mobile App Developer',
        description: 'Build cross-platform mobile applications. Fast-paced startup environment.',
        skills: ['React Native', 'Flutter', 'Firebase', 'JavaScript', 'Swift'],
        batch: 2024,
        location: 'Austin, TX',
        ctcMin: 85000,
        ctcMax: 125000,
      }
    })
  ]);

  // Create some likes (but not mutual matches yet)
  await Promise.all([
    // Alice likes multiple jobs
    prisma.like.create({
      data: {
        fromUser: students[0].id,
        toType: 'JOB',
        toId: jobs[0].id,
      }
    }),
    prisma.like.create({
      data: {
        fromUser: students[0].id,
        toType: 'JOB',
        toId: jobs[2].id,
      }
    }),
    // Bob likes backend job
    prisma.like.create({
      data: {
        fromUser: students[1].id,
        toType: 'JOB',
        toId: jobs[1].id,
      }
    }),
    // Recruiters like students
    prisma.like.create({
      data: {
        fromUser: recruiters[0].id,
        toType: 'STUDENT',
        toId: students[0].studentProfile!.userId,
      }
    }),
    prisma.like.create({
      data: {
        fromUser: recruiters[1].id,
        toType: 'STUDENT',
        toId: students[2].studentProfile!.userId,
      }
    }),
  ]);

  // Create mutual matches
  const matches = await Promise.all([
    // Alice and TechCorp Full Stack role (mutual like)
    prisma.match.create({
      data: {
        studentId: students[0].studentProfile!.userId,
        jobId: jobs[0].id,
      }
    }),
    // Carol and Innovate Frontend role (mutual like)
    prisma.match.create({
      data: {
        studentId: students[2].studentProfile!.userId,
        jobId: jobs[2].id,
      }
    }),
  ]);

  // Create interview slots for matched jobs
  const slots = await Promise.all([
    // Slots for TechCorp Full Stack role
    prisma.slot.create({
      data: {
        jobId: jobs[0].id,
        startTs: new Date('2024-12-01T10:00:00Z'),
        endTs: new Date('2024-12-01T10:30:00Z'),
      }
    }),
    prisma.slot.create({
      data: {
        jobId: jobs[0].id,
        startTs: new Date('2024-12-01T14:00:00Z'),
        endTs: new Date('2024-12-01T14:30:00Z'),
      }
    }),
    prisma.slot.create({
      data: {
        jobId: jobs[0].id,
        startTs: new Date('2024-12-02T09:00:00Z'),
        endTs: new Date('2024-12-02T09:30:00Z'),
        isBooked: true, // This one is already booked
      }
    }),
    // Slots for Innovate Frontend role
    prisma.slot.create({
      data: {
        jobId: jobs[2].id,
        startTs: new Date('2024-12-01T11:00:00Z'),
        endTs: new Date('2024-12-01T11:30:00Z'),
      }
    }),
    prisma.slot.create({
      data: {
        jobId: jobs[2].id,
        startTs: new Date('2024-12-01T15:00:00Z'),
        endTs: new Date('2024-12-01T15:30:00Z'),
      }
    }),
  ]);

  // Create a booked interview
  await prisma.interview.create({
    data: {
      matchId: matches[0].id,
      slotId: slots[2].id, // The booked slot
      meetUrl: 'https://meet.jit.si/swipehire-alice-techcorp-123',
      icsPath: '/calendar/alice-techcorp-interview.ics',
      status: 'BOOKED',
    }
  });

  // Create some exposures (tracking what users have seen)
  await Promise.all([
    prisma.exposure.create({
      data: {
        userId: students[0].id,
        entityType: 'JOB',
        entityId: jobs[0].id,
      }
    }),
    prisma.exposure.create({
      data: {
        userId: students[0].id,
        entityType: 'JOB',
        entityId: jobs[1].id,
      }
    }),
    prisma.exposure.create({
      data: {
        userId: recruiters[0].id,
        entityType: 'STUDENT',
        entityId: students[0].studentProfile!.userId,
      }
    }),
  ]);

  // Create a sample report
  await prisma.report.create({
    data: {
      reporterUserId: students[1].id,
      entityType: 'JOB',
      entityId: jobs[4].id,
      reason: 'Misleading job description',
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created:`);
  console.log(`   - ${students.length} students`);
  console.log(`   - ${recruiters.length} recruiters`);
  console.log(`   - ${jobs.length} jobs`);
  console.log(`   - ${matches.length} matches`);
  console.log(`   - ${slots.length} interview slots`);
  console.log(`   - 1 booked interview`);
  console.log(`   - Sample likes, exposures, and reports`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });