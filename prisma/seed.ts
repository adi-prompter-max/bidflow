import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { seedTenders } from './seeders/tenders'

// Load .env.local for DATABASE_URL
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Hash the demo password
  const passwordHash = await bcrypt.hash('Demo1234!', 10)

  // 1. Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@bidflow.com' },
    update: {},
    create: {
      id: 'demo-user-1',
      email: 'demo@bidflow.com',
      name: 'Demo User',
      password: passwordHash,
      emailVerified: new Date(),
    },
  })
  console.log('✓ Demo user created:', demoUser.email)

  // 2. Create demo company
  const demoCompany = await prisma.company.upsert({
    where: { id: 'demo-company-1' },
    update: {},
    create: {
      id: 'demo-company-1',
      name: 'TechBuild Solutions Ltd.',
      sectors: ['IT'],
      sectorSubcategories: {
        IT: ['Cloud Services', 'Cybersecurity', 'Software Development'],
      },
      country: 'United Kingdom',
      size: '51-200',
      website: 'https://techbuild.example.com',
      description:
        'Full-service IT consulting and software development firm specializing in cloud migration, cybersecurity, and digital transformation for public sector clients.',
      capabilityDescription:
        'We provide end-to-end IT services including cloud migration to Azure and AWS, comprehensive cybersecurity solutions with penetration testing and security audits, custom software development using modern frameworks, and digital transformation consulting for public sector organizations. Our team holds industry-leading certifications and has delivered over 50 successful projects for NHS trusts, local councils, and government agencies.',
      capabilityTags: [
        'Software Development',
        'Cloud Migration',
        'Cybersecurity',
        'IT Consulting',
        'Digital Transformation',
      ],
      ownerId: demoUser.id,
    },
  })
  console.log('✓ Demo company created:', demoCompany.name)

  // 3. Create demo certifications
  const cert1 = await prisma.certification.create({
    data: {
      name: 'ISO 27001',
      issuingBody: 'British Standards Institution (BSI)',
      issueDate: new Date('2023-03-15'),
      expiryDate: new Date('2026-03-14'),
      companyId: demoCompany.id,
    },
  })
  console.log('✓ Certification created:', cert1.name)

  const cert2 = await prisma.certification.create({
    data: {
      name: 'Cyber Essentials Plus',
      issuingBody: 'IASME Consortium',
      issueDate: new Date('2024-06-01'),
      expiryDate: new Date('2025-06-01'),
      companyId: demoCompany.id,
    },
  })
  console.log('✓ Certification created:', cert2.name)

  const cert3 = await prisma.certification.create({
    data: {
      name: 'ISO 9001',
      issuingBody: 'British Standards Institution (BSI)',
      issueDate: new Date('2022-09-20'),
      expiryDate: new Date('2025-09-19'),
      companyId: demoCompany.id,
    },
  })
  console.log('✓ Certification created:', cert3.name)

  // 4. Create demo projects
  const project1 = await prisma.project.create({
    data: {
      name: 'NHS Digital Transformation Platform',
      clientName: 'Greater Manchester NHS Trust',
      description:
        'Delivered a comprehensive digital transformation platform integrating patient records, appointment scheduling, and staff management for a 5,000-user NHS Trust. Implemented FHIR-compliant APIs, Azure cloud infrastructure, and achieved NHS Digital Technology Assessment Framework compliance. Successfully migrated legacy systems with zero downtime and provided comprehensive staff training.',
      sector: 'IT',
      valueRange: '500k - 1M',
      yearCompleted: 2023,
      companyId: demoCompany.id,
    },
  })
  console.log('✓ Project created:', project1.name)

  const project2 = await prisma.project.create({
    data: {
      name: 'Local Council Cybersecurity Overhaul',
      clientName: 'Birmingham City Council',
      description:
        'Conducted full cybersecurity audit covering 2,000+ endpoints, cloud services, and network infrastructure. Implemented penetration testing remediation, deployed advanced threat detection systems, and delivered security awareness training to 500+ staff members. Achieved Cyber Essentials Plus certification for the council and established ongoing vulnerability management program.',
      sector: 'IT',
      valueRange: '250k - 500k',
      yearCompleted: 2024,
      companyId: demoCompany.id,
    },
  })
  console.log('✓ Project created:', project2.name)

  // 5. Create sample tenders
  const now = new Date()
  const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  const twoMonthsLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
  const fourMonthsLater = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000)

  const tender1 = await prisma.tender.upsert({
    where: { id: 'tender-demo-1' },
    update: {},
    create: {
      id: 'tender-demo-1',
      title: 'Digital Transformation Platform for NHS Trust',
      description:
        'Seeking an experienced IT partner to design, develop, and implement a comprehensive digital transformation platform for a major NHS Trust. The solution must integrate patient records, appointment scheduling, and staff management systems while ensuring GDPR compliance and NHS Digital security standards. The platform should support 5,000+ concurrent users and handle sensitive patient data securely.',
      value: 750000,
      deadline: threeMonthsLater,
      sector: 'IT',
      source: 'TED',
      status: 'OPEN',
      requirements: JSON.stringify({
        technical: [
          'Cloud-native architecture (Azure preferred)',
          'FHIR-compliant APIs',
          'ISO 27001 certification required',
          'NHS Digital Technology Assessment Framework compliance',
        ],
        experience: [
          'Minimum 5 years delivering healthcare IT solutions',
          'Previous NHS project references',
          'Agile development methodology',
        ],
      }),
      documents: JSON.stringify([
        { name: 'Technical Specification', url: '#' },
        { name: 'Security Requirements', url: '#' },
      ]),
    },
  })
  console.log('✓ Tender 1 created:', tender1.title)

  const tender2 = await prisma.tender.upsert({
    where: { id: 'tender-demo-2' },
    update: {},
    create: {
      id: 'tender-demo-2',
      title: 'Cybersecurity Audit and Remediation',
      description:
        'Local council requires comprehensive cybersecurity audit covering all IT infrastructure, cloud services, and endpoint devices. Following the audit, successful bidder will implement recommended security improvements including penetration testing remediation, security awareness training, and ongoing vulnerability management.',
      value: 250000,
      deadline: twoMonthsLater,
      sector: 'IT',
      source: 'TED',
      status: 'OPEN',
      requirements: JSON.stringify({
        certifications: [
          'CREST certified penetration testers',
          'Cyber Essentials Plus',
          'ISO 27001',
        ],
        deliverables: [
          'Full security audit report',
          'Penetration testing results',
          'Remediation plan and implementation',
          'Staff training program',
        ],
      }),
    },
  })
  console.log('✓ Tender 2 created:', tender2.title)

  const tender3 = await prisma.tender.upsert({
    where: { id: 'tender-demo-3' },
    update: {},
    create: {
      id: 'tender-demo-3',
      title: 'School Building Renovation Programme',
      description:
        'Major renovation of three primary school buildings including structural repairs, classroom modernization, accessibility improvements, and energy efficiency upgrades. Work must be completed during summer holidays with minimal disruption. Contractor must have experience with occupied educational premises and hold relevant safety certifications.',
      value: 1200000,
      deadline: fourMonthsLater,
      sector: 'Construction',
      source: 'TED',
      status: 'OPEN',
      requirements: JSON.stringify({
        certifications: [
          'Constructionline Gold',
          'ISO 9001',
          'ISO 14001',
          'OHSAS 18001',
        ],
        experience: [
          'Minimum 3 education sector projects in last 5 years',
          'DBS-checked workforce',
          'Proven track record of on-time delivery',
        ],
      }),
    },
  })
  console.log('✓ Tender 3 created:', tender3.title)

  // 6. Create sample bid
  const demoBid = await prisma.bid.upsert({
    where: { id: 'bid-demo-1' },
    update: {},
    create: {
      id: 'bid-demo-1',
      tenderId: tender1.id,
      companyId: demoCompany.id,
      status: 'DRAFT',
      content: {
        executiveSummary:
          'TechBuild Solutions Ltd. is uniquely positioned to deliver this digital transformation platform. With over 8 years of healthcare IT experience and 12 successful NHS projects, we understand the critical importance of patient data security, system reliability, and user experience in healthcare environments.',
        methodology:
          'Our approach follows Agile principles with two-week sprints, continuous integration/deployment, and close collaboration with NHS Trust stakeholders. We will use Azure cloud infrastructure, FHIR-compliant APIs, and implement a microservices architecture for scalability and maintainability.',
        teamExperience:
          'Our project team includes: Lead Architect with 10+ years NHS experience, Security Specialist (CISSP certified), 4 Senior Developers (all SC cleared), and a dedicated Project Manager. We have delivered similar platforms for 3 NHS Trusts in the past 2 years.',
      },
    },
  })
  console.log('✓ Demo bid created for tender:', tender1.title)

  // 7. Delete existing non-demo tenders and seed mock tenders
  await prisma.tender.deleteMany({
    where: {
      id: {
        not: {
          startsWith: 'tender-demo',
        },
      },
    },
  })
  console.log('✓ Cleared existing non-demo tenders for re-seeding')

  await seedTenders(prisma)

  console.log('\nSeed complete! Summary:')
  console.log('- 1 demo user (demo@bidflow.com / Demo1234!)')
  console.log('- 1 demo company (TechBuild Solutions Ltd.)')
  console.log('- 3 certifications (ISO 27001, Cyber Essentials Plus, ISO 9001)')
  console.log('- 2 past projects (NHS platform, Council cybersecurity)')
  console.log('- 3 demo tenders + 50 mock tenders (30 IT, 20 Construction)')
  console.log('- 1 draft bid')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
