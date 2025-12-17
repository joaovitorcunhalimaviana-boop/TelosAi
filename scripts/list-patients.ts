
import { prisma } from '@/lib/prisma';

async function main() {
    console.log('--- PATIENT LIST START ---');
    const patients = await prisma.patient.findMany();

    patients.forEach(p => {
        console.log(`ID: ${p.id} | NAME: ${p.name} | PHONE: ${p.phone}`);
    });
    console.log('--- PATIENT LIST END ---');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
