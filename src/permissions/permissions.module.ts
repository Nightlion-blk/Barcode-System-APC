import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller.js';
import { PermissionsRepository } from './permissions.repository.js';
import { PermissionsService } from './permissions.service.js';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsRepository, PermissionsService],
})
export class PermissionsModule {}
