import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto.js';
import { UpdatePermissionDto } from './dto/update-permission.dto.js';
import { PermissionsRepository } from './permissions.repository.js';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  create(dto: CreatePermissionDto) {
    return this.permissionsRepository.create(dto);
  }

  findAll() {
    return this.permissionsRepository.findAll();
  }

  async findById(permissionId: number) {
    const permission = await this.permissionsRepository.findById(permissionId);
    if (!permission) {
      throw new NotFoundException(`Permission ${permissionId} was not found`);
    }
    return permission;
  }

  async update(permissionId: number, dto: UpdatePermissionDto) {
    await this.findById(permissionId);
    return this.permissionsRepository.update(permissionId, dto);
  }

  async delete(permissionId: number) {
    await this.findById(permissionId);
    const assignedRoles =
      await this.permissionsRepository.countAssignedRoles(permissionId);
    if (assignedRoles > 0) {
      throw new ConflictException(
        'Cannot delete a permission while roles are assigned to it',
      );
    }
    return this.permissionsRepository.delete(permissionId);
  }
}
