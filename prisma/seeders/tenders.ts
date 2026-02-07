import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'

// IT-specific tags
const IT_TAGS = [
  'Cloud Services',
  'Cybersecurity',
  'Software Development',
  'Data Analytics',
  'IT Consulting',
  'Digital Transformation',
  'Network Infrastructure',
  'Application Development',
  'DevOps',
  'System Integration',
]

// Construction-specific tags
const CONSTRUCTION_TAGS = [
  'Renovation',
  'Infrastructure',
  'New Build',
  'Facility Management',
  'Structural Engineering',
  'Project Management',
  'Building Services',
  'Civil Engineering',
  'Mechanical & Electrical',
  'Sustainable Construction',
]

// IT document types
const IT_DOCUMENTS = [
  'Technical Specification',
  'Security Requirements',
  'Data Protection Impact Assessment',
  'Service Level Agreement',
  'Integration Requirements',
  'Tender Notice',
  'Evaluation Criteria',
  'Contract Terms',
]

// Construction document types
const CONSTRUCTION_DOCUMENTS = [
  'Bill of Quantities',
  'Technical Drawings',
  'Site Safety Plan',
  'Environmental Impact Assessment',
  'Quality Assurance Plan',
  'Tender Notice',
  'Contract Conditions',
  'Method Statement',
]

// IT tender title prefixes
const IT_PREFIXES = [
  'Digital Transformation Platform',
  'Cloud Migration Services',
  'Cybersecurity Assessment',
  'Software Development',
  'IT Infrastructure Upgrade',
  'Data Analytics Platform',
  'Network Security Enhancement',
  'Application Modernization',
  'Enterprise System Integration',
  'IT Support Services',
]

// Construction tender title prefixes
const CONSTRUCTION_PREFIXES = [
  'Building Renovation',
  'Infrastructure Development',
  'New Build Project',
  'Facility Upgrade',
  'Road Construction',
  'School Refurbishment',
  'Office Building Construction',
  'Bridge Maintenance',
  'Public Facility Development',
  'Sustainable Building',
]

function generateITTender(index: number) {
  const value = faker.number.int({ min: 50000, max: 2000000 })
  const daysUntilDeadline = faker.number.int({ min: 7, max: 180 }) // 7 days to 6 months
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + daysUntilDeadline)

  // Select 3-5 random tags
  const numTags = faker.number.int({ min: 3, max: 5 })
  const tags = faker.helpers.arrayElements(IT_TAGS, numTags)

  // Select 4-6 random documents
  const numDocs = faker.number.int({ min: 4, max: 6 })
  const documents = faker.helpers.arrayElements(IT_DOCUMENTS, numDocs).map((name) => ({
    name,
    url: '#',
  }))

  const titlePrefix = faker.helpers.arrayElement(IT_PREFIXES)
  const clientType = faker.helpers.arrayElement([
    'NHS Trust',
    'Local Council',
    'Government Agency',
    'Public University',
    'Police Force',
  ])

  return {
    id: `tender-it-${index}`,
    title: `${titlePrefix} for ${clientType}`,
    description: `${faker.company.catchPhrase()}. ${faker.lorem.paragraph(3)} The solution must meet stringent security and compliance requirements, including GDPR compliance and government security standards. ${faker.lorem.paragraph(2)} Successful bidder will work closely with internal stakeholders to ensure seamless integration with existing systems.`,
    value,
    deadline,
    sector: 'IT',
    source: 'TED',
    status: faker.helpers.weightedArrayElement([
      { weight: 45, value: 'OPEN' as const },
      { weight: 3, value: 'CLOSED' as const },
      { weight: 2, value: 'AWARDED' as const },
    ]),
    requirements: JSON.stringify({
      tags,
      experience: faker.number.int({ min: 3, max: 10 }),
      certifications: faker.helpers.arrayElements(
        ['ISO 27001', 'Cyber Essentials Plus', 'ISO 9001', 'CREST', 'G-Cloud'],
        faker.number.int({ min: 1, max: 3 })
      ),
    }),
    documents: JSON.stringify(documents),
  }
}

function generateConstructionTender(index: number) {
  const value = faker.number.int({ min: 100000, max: 5000000 })
  const daysUntilDeadline = faker.number.int({ min: 14, max: 180 }) // 2 weeks to 6 months
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + daysUntilDeadline)

  // Select 3-5 random tags
  const numTags = faker.number.int({ min: 3, max: 5 })
  const tags = faker.helpers.arrayElements(CONSTRUCTION_TAGS, numTags)

  // Select 4-6 random documents
  const numDocs = faker.number.int({ min: 4, max: 6 })
  const documents = faker.helpers.arrayElements(CONSTRUCTION_DOCUMENTS, numDocs).map((name) => ({
    name,
    url: '#',
  }))

  const titlePrefix = faker.helpers.arrayElement(CONSTRUCTION_PREFIXES)
  const location = faker.helpers.arrayElement([
    'Central London',
    'Greater Manchester',
    'Birmingham',
    'Leeds',
    'Glasgow',
    'Bristol',
  ])

  return {
    id: `tender-construction-${index}`,
    title: `${titlePrefix} - ${location}`,
    description: `${faker.company.catchPhrase()}. ${faker.lorem.paragraph(3)} The project requires adherence to all relevant building regulations, health and safety standards, and environmental guidelines. ${faker.lorem.paragraph(2)} Work must be completed to the highest quality standards with minimal disruption to ongoing operations.`,
    value,
    deadline,
    sector: 'Construction',
    source: 'TED',
    status: faker.helpers.weightedArrayElement([
      { weight: 45, value: 'OPEN' as const },
      { weight: 3, value: 'CLOSED' as const },
      { weight: 2, value: 'AWARDED' as const },
    ]),
    requirements: JSON.stringify({
      tags,
      experience: faker.number.int({ min: 5, max: 15 }),
      certifications: faker.helpers.arrayElements(
        [
          'Constructionline Gold',
          'ISO 9001',
          'ISO 14001',
          'OHSAS 18001',
          'CHAS Accreditation',
          'SafeContractor',
        ],
        faker.number.int({ min: 2, max: 4 })
      ),
    }),
    documents: JSON.stringify(documents),
  }
}

export async function seedTenders(prisma: PrismaClient) {
  console.log('Seeding mock tenders...')

  const tenders = []

  // Generate 30 IT tenders
  for (let i = 1; i <= 30; i++) {
    tenders.push(generateITTender(i))
  }

  // Generate 20 Construction tenders
  for (let i = 1; i <= 20; i++) {
    tenders.push(generateConstructionTender(i))
  }

  const result = await prisma.tender.createMany({
    data: tenders,
    skipDuplicates: true,
  })

  console.log(`✓ Created ${result.count} mock tenders (30 IT, 20 Construction)`)
  return result
}
