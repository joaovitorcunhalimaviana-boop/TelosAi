
import { prisma } from '@/lib/prisma';

async function main() {
    const targetPhone = '(83) 99866-3089';

    console.log(`Searching for patient with phone: ${targetPhone}...`);

    const patient = await prisma.patient.findFirst({
        where: {
            phone: {
                contains: '99866-3089'
            }
        }
    });

    if (!patient) {
        console.log('Patient not found.');
        return;
    }

    console.log(`Found patient: ${patient.name} (ID: ${patient.id})`);
    console.log('Deleting...');

    await prisma.patient.delete({
        where: {
            id: patient.id
        }
    });

    console.log('Patient deleted successfully.');
}

main()
    .catch(e => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
