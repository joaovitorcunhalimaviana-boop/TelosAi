import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Load .env manually
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            process.env[key] = value;
        }
    });
}

const prisma = new PrismaClient();

async function makeAdmin() {
    console.log('\n👑 PROMOVENDO JOÃO A ADMIN\n');

    try {
        // 1. Buscar o usuário (User, não Patient)
        // Assumindo que o nome do médico é João Vitor Viana
        const user = await prisma.user.findFirst({
            where: {
                nomeCompleto: {
                    contains: 'João',
                    mode: 'insensitive'
                }
            }
        });

        if (!user) {
            console.log('❌ Usuário médico não encontrado! Tentando listar todos...');
            const users = await prisma.user.findMany();
            console.log('Usuários encontrados:', users.map(u => `${u.nomeCompleto} (${u.email}) - ${u.role}`));
            return;
        }

        console.log('✅ Usuário encontrado:', user.nomeCompleto);
        console.log('   Email:', user.email);
        console.log('   Role atual:', user.role);

        // 2. Atualizar para ADMIN
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                role: 'ADMIN' // ou 'admin', dependendo do enum/string
            }
        });

        console.log('✅ Usuário promovido a ADMIN com sucesso!');

    } catch (error) {
        console.error('\n❌ ERRO:', error);
    } finally {
        await prisma.$disconnect();
    }
}

makeAdmin();
