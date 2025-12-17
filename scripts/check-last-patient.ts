
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const lastPatient = await prisma.patient.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { surgeries: true }
    });

    if (!lastPatient) {
        console.log("No patient");
        return;
    }

    console.log(`PATIENT: ${lastPatient.name}`);
    console.log(`SURGERY_COUNT: ${lastPatient.surgeries.length}`);

    if (lastPatient.surgeries && lastPatient.surgeries.length > 0) {
        lastPatient.surgeries.forEach((s: any) => {
            console.log(`SURGERY_TYPE: ${s.type}`);
        });
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
