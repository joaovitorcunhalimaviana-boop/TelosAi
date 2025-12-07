
import { prisma } from '@/lib/prisma';

async function main() {
    const patients = await prisma.patient.findMany({
        take: 5,
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            user: {
                select: {
                    email: true,
                    nomeCompleto: true,
                }
            }
        }
    });

    console.log('Recent Patients:');
    patients.forEach(p => {
        console.log(`ID: ${p.id} | Name: ${p.name} | Phone: ${p.phone} | CreatedAt: ${p.createdAt} | User: ${p.user.nomeCompleto} (${p.user.email})`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
