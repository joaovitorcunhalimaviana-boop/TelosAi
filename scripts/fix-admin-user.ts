import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Configurando usuário admin...");

  const adminEmail = "joaovitorcunhalimaviana@gmail.com";
  const adminPassword = "Logos1.1";

  try {
    // Verificar se admin já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    // Hash da senha
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    if (existingAdmin) {
      console.log("⚠️  Admin já existe. Atualizando...");

      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          senha: hashedPassword,
          role: "admin",
          plan: "founding",
          basePrice: 0,
          additionalPatientPrice: 0,
          isLifetimePrice: true,
          maxPatients: 999,
          currentPatients: 0,
          aceitoTermos: true,
          firstLogin: false,
        },
      });

      console.log("✅ Usuário admin atualizado com sucesso!");
    } else {
      // Criar admin
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          senha: hashedPassword,
          nomeCompleto: "Dr. João Vitor Viana",
          crm: "12831",
          estado: "PB",
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
      console.log("👤 Nome:", admin.nomeCompleto);
      console.log("📧 Email:", admin.email);
      console.log("🏥 CRM:", admin.crm, "-", admin.estado);
      console.log("👔 Role:", admin.role);
      console.log("📦 Plano:", admin.plan);
    }

    console.log("\n📝 Credenciais de acesso:");
    console.log("   Email:", adminEmail);
    console.log("   Senha:", adminPassword);
    console.log("\n✨ Você pode fazer login agora!");

  } catch (error) {
    console.error("❌ Erro ao configurar admin:", error);
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
