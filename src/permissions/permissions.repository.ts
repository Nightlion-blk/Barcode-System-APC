import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.permission_tblUncheckedCreateInput) {
    return this.prisma.permission_tbl.create({ data });
  }

  findAll() {
    return this.prisma.permission_tbl.findMany({
      orderBy: { permission_id: 'asc' },
    });
  }

  findById(permissionId: number) {
    return this.prisma.permission_tbl.findUnique({
      where: { permission_id: permissionId },
    });
  }

  countAssignedRoles(permissionId: number) {
    return this.prisma.roles.count({
      where: { permission_id: permissionId },
    });
  }

  update(
    permissionId: number,
    data: Prisma.permission_tblUncheckedUpdateInput,
  ) {
    return this.prisma.permission_tbl.update({
      where: { permission_id: permissionId },
      data,
    });
  }

  delete(permissionId: number) {
    return this.prisma.permission_tbl.delete({
      where: { permission_id: permissionId },
    });
  }
}
