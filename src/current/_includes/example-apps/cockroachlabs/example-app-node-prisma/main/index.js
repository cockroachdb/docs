const { PrismaClient } = require('@prisma/client')
const { v4: uuidv4 } = require('uuid')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "&application_name=$ docs_simplecrud_node-prisma",
    },
  },
})

const main = async () => {
  const customerIds = Array(10).fill().map(() => ({ id: uuidv4() }))
  const accountValues = Array(10).fill().map((_, index) => ({
    id: uuidv4(),
    customer_id: customerIds[index].id,
    balance: Math.floor(Math.random() * 1000)
  }))

  const insertCustomerRows = await prisma.customer.createMany({
    data: customerIds
  })

  console.log('Customer rows inserted.', insertCustomerRows)

  const insertAccountRows = await prisma.account.createMany({
    data: accountValues
  })

  console.log('Account rows inserted.', insertAccountRows)
  console.log('Initial Account row values:\n', await prisma.account.findMany())

  const updateRows = await prisma.account.updateMany({
    where: {
      balance: {
        gt: 100
      }
    },
    data: {
      balance: {
        decrement: 5
      }
    }
  })

  console.log('Account rows updated.', updateRows)
  console.log('Updated Account row values:\n', await prisma.account.findMany())

  const deleteAllRows = await prisma.customer.deleteMany()

  console.log('All Customer rows deleted.', deleteAllRows)
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
