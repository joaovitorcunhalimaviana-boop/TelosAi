
import { prisma } from '@/lib/prisma';

async function main() {
    const patientId = 'cmirejvko0001l804ohgsf5i3';

    console.log(`Deleting patient with ID: ${patientId}...`);

    const deletedPatient = await prisma.patient.delete({
        where: {
            id: patientId,
        },
    });

    console.log(`Successfully deleted patient: ${deletedPatient.name} (${deletedPatient.id})`);
}

main()
    .catch(e => {
        console.error('Error deleting patient:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
