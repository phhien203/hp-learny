const { PrismaClient } = require('@prisma/client')

const db = new PrismaClient()

async function seed() {
  try {
    await db.category.createMany({
      data: [
        { name: 'Phát triển bản thân' },
        { name: 'Artificial Intelligence' },
        { name: 'Blockchain Development' },
        { name: 'Cloud Computing' },
        { name: 'Cybersecurity' },
        { name: 'Data Analytics' },
        { name: 'Data Engineering' },
        { name: 'Data Governance' },
        { name: 'Data Integration' },
        { name: 'Data Mining' },
        { name: 'Data Modeling' },
        { name: 'Data Processing' },
        { name: 'Data Quality' },
        { name: 'Data Science' },
        { name: 'Data Security' },
        { name: 'Data Transformation' },
        { name: 'Data Visualization' },
        { name: 'Data Warehousing' },
        { name: 'Database Management' },
        { name: 'DevOps' },
        { name: 'Game Development' },
        { name: 'IT Infrastructure' },
        { name: 'Machine Learning' },
        { name: 'Mobile App Development' },
        { name: 'Network Security' },
        { name: 'Project Management' },
        { name: 'Software Engineering' },
        { name: 'Software Testing' },
        { name: 'System Administration' },
        { name: 'UI/UX Design' },
        { name: 'Web Development' },
      ],
    })

    console.log('Categories seeded successfully')
  } catch (error) {
    console.error('Error seeding categories:', error)
  } finally {
    await db.$disconnect()
  }
}

seed()
