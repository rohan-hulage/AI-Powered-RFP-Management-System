import prisma from './lib/prisma';

async function main() {
    const vendors = [
        {
            name: 'TechSolutions Inc',
            email: 'abhihulage14@gmail.com',
            phone: '7558312273',
            address: '123 Tech Park, CA',
        },
        {
            name: 'Global Hardware Suppliers',
            email: 'contact@globalhardware.com',
            phone: '987-654-3210',
            address: '456 Industria Blvd, NY',
        },
        {
            name: 'Office Depot Pro',
            email: 'b2b@officedepotpro.com',
            phone: '555-555-5555',
            address: '789 Commerce St, TX',
        },
    ];

    for (const v of vendors) {
        await prisma.vendor.upsert({
            where: { email: v.email },
            update: {},
            create: v,
        });
    }

    console.log('Seed data inserted');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        // process.exit(1); 
    });
