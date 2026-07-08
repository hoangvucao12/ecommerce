import { PrismaService } from "src/shared/services/prisma.service";
import { RoleName } from "src/shared/constants/role.constant";
import envConfig from "src/shared/config";
import { HashingService } from "src/shared/services/hashing.service";

const prismaService = new PrismaService();
const hashingService = new HashingService();

const main = async () => {
  const roleCount = await prismaService.role.count();
  if (roleCount > 0) {
    throw new Error("Roles already exist in the database. Aborting seeding.");
  }
  const roles = await prismaService.role.createMany({
    data: [
      {
        name: RoleName.Admin,
        description: "Administrator role with full access",
      },
      {
        name: RoleName.User,
        description: "Regular user role with limited access",
      },
      {
        name: RoleName.Seller,
        description: "Seller role with access to manage products",
      },
    ],
  });

  const adminRole = await prismaService.role.findFirstOrThrow({
    where: { name: RoleName.Admin },
  });

  const hashedPassword = await hashingService.hash(envConfig.ADMIN_PASSWORD);

  const adminUser = await prismaService.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      password: hashedPassword,
      name: envConfig.ADMIN_NAME,
      phoneNumber: envConfig.ADMIN_PHONENUMBER,
      roleId: adminRole.id,
    },
  });

  return {
    createdRoleCount: roles.count,
    adminUser,
  };
};

main()
  .then((result) => {
    console.log("Seeding completed successfully:", result);
  })
  .catch((error) => {
    console.error("Error occurred while seeding data:", error);
  });
