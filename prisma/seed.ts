import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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
      sector: 'IT',
      description:
        'Full-service IT consulting and software development firm specializing in cloud migration, cybersecurity, and digital transformation for public sector clients.',
      capabilities: [
        'Software Development',
        'Cloud Migration',
        'Cybersecurity',
        'IT Consulting',
        'Digital Transformation',
      ],
      certifications: ['ISO 27001', 'Cyber Essentials Plus', 'ISO 9001'],
      ownerId: demoUser.id,
    },
  })
  console.log('✓ Demo company created:', demoCompany.name)

  // 3. Create sample tenders
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

  // 4. Create sample bid
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

  console.log('\nSeed complete! Summary:')
  console.log('- 1 demo user (demo@bidflow.com / Demo1234!)')
  console.log('- 1 demo company (TechBuild Solutions Ltd.)')
  console.log('- 3 sample tenders (2 IT, 1 Construction)')
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
