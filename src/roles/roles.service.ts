import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { role_status } from '../generated/prisma/client.js';
import { RolesRepository } from './roles.repository.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async create(dto: CreateRoleDto) {
    if (dto.permission_id != null) {
      const permission = await this.rolesRepository.permissionExists(
        dto.permission_id,
      );
      if (!permission) {
        throw new NotFoundException(
          `Permission ${dto.permission_id} was not found`,
        );
      }
    }
    return this.rolesRepository.create(dto);
  }

  findAll() {
    return this.rolesRepository.findAll();
  }

  async findById(roleId: number) {
    const role = await this.rolesRepository.findById(roleId);
    if (!role) {
      throw new NotFoundException(`Role ${roleId} was not found`);
    }
    return role;
  }

  async update(roleId: number, dto: UpdateRoleDto) {
    await this.findById(roleId);
    if (dto.permission_id != null) {
      const permission = await this.rolesRepository.permissionExists(
        dto.permission_id,
      );
      if (!permission) {
        throw new NotFoundException(
          `Permission ${dto.permission_id} was not found`,
        );
      }
    }
    return this.rolesRepository.update(roleId, dto);
  }

  async delete(roleId: number) {
    await this.findById(roleId);
    return this.rolesRepository.update(roleId, { status: role_status.delete });
  }
}
