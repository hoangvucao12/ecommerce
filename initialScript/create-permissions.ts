import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/shared/services/prisma.service";
import { HTTPMethod } from "src/shared/constants/role.constant";
import { RoleName } from "src/shared/constants/role.constant";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

const prismaService = new PrismaService();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  const server = app.getHttpAdapter().getInstance();
  const router = server.router;

  const permissionsInDb = await prismaService.permission.findMany({
    where: { deletedAt: null },
  });

  const availableRoutes: {
    path: string;
    method: keyof typeof HTTPMethod;
    name: string;
    module: string;
  }[] = router.stack
    .map((layer) => {
      const path = layer.route?.path;
      const method = String(
        layer.route?.stack[0]?.method,
      ).toUpperCase() as keyof typeof HTTPMethod;
      const module = String(path?.split("/")[1]).toUpperCase();
      if (layer.route) {
        return {
          path,
          method,
          module,
          name: `${method}-${path}`,
        };
      }
    })
    .filter((item) => item !== undefined);

  const permissionInDbMap = permissionsInDb.reduce((acc, permission) => {
    acc[`${permission.method}-${permission.path}`] = permission;
    return acc;
  }, {});

  const availableRoutesMap = availableRoutes.reduce((acc, route) => {
    acc[`${route.method}-${route.path}`] = route;
    return acc;
  }, {});

  const permissionsToDelete = permissionsInDb.filter((permission) => {
    const key = `${permission.method}-${permission.path}`;
    return !availableRoutesMap[key];
  });

  if (permissionsToDelete.length > 0) {
    await prismaService.permission.deleteMany({
      where: {
        id: { in: permissionsToDelete.map((permission) => permission.id) },
      },
    });
    console.log("Deleted permissions:", permissionsToDelete.length);
  } else {
    console.log("No permissions to delete.");
  }

  const routesToAdd = availableRoutes.filter((route) => {
    const key = `${route.method}-${route.path}`;
    return !permissionInDbMap[key];
  });

  if (routesToAdd.length > 0) {
    await prismaService.permission.createMany({
      data: routesToAdd,
      skipDuplicates: true,
    });
    console.log("Added permissions:", routesToAdd.length);
  } else {
    console.log("No new permissions to add.");
  }

  const updatedPermissionsInDb = await prismaService.permission.findMany({
    where: { deletedAt: null },
  });

  const adminRole = await prismaService.role.findFirstOrThrow({
    where: { name: RoleName.Admin, deletedAt: null },
  });

  await prismaService.role.update({
    where: {
      id: adminRole.id,
    },
    data: {
      permissions: {
        set: updatedPermissionsInDb.map((permission) => ({
          id: permission.id,
        })),
      },
    },
  });

  process.exit(0);
}
bootstrap();
