import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Criando usuário admin inicial...");

  const adminEmail = "telos.ia@gmail.com";
  const adminPassword = "Logos1.1";

  try {
    // Verificar se admin já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("⚠️  Admin já existe. Atualizando senha...");

      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          senha: hashedPassword,
          role: "admin",
        },
      });

      console.log("✅ Senha do admin atualizada com sucesso!");
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Criar admin
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        senha: hashedPassword,
        nomeCompleto: "Telos Admin",
        role: "admin",
        plan: "founding",
        basePrice: 0,
        additionalPatientPrice: 0,
        isLifetimePrice: true,
        maxPatients: 999,
        currentPatients: 0,
        aceitoTermos: true,
        aceitoNovidades: false,
        firstLogin: false,
      },
    });

    console.log("✅ Usuário admin criado com sucesso!");
    console.log("📧 Email:", admin.email);
    console.log("🔑 Senha:", adminPassword);
    console.log("👤 Role:", admin.role);
    console.log("📦 Plano:", admin.plan);

  } catch (error) {
    console.error("❌ Erro ao criar admin:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
