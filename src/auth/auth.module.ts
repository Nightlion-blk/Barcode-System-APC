import { Module } from "@nestjs/common";
import { AuthService } from "./Services/auth.service.js";
import { AuthController } from "./auth.controller.js";
import { AuthRepository } from "./auth.repository.js";

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRepository],
  exports: [AuthService],
})
export class AuthModule {}