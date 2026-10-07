import { Injectable } from '@nestjs/common';
import { Prisma, role_status } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.rolesUncheckedCreateInput) {
    return this.prisma.roles.create({
      data,
      include: { permission_tbl: true },
    });
  }

  findAll() {
    return this.prisma.roles.findMany({
      where: {
        OR: [
          { status: null },
          { status: { not: role_status.delete } },
        ],
      },
      include: { permission_tbl: true },
      orderBy: { role_id: 'asc' },
    });
  }

  findById(roleId: number) {
    return this.prisma.roles.findFirst({
      where: {
        role_id: roleId,
        OR: [
          { status: null },
          { status: { not: role_status.delete } },
        ],
      },
      include: { permission_tbl: true },
    });
  }

  permissionExists(permissionId: number) {
    return this.prisma.permission_tbl.findUnique({
      where: { permission_id: permissionId },
      select: { permission_id: true },
    });
  }

  update(roleId: number, data: Prisma.rolesUncheckedUpdateInput) {
    return this.prisma.roles.update({
      where: { role_id: roleId },
      data,
      include: { permission_tbl: true },
    });
  }
}
