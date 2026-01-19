
import prisma from '../lib/prisma';

async function checkVendor() {
    const email = 'abhihulage14@gmail.com';
    const vendor = await prisma.vendor.findUnique({
        where: { email }
    });

    if (vendor) {
        console.log("Vendor found:", vendor);
    } else {
        console.log("Vendor NOT found for email:", email);
    }
}

checkVendor()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
    });
